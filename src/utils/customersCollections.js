import db from '@/utils/db';
import { getDynamicSchema } from '@/models/DynamicModel';

async function getSchemaObject(collectionName) {
  let schemaObject = {};
  collectionName += `_def`;

  await db.connect();
  let schema = await getDynamicSchema(
    collectionName,
    {
      columns: { type: String, required: true },
    },
    true
  );

  const value = await schema.find({});

  const columns = JSON.parse(value[0].columns);

  schemaObject = columns.reduce((obj, item) => {
    obj[item.name] = item.structure;
    return obj;
  }, {});

  await db.disconnect();

  return schemaObject;
}

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

  let collectionName = `COLEC_${organization}_${collection}_${object}`;
  const skip = (page - 1) * pageSize;
  await db.connect();
  const schemaObject = await getSchemaObject(collectionName);

  let schema = getDynamicSchema(collectionName, schemaObject, true);

  const total = await schema.find(query).countDocuments();

  const records = await schema.find(query).skip(skip).limit(pageSize);
  await db.disconnect();

  return { records, total, page };
}

export { getRecords, getSchemaObject };
