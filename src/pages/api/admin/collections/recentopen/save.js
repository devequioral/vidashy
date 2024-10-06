import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, generateUUID } from '@/utils/utils';
import md5 from 'md5';

async function getCollection(id) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = sanitizeOBJ({ id });

  const collectionDB = database.collection('collections');

  const records = await collectionDB
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  await client.close();

  return records && records.length > 0 ? records[0] : false;
}

async function getOrganization(id) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = sanitizeOBJ({ id });

  const collectionDB = database.collection('organizations');

  const records = await collectionDB
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  await client.close();

  return records && records.length > 0 ? records[0] : false;
}

async function saveRecord(id) {
  const collection = await getCollection(id);
  if (!collection) return false;
  const organization = await getOrganization(collection.organization_id);
  if (!organization) return false;
  const id_new_record = md5(`${id}-${organization.id}`);
  const update_record = sanitizeOBJ({
    id: id_new_record,
    collection_id: id,
    collection_name: collection.name,
    organization_id: organization.id,
    organization_name: organization.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('recent_collections_open');
  const filter = { id: id_new_record };

  try {
    const record = await collectionDB.updateOne(
      filter,
      {
        $set: update_record,
      },
      {
        upsert: true,
      }
    );
    await client.close();
    return record ? true : false;
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    if (token.role !== 'admin')
      return res.status(401).send({ message: 'User Not authorized' });

    const { id } = req.query;

    const response = await saveRecord(id);

    if (response === false)
      return res.status(404).send({ success: false, message: 'Fail' });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
