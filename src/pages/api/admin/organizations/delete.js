import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, generateUUID } from '@/utils/utils';

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

    const record = await deleteRecord(id);

    if (!record)
      return res.status(500).send({ message: 'Record could not be deleted ' });

    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
