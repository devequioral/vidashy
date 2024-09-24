import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, generateUUID } from '@/utils/utils';
import objectModel from '@/models/objectModel';

async function createDB(collectionName, organizationId, objectName) {
  const new_record = {};
  new_record[objectModel.columns[0].name] = generateUUID();
  new_record[objectModel.columns[1].name] = '';
  const nameNewDB = `DB_${organizationId}_${collectionName}`;
  const { client, database } = db.mongoConnect(nameNewDB);
  const collectionDB = database.collection(objectName);

  try {
    const record = await collectionDB.insertOne(new_record);
    await client.close();
    return { record };
  } catch (e) {
    console.log(e);
    return { record: {} };
  }
}

async function createObject(id, collectionName, organizationId, objectName) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  let query = sanitizeOBJ({ id, organization_id: organizationId });

  const collectionDB = database.collection('collections');

  const records = await collectionDB
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  if (!records) {
    await client.close();
    return 'Collection not found';
  }

  const collection = records[0];

  //VERIFY IF OBJECT EXISTS
  const object_found = collection.objects.find((object) => {
    return object.name === objectName;
  });

  if (object_found) {
    await client.close();
    return 'Object Already Exists';
  }

  objectModel.id = generateUUID();
  objectModel.name = objectName;

  collection.objects.push(objectModel);

  const filter = { ...query };

  const update_record = {
    objects: collection.objects,
  };

  try {
    const record = await collectionDB.updateOne(filter, {
      $set: update_record,
    });
    if (record) createDB(collectionName, organizationId, objectName);
    await client.close();
    return true;
  } catch (e) {
    return 'Something going wrong';
  }
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    if (token.role !== 'admin')
      return res.status(401).send({ message: 'User Not authorized' });

    const { collectionId, collectionName, organizationId, objectName } =
      req.body;

    const validation = {};

    if (!collectionId) {
      validation.collectionId = 'Field Required';
    }
    if (!collectionName) {
      validation.collectionName = 'Field Required';
    }
    if (!organizationId) {
      validation.organizationId = 'Field Required';
    }
    if (!objectName) {
      validation.objectName = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const record = await createObject(
      collectionId,
      collectionName,
      organizationId,
      objectName
    );

    if (record !== true)
      return res.status(500).send({
        message:
          typeof record === 'string'
            ? record
            : 'Record could not be processed ',
      });

    res.status(200).json({ record });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
