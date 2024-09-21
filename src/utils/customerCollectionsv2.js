import db from '@/utils/db';
import { consoleError } from './error';
import { v4 as uuidv4 } from 'uuid';
import recordEmitter from '@/utils/Events';
import { sanitizeOBJ, sanitize, generateUUID } from '@/utils/utils';
import buckets from '@/data/buckets.json';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function _getMetadataCollection(request) {
  const { organization, collection, object } = request;
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const query = sanitizeOBJ({
    id: collection,
    organization_id: organization,
  });

  const collectionDB = await database.collection('collections').findOne(query);
  await client.close();

  if (!collectionDB) return false;

  let metadata = {};

  collectionDB.objects.map((_obj) => {
    if (_obj.name === object) {
      metadata = _obj;
    }
  });

  return metadata;
}

async function getRecords(request) {
  const { organization, collectionName, object, params } = request;

  // const page = params.page ? parseInt(params.page) : 1;
  // const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;
  let page = 1;
  let pageSize = 10;

  let query = {};

  let options = params.options;

  if (options) {
    options = options.replaceAll('"and":', '"$and":');
    options = options.replaceAll('"or":', '"$or":');
    options = options.replaceAll('"regex":', '"$regex":');
    options = options.replaceAll('"optionsRegex":', '"$options":');

    options = JSON.parse(options);
  }

  if (options && options.filter) {
    query = options.filter;
    page = options.page ? parseInt(options.page) : page;
    pageSize = options.pageSize ? parseInt(options.pageSize) : pageSize;
  } else {
    page = params.page ? parseInt(params.page) : 1;
    pageSize = params.pageSize ? parseInt(params.pageSize) : 10;
    const filterBy = params.filterBy ? params.filterBy.split(',') : [];
    const filterValue = params.filterValue ? params.filterValue.split(',') : [];
    const filterComparison = params.filterComparison
      ? params.filterComparison.split(',')
      : [];
    const filterCondition =
      params.filterCondition && params.filterCondition !== 'undefined'
        ? params.filterCondition
        : 'and';

    const filter = [];
    if (filterBy) {
      filterBy.map((item, index) => {
        filter.push({
          field: item,
          value: filterValue[index],
          comparison: filterComparison[index] ? filterComparison[index] : 'eq',
        });
      });
    }
    if (filterCondition === 'or') query = { $or: [] };
    else query = { $and: [] };

    filter.forEach((item) => {
      if (item.comparison === 'eq')
        query[`$${filterCondition}`].push({ [item.field]: item.value });
      else if (item.comparison === 'gt')
        query[`$${filterCondition}`].push({
          [item.field]: { $gt: item.value },
        });
      else if (item.comparison === 'lt')
        query[`$${filterCondition}`].push({
          [item.field]: { $lt: item.value },
        });
      else if (item.comparison === 'gte')
        query[`$${filterCondition}`].push({
          [item.field]: { $gte: item.value },
        });
      else if (item.comparison === 'lte')
        query[`$${filterCondition}`].push({
          [item.field]: { $lte: item.value },
        });
      else if (item.comparison === 'ne')
        query[`$${filterCondition}`].push({
          [item.field]: { $ne: item.value },
        });
      else if (item.comparison === 'in')
        query[`$${filterCondition}`].push({
          [item.field]: { $in: item.value.split('|') },
        });
      else if (item.comparison === 'nin')
        query[`$${filterCondition}`].push({
          [item.field]: { $nin: item.value.split('|') },
        });
      else if (item.comparison === 'regex') {
        query[`$${filterCondition}`].push({
          [item.field]: { $regex: item.value, $options: 'i' },
        });
      } else if (item.comparison === 'exists')
        query[`$${filterCondition}`].push({
          [item.field]: { $exists: item.value === 'true' },
        });
      else query[`$${filterCondition}`].push({ [item.field]: item.value });
    });

    if (query[`$${filterCondition}`].length === 0)
      delete query[`$${filterCondition}`];
  }

  let sortBy = [];
  let sortValue = [];

  if (options && options.sortBy) {
    sortBy = options.sortBy.split(',');
  } else if (params.sortBy) {
    sortBy = params.sortBy.split(',');
  }

  if (options && options.sortValue) {
    sortValue = options.sortValue.split(',');
  } else if (params.sortValue) {
    sortValue = params.sortValue.split(',');
  }

  const sort = [];
  if (sortBy) {
    sortBy.map((item, index) => {
      sort.push({
        field: item,
        value: sortValue.length >= index ? sortValue[index] : -1,
      });
    });
  }

  if (sort.length === 0) sort.push({ field: 'createdAt', value: -1 });

  let sortDB = {};
  sort.forEach((item) => {
    sortDB[item.field] = item.value;
  });

  let dataBaseName = sanitize(`DB_${organization}_${collectionName}`);

  const skip = (page - 1) * pageSize;
  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize(object));

  query = sanitizeOBJ(query);
  sortDB = sanitizeOBJ(sortDB);

  const total = await collectionDB.countDocuments(query);
  const totalPages = Math.ceil(total / pageSize);
  const records = await collectionDB
    .find(query)
    .sort(sortDB)
    .skip(skip)
    .limit(pageSize)
    .toArray();

  await client.close();

  return { records, total, page, totalPages };
}

