import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';

async function getRecords(
  organization_id = '',
  page = 1,
  pageSize = 50,
  status = 'all',
  search = ''
) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = {};
  if (organization_id) query.organization_id = organization_id;
  if (status !== 'all') {
    query.status = status;
  }

  if (search) {
    query.name = { $regex: `.*${search}.*`, $options: 'i' };
  }

  const collectionDB = database.collection('recent_collections_open');

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

    const { organization_id, page, pageSize, status, search } = req.query;

    const data = await getRecords(
      organization_id,
      page,
      pageSize,
      status,
      search
    );

    if (!data || !data.records || data.records.length === 0)
      return res.status(404).send({ data, message: 'Records Not found' });

    //REMOVE SENSIBLE DATA OF RECORDS
    data.records.map((_record) => {
      delete _record._id;
      _record.date = _record.updatedAt;
      delete _record.updatedAt;
    });

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
