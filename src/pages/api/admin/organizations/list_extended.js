import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, sanitize } from '@/utils/utils';

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

async function getOrganizations(
  page = 1,
  pageSize = 20,
  status = 'all',
  search = ''
) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = {};
  if (status !== 'all') {
    query.status = sanitize(status);
  }

  if (search) {
    query.name = sanitizeOBJ({ $regex: `.*${search}.*`, $options: 'i' });
  }

  const collectionDB = database.collection('organizations');

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

    const { page, pageSize, status, search } = req.query;

    const organizations = await getOrganizations(
      page,
      pageSize,
      status,
      search
    );

    if (
      !organizations ||
      !organizations.records ||
      organizations.records.length === 0
    )
      return res
        .status(404)
        .send({ organizations, message: 'Records Not found' });

    const collections = await getCollections();

    if (collections && collections.records.length > 0)
      organizations.records.map((organization) => {
        collections.records.map((collection) => {
          if (collection.organization_id === organization.id) {
            if (!organization.collections) organization.collections = [];
            organization.collections.push(collection);
          }
        });
      });

    //REMOVE SENSIBLE DATA OF RECORDS
    organizations.records.map((_record) => {
      delete _record._id;
    });

    res.status(200).json({ organizations });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