//CREATE RECORD FUNCTION
async function createRecord(request) {
  const metadata = await _getMetadataCollection(request);

  if (metadata === false) return { record: {} };

  const { organization, collection, collectionName, object, body, files } =
    request;
  let dataBaseName = `DB_${organization}_${collectionName}`;

  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize(object));

  //ADD TO BODY THE CREATEDAT AND UPDATEDAT FIELDS
  const new_record = {};
  for (var i = 0; i < metadata.columns.length; i++) {
    const column = metadata.columns[i];
    if (column.type === 'text') {
      new_record[column.name] = sanitize(body[column.name]);
    } else if (column.type === 'gallery') {
      new_record[column.name] = await processGallery(
        request,
        body[column.name]
      );
    }
  }

  new_record._uid = generateUUID();
  new_record.createdAt = new Date().toISOString();
  new_record.updatedAt = new Date().toISOString();

  try {
    const record = await collectionDB.insertOne(new_record);
    await client.close();
    recordEmitter.emit('recordCreated', {
      dbResponse: record,
      organization,
      collectionName,
      object,
      new_record,
    });
    return { record };
  } catch (e) {
    return { record: {} };
  }
}

//DELETE RECORD FUNCTION
async function deleteRecord(request) {
  const { organization, collectionName, object, body } = request;
  let dataBaseName = `DB_${organization}_${collectionName}`;

  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize(object));

  const _uid = sanitize(body._uid);

  if (!_uid) return false;

  try {
    try {
      // Delete the record
      const result = await collectionDB.deleteOne({ _uid });
      await client.close();
      if (result.deletedCount === 1) {
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error occurred while trying to delete document:', e);
      return { result: {} };
    }
  } catch (e) {
    return { record: {} };
  }
}

//UPDATE RECORD FUNCTION
async function updateRecord(request) {
  const metadata = await _getMetadataCollection(request);

  if (metadata === false) return { record: {} };
  const { organization, collectionName, object, body } = request;
  let dataBaseName = `DB_${organization}_${collectionName}`;

  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize(object));

  const { _uid } = body;

  if (!_uid) return { record: {} };

  //ADD TO BODY THE UPDATEDAT FIELDS
  const update_record = {};

  metadata.columns.map((column) => {
    update_record[column.name] = sanitize(body[column.name]);
  });

  update_record.updatedAt = new Date().toISOString();

  const filter = sanitizeOBJ({ _uid });

  try {
    const record = await collectionDB.updateOne(filter, {
      $set: update_record,
    });

    await client.close();

    recordEmitter.emit('recordUpdated', {
      dbResponse: record,
      organization,
      collectionName,
      object,
      new_record: update_record,
    });

    return { record };
  } catch (e) {
    return { record: {} };
  }
}

async function uploadToAWS(bucket, file) {
  try {
    const client = new S3Client({
      region: process.env[`AWS_REGION_${bucket.id}`],
      credentials: {
        accessKeyId: process.env[`AWS_ACCESS_KEY_ID_${bucket.id}`],
        secretAccessKey: process.env[`AWS_SECRET_ACCESS_KEY_${bucket.id}`],
      },
    });

    const { Body, ContentType, FileSize, Key } = ((file) => {
      if (!file || !file.filepath) {
        return { Body: null, ContentType: null, FileSize: null, Key: null };
      }
      const fs = require('fs');
      return {
        Body: fs.createReadStream(file.filepath),
        ContentType: file.mimetype,
        FileSize: file.size,
        Key: uuidv4(),
      };
    })(file);

    if (Body === null) {
      return res.status(500).json({ error: 'File Not Found' });
    }

    if (FileSize / (1024 * 1024) > 5) {
      return res.status(500).json({ error: 'File size too large. 5MB max.' });
    }

    const response = await client.send(
      new PutObjectCommand({
        Bucket: process.env[`AWS_BUCKET_NAME_${bucket.id}`],
        Key,
        Body,
        ACL: 'public-read',
        ContentType,
      })
    );

    if (response['$metadata'].httpStatusCode === 200) {
      const URL = `https://${
        process.env[`AWS_BUCKET_NAME_${bucket.id}`]
      }.s3.amazonaws.com/${Key}`;
      return { ok: 200, Key, URL, ContentType, FileSize };
    }

    return false;
  } catch (error) {
    //console.log(error.message);
    return false;
  }
}

async function processGallery(request, field) {
  const { organization, collection, body, files } = request;
  const value = [];
  const bucket = buckets.find((b) => {
    return b.organization === organization;
  });

  if (!bucket) return '';

  const field_metadata = field[0].split('|');
  const suffix_photos = field_metadata[0];
  const number_photos = Number.parseInt(field_metadata[1]);

  if (bucket.type === 'AWS') {
    for (var i = 0; i < number_photos; i++) {
      const file = files[`${suffix_photos}-${i + 1}`][0];
      const original_name = body[`${suffix_photos}-${i + 1}-name`][0];
      const mimetype = body[`${suffix_photos}-${i + 1}-mimetype`][0];
      const id = generateUUID(6);
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/media/${organization}/${collection}/${id}/${original_name}`;
      const respAWS = await uploadToAWS(bucket, file);
      if (
        respAWS !== false &&
        saveMediaInDB(request, respAWS.URL, mimetype, original_name, id, url)
      ) {
        value.push({
          key: respAWS.Key,
          private_url: respAWS.URL,
          mimetype,
          original_name,
          id,
          url,
        });
      }
    }
  }
  return value;
}

//SAVE MEDIA IN DB
async function saveMediaInDB(
  request,
  private_url,
  mimetype,
  original_name,
  id,
  url
) {
  const { organization, collectionName } = request;
  let dataBaseName = `DB_${organization}_${collectionName}`;

  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize('media'));

  //ADD TO BODY THE CREATEDAT AND UPDATEDAT FIELDS
  const new_record = sanitizeOBJ({
    private_url,
    id,
    url,
    mimetype,
    original_name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  try {
    const record = await collectionDB.insertOne(new_record);
    await client.close();
    return true;
  } catch (e) {
    return false;
  }
}

export { getRecords, createRecord, deleteRecord, updateRecord };
