import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';

async function getRecord(
  collectionName,
  organizationId,
  objectName,
  page = 1,
  pageSize = 20
) {
  const dbName = `DB_${organizationId}_${collectionName}`;

  const { client, database } = db.mongoConnect(dbName);

  let query = {};

  const collectionDB = database.collection(objectName);

  const total = await collectionDB.countDocuments(query);

  const totalPages = Math.ceil(total / pageSize);

  const skip = (page - 1) * pageSize;

  const records = await collectionDB
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number.parseInt(pageSize))
    .toArray();

  await client.close();

  return { records, total, page, totalPages };
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    if (token.role !== 'admin')
      return res.status(401).send({ message: 'User Not authorized' });

    const { collectionName, organizationId, objectName, page, pageSize } =
      req.body;

    const data = await getRecord(
      collectionName,
      organizationId,
      objectName,
      page,
      pageSize
    );

    if (!data || !data.records || data.records.length === 0)
      return res.status(404).send({ data, message: 'Records Not found' });

    //REMOVE SENSIBLE DATA OF RECORDS
    data.records.map((_record) => {
      delete _record._id;
      delete _record.updatedAt;
    });

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
