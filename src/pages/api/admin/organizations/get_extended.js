import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';

async function getCollections(
  organization_id,
  page = 1,
  pageSize = 100,
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

  const collectionDB = database.collection('collections');

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

async function getOrganization(id) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = { id };

  const collectionDB = database.collection('organizations');

  const records = await collectionDB
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  await client.close();

  return { records };
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    if (token.role !== 'admin')
      return res.status(401).send({ message: 'User Not authorized' });

    const { id } = req.query;

    const data = await getOrganization(id);

    if (!data || !data.records || data.records.length === 0)
      return res.status(404).send({ message: 'Records Not found' });

    const organization = data.records[0];

    const collections = await getCollections(organization.id);

    organization.collections = collections.records || [];

    //REMOVE SENSIBLE DATA OF RECORDS
    delete organization._id;
    delete organization._updateAt;
    if (organization.collections)
      organization.collections.map((_record) => {
        delete _record._id;
        delete _record.updatedAt;
      });

    res.status(200).json({ organization });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
