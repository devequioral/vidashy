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

async function updateRecord(record_request) {
  const update_record = sanitizeOBJ({
    name: record_request.name,
    username: record_request.username,
    email: record_request.email,
    role: record_request.role,
    updatedAt: new Date().toISOString(),
  });
  if (record_request.password) {
    const salt = `$2a$10$${process.env.BCRIPT_SALT}`;
    const hash = bcryptjs.hashSync(record_request.password, salt);
    update_record.password = hash;
  }

  const filter = { id: record_request.id };
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('users');

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

async function verifyUsername(id, username) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('users');
  const user = await collectionDB
    .find({ username: username, id: { $ne: id } })
    .toArray();
  await client.close();
  return user;
}

async function verifyEmail(id, email) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('users');
  const user = await collectionDB
    .find({ email: email, id: { $ne: id } })
    .toArray();
  await client.close();
  return user;
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
    if (!record_request.username || record_request.username === '') {
      validation.username = 'Field Required';
    }
    if (!record_request.email || record_request.email === '') {
      validation.email = 'Field Required';
    }
    if (!record_request.role || record_request.role === '') {
      validation.role = 'Field Required';
    }

    //VERIFY IF USERNAME EXISTS
    if (record_request.email && record_request.email !== '') {
      const user = await verifyUsername(
        record_request.id,
        record_request.username
      );
      if (user.length > 0) {
        validation.username = 'Username already exists';
      }
    }

    //VERIFY IF EMAIL EXISTS
    if (record_request.email && record_request.email !== '') {
      const user = await verifyEmail(record_request.id, record_request.email);
      if (user.length > 0) {
        validation.email = 'Email already exists';
      }
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
