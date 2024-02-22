import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ } from '@/utils/utils';

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
  const new_record = sanitizeOBJ({
    id: `${record_request.organization_id}_${record_request.collection}_${record_request.object}_${record_request.trigger}`,
    organization_id: record_request.organization_id,
    collection: record_request.collection,
    object: record_request.object,
    trigger: record_request.trigger,
    status: record_request.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  new_record.automations = record_request.automations;

  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('automations');

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

    if (
      !record_request.organization_id ||
      record_request.organization_id === ''
    ) {
      validation.organization_id = 'Field Required';
    }

    if (!record_request.collection || record_request.collection === '') {
      validation.collection = 'Field Required';
    }
    if (!record_request.object || record_request.object === '') {
      validation.object = 'Field Required';
    }
    if (!record_request.trigger || record_request.trigger === '') {
      validation.trigger = 'Field Required';
    }
    if (!record_request.status || record_request.status === '') {
      validation.status = 'Field Required';
    }

    if (!record_request.automations || record_request.automations === '') {
      validation.automations = 'Field Required';
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
