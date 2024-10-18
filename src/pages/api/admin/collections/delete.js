import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';
import { sanitizeOBJ, generateUUID } from '@/utils/utils';

async function deleteRecord(id) {
  const filter = sanitizeOBJ({ id });
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('collections');

  try {
    const result = await collectionDB.deleteOne(filter);
    await client.close();
    if (result.deletedCount === 1) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function deleteRecentOpen(collection_id, organization_id) {
  const filter = sanitizeOBJ({ collection_id, organization_id });
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('recent_collections_open');

  try {
    const result = await collectionDB.deleteMany(filter);
    await client.close();
    if (result.deletedCount > 0) {
      return true;
    }
    return false;
  } catch (e) {
    console.log('deleteRecentOpen', e.message);
    return false;
  }
}

async function deleteApiAccess(collection_id, organization_id) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('apiaccessv2');

  try {
    const apiAccessRecords = await collectionDB.find({}).toArray();
    if (apiAccessRecords && apiAccessRecords.length > 0) {
      for (let i = 0; i < apiAccessRecords.length; i++) {
        const api = apiAccessRecords[i];
        const _access = [...api.access];
        const access_to_remove = [];
        const api_id = api.id;
        if (_access && _access.length > 0) {
          _access.map((item_access, ii) => {
            if (
              item_access === collection_id ||
              item_access === `ALL_COLLECTIONS:${organization_id}`
            ) {
              access_to_remove.push(ii);
            }
          });
          if (access_to_remove.length > 0) {
            access_to_remove.map((accessR) => {
              _access.splice(accessR, 1);
            });
            const update_record = {
              access: _access,
              updatedAt: new Date().toISOString(),
            };
            const filter = { id: api_id };

            await collectionDB.updateOne(filter, {
              $set: update_record,
            });
          }
        }
      }
    }
    await client.close();
    return true;
  } catch (e) {
    console.log('deleteApiAccess', e.message);
    return false;
  }
}

async function deleteDB(id, organization_id) {
  const nameNewDB = `DB_${organization_id}_${id}`;
  const { client, database } = db.mongoConnect(nameNewDB);

  try {
    const collections = await database.listCollections().toArray();
    for (const _collection of collections) {
      const collection = database.collection(_collection.name);
      await collection.deleteMany({});
      await collection.drop();
    }
    await client.close();
    return true;
  } catch (e) {
    console.log('deleteDB', e.message);
    return false;
  }
}

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token) return res.status(401).send({ message: 'Not authorized' });

    if (token.role !== 'admin')
      return res.status(401).send({ message: 'User Not authorized' });

    const { id, organization_id } = req.query;

    const validation = {};

    if (!id || id === '') {
      validation.id = 'Field Required';
    }
    if (!organization_id || organization_id === '') {
      validation.organization_id = 'Field Required';
    }

    //EVALUATE IF VALIDATION IS NOT EMPTY
    if (Object.keys(validation).length > 0) {
      return res.status(500).send({
        message: 'Record could not be processed',
        validation,
      });
    }

    const deleteRec = await deleteRecord(id);

    if (!deleteRec)
      return res
        .status(500)
        .send({ message: 'Record could not be deleted 01' });

    await deleteDB(id, organization_id);
    await deleteRecentOpen(id, organization_id);
    await deleteApiAccess(id, organization_id);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error getting token or session:', error);
  }
}
