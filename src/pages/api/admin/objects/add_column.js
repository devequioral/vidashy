import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ } from '@/utils/utils';

async function getCollection(collectionId, organizationId) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = { id: collectionId };

  const collectionDB = database.collection('collections');

  const records = await collectionDB
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  await client.close();

  return { records };
}

async function addColumn(collectionId, organizationId, objectId, column) {
  const collection = await getCollection(collectionId, organizationId);
  if (!collection || !collection.records) return null;

  const objects = collection.records[0]['objects'];
  let founded = false;
  objects.map((object) => {
    if (object.id === objectId) {
      object.columns.push(column);
    }
  });
  const record_request = {
    objects,
  };
  const update_record = sanitizeOBJ({
    ...record_request,
  });

  const filter = { id: collectionId, organization_id: organizationId };
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('collections');

  try {
    const record = await collectionDB.updateOne(filter, {
      $set: update_record,
    });
    await client.close();
    return { record };
  } catch (e) {
    return { record: {} };
  }
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    if (token.role !== 'admin')
      return res.status(401).send({ message: 'User Not authorized' });

    const { collectionId, organizationId, objectId, column } = req.body;

    const record = await addColumn(
      collectionId,
      organizationId,
      objectId,
      column
    );

    if (!record)
      return res
        .status(500)
        .send({ message: 'Record could not be processed ' });

    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
