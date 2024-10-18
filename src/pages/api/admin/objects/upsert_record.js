import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ } from '@/utils/utils';

async function updateRecord(
  collectionId,
  organizationId,
  objectName,
  _uid,
  columnKey,
  new_value
) {
  const record_request = {};
  record_request[columnKey] = new_value;
  const update_record = sanitizeOBJ({
    ...record_request,
  });
  const dbName = `DB_${organizationId}_${collectionId}`;

  const filter = { _uid };
  const { client, database } = db.mongoConnect(dbName);
  const collectionDB = database.collection(objectName);

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

    const {
      collectionId,
      organizationId,
      objectName,
      _uid,
      columnKey,
      new_value,
    } = req.body;

    const record = await updateRecord(
      collectionId,
      organizationId,
      objectName,
      _uid,
      columnKey,
      new_value
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
