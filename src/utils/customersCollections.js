import db from '@/utils/db';
import { consoleError } from './error';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

async function getRecords(request) {
  const { organization, collection, object, params } = request;
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;
  const filterBy = params.filterBy ? params.filterBy.split(',') : [];
  const filterValue = params.filterValue ? params.filterValue.split(',') : [];

  const filter = [];
  if (filterBy) {
    filterBy.map((item, index) => {
      filter.push({
        field: item,
        value: filterValue[index],
      });
    });
  }

  let query = {};
  filter.forEach((item) => {
    query[item.field] = item.value;
  });

  let dataBaseName = `DB_${organization}_${collection}`;
  const skip = (page - 1) * pageSize;
  const { client, database } = db.mongoConnect(dataBaseName);

  const collectionDB = database.collection(object);

  const total = await collectionDB.countDocuments(query);

  const totalPages = Math.ceil(total / pageSize);

  const records = await collectionDB
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  await client.close();

  return { records, total, page, totalPages };
}

//CREATE RECORD FUNCTION
async function createRecord(request) {
  const { organization, collection, object, body } = request;
  let dataBaseName = `DB_${organization}_${collection}`;

  const { client, database } = db.mongoConnect(dataBaseName);

  const collectionDB = database.collection(object);

  //ADD TO BODY THE CREATEDAT AND UPDATEDAT FIELDS

  const new_record = {
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const record = await collectionDB.insertOne(new_record);

  await client.close();

  return { record };
}

//CREATE RECORD FUNCTION
async function prepareUpload(request) {
  const { body } = request;

  const { filename, contentType } = body;

  try {
    const client = new S3Client({ region: process.env.AWS_REGION });
    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uuidv4(),
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
        ['starts-with', '$Content-Type', contentType],
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    });

    return { url, fields };
  } catch (error) {
    return {};
  }
}

export { getRecords, createRecord, prepareUpload };
