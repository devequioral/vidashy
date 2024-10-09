import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, generateUUID } from '@/utils/utils';

async function getCollections(organization_id) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = { organization_id };

  const collectionDB = database.collection('collections');

  const collections = await collectionDB.find(query).toArray();

  await client.close();

  return collections;
}

async function deleteRecentOpen(collection_id, organization_id) {
  const filter = sanitizeOBJ({ collection_id, organization_id });
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('recent_collections_open');

  try {
    const result = await collectionDB.deleteMany(filter);
    await client.close();
    if (result.deletedCount > 0) {
      return true;
    }
    return false;
  } catch (e) {
    console.log('deleteRecentOpen', e.message);
    return false;
  }
}

async function deleteDBCollection(id, organization_id) {
  const nameNewDB = `DB_${organization_id}_${id}`;
  const { client, database } = db.mongoConnect(nameNewDB);

  try {
    const collections = await database.listCollections().toArray();
    for (const _collection of collections) {
      const collection = database.collection(_collection.name);
      await collection.deleteMany({});
      await collection.drop();
    }
    await client.close();
    return true;
  } catch (e) {
    console.log('deleteDB', e.message);
    return false;
  }
}

async function deleteCollections(organization_id) {
  const collections = await getCollections(organization_id);
  if (!collections || collections.length === 0) return false;
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('collections');
  try {
    for (var i = 0; i < collections.length; i++) {
      await deleteDBCollection(collections[i].id, organization_id);
      await deleteRecentOpen(collections[i].id, organization_id);
      const filter = sanitizeOBJ({ id: collections[i].id, organization_id });
      await collectionDB.deleteOne(filter);
    }
    await client.close();
  } catch (e) {
    return false;
  }
  return true;
}

async function deleteRecord(id) {
  const filter = sanitizeOBJ({ id });
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('organizations');
  try {
    const result = await collectionDB.deleteOne(filter);
    await client.close();
    if (result.deletedCount === 1) {
      return true;
    }
    return false;
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

    const validation = {};

    if (!id || id === '') {
      validation.id = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    await deleteCollections(id);

    const record = await deleteRecord(id);

    if (!record)
      return res.status(500).send({ message: 'Record could not be deleted ' });

    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
