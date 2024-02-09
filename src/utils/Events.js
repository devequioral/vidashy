import EventEmitter from 'events';
import db from '@/utils/db';

class RecordEmitter extends EventEmitter {}

const recordEmitter = new RecordEmitter();

recordEmitter.on('recordCreated', async (record) => {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('automations');
  const query = {
    uid: `${record.organization}_${record.collection}_${record.object}_recordCreated`,
  };
  const automationsDB = await collectionDB.findOne(query);
  await client.close();

  if (!automationsDB) return;

  automationsDB.automations.map(async (automation) => {
    if (automation.action === 'createNotification') {
      const createNotifications = await import(
        '@/automations/createNotifications'
      );
      createNotifications.default.start({ automation, record });
    }
  });
});

recordEmitter.on('recordUpdated', async (record) => {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('automations');
  const query = {
    uid: `${record.organization}_${record.collection}_${record.object}_recordUpdated`,
  };
  const automationsDB = await collectionDB.findOne(query);
  await client.close();

  if (!automationsDB) return;

  automationsDB.automations.map(async (automation) => {
    if (automation.action === 'createNotification') {
      const createNotifications = await import(
        '@/automations/createNotifications'
      );
      createNotifications.default.start({ automation, record });
    }
  });
});

export default recordEmitter;
