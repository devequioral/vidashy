import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ } from '@/utils/utils';
import generateApiKey from 'generate-api-key';

function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0;
    // eslint-disable-next-line no-bitwise
    d = Math.floor(d / 16);
    // eslint-disable-next-line no-bitwise
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

async function createRecord(record_request) {
  const apikey = generateApiKey({ method: 'bytes', length: 48 });
  const new_record = sanitizeOBJ({
    id: generateUUID(),
    name: record_request.name,
    description: record_request.description,
    status: 'active',
    organization_id: record_request.organization_id,
    apiaccess: [
      {
        apikey,
        permissions: [
          {
            collectionName: record_request.collectionName,
            object: {
              name: record_request.objectName,
              methods: record_request.permissions,
            },
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('apiaccess');

  try {
    const record = await collectionDB.insertOne(new_record);
    await client.close();
    return { data: { records: [{ ...new_record }] } };
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
    if (!record_request.description || record_request.description === '') {
      validation.description = 'Field Required';
    }
    if (
      !record_request.organization_id ||
      record_request.organization_id === ''
    ) {
      validation.organization_id = 'Field Required';
    }
    if (!record_request.permissions || record_request.permissions === '') {
      validation.permissions = 'Field Required';
    }

    if (!record_request.objectName || record_request.objectName === '') {
      validation.objectName = 'Field Required';
    }

    if (
      !record_request.collectionName ||
      record_request.collectionName === ''
    ) {
      validation.collectionName = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const records = await createRecord(record_request);

    if (!records)
      return res
        .status(500)
        .send({ message: 'Record could not be processed ' });

    res.status(200).json({ ...records });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
