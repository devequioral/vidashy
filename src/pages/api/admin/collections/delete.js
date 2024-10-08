import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, generateUUID } from '@/utils/utils';

async function deleteRecord(id) {
  const filter = sanitizeOBJ({ id });
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('collections');

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

async function deleteDB(id, organization_id) {
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
    console.log(e.message);
    return false;
  }
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    if (token.role !== 'admin')
      return res.status(401).send({ message: 'User Not authorized' });

    const { id, organization_id } = req.query;

    const validation = {};

    if (!id || id === '') {
      validation.id = 'Field Required';
    }
    if (!organization_id || organization_id === '') {
      validation.organization_id = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const deleteRec = await deleteRecord(id);

    if (!deleteRec)
      return res
        .status(500)
        .send({ message: 'Record could not be deleted 01' });

    const deletedb = await deleteDB(id, organization_id);

    if (!deletedb)
      return res
        .status(500)
        .send({ message: 'Record could not be deleted 02' });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
