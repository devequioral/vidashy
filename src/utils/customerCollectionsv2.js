import db from '@/utils/db';
import { consoleError } from './error';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import recordEmitter from '@/utils/Events';
import { sanitizeOBJ, sanitize, generateUUID } from '@/utils/utils';
import { Formidable } from 'formidable';

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

  const { organization, collectionName, object, body } = request;
  let dataBaseName = `DB_${organization}_${collectionName}`;

  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize(object));

  //ADD TO BODY THE CREATEDAT AND UPDATEDAT FIELDS
  const new_record = {};

  metadata.columns.map((column) => {
    new_record[column.name] = sanitize(body[column.name]);
  });

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

//SAVE MEDIA IN DB
async function saveMediaInDB(request, private_url, key) {
  const { organization, collectionName, object, body } = request;
  let dataBaseName = `DB_${organization}_${collectionName}`;

  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize('media'));

  //ADD TO BODY THE CREATEDAT AND UPDATEDAT FIELDS
  const new_record = {};
  new_record._uid = generateUUID();
  new_record.private_url = URL;
  new_record.key = key;
  new_record.url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/media/`;
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

export { getRecords, createRecord, deleteRecord, updateRecord, saveMediaInDB };
