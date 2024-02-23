import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ } from '@/utils/utils';

function generateUUID(length) {
  let d = new Date().getTime();
  const uuid = Array(length + 1)
    .join('x')
    .replace(/[x]/g, (c) => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  return uuid.slice(0, length);
}

async function createRecord(record_request) {
  const new_record = sanitizeOBJ({
    id: generateUUID(12),
    name: record_request.name,
    status: record_request.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('organizations');

  try {
    const record = await collectionDB.insertOne(new_record);
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
      validation.status = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const record = await createRecord(record_request);

    if (!record)
      return res
        .status(500)
        .send({ message: 'Record could not be processed ' });

    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
