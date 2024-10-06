import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, generateUUID } from '@/utils/utils';

async function updateRecord(record_request) {
  const update_record = sanitizeOBJ({
    name: record_request.name,
    status: record_request.status,
    updatedAt: new Date().toISOString(),
  });

  const filter = { id: record_request.id };
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('organizations');

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

    const { record_request } = req.body;

    const validation = {};

    if (!record_request.name || record_request.name === '') {
      validation.name = 'Field Required';
    }
    if (!record_request.status || record_request.status === '') {
      record_request.status = 'active';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const record = await updateRecord(record_request);

    if (!record)
      return res
        .status(500)
        .send({ message: 'Record could not be processed ' });

    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
