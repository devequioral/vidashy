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

async function getRecords(organization, collection, object) {
  let collectionName = `COLEC_${organization}_${collection}_${object}`;
  await db.connect();
  const schemaObject = await getSchemaObject(collectionName);

  let schema = await getDynamicSchema(collectionName, schemaObject, true);

  const records = await schema.find({});
  await db.disconnect();

  return records;
}

export { getRecords, getSchemaObject };
