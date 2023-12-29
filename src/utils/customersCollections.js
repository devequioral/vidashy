import db from '@/utils/db';
import { getDynamicSchema } from '@/models/DynamicModel';
import { consoleError } from './error';

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
  body.createdAt = new Date().toISOString();
  body.updatedAt = new Date().toISOString();

  const record = await collectionDB.insertOne(body);

  await client.close();

  return { record };
}

export { getRecords, createRecord };
