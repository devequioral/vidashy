import EventEmitter from 'events';
import db from '@/utils/db';

function getValueFromField(record, field) {
  let keys = field.split('.');
  let value = record;
  for (let key of keys) {
    if (key === 'last') {
      key = value.length - 1;
    }
    value = value[key];
  }
  return value;
}

function checkConditions(record, conditions) {
  if (!conditions || conditions.length === 0) return false;
  let response = false;
  for (let condition of conditions) {
    if (record.hasOwnProperty(condition.field)) {
      let fieldValue = getValueFromField(record, condition.field); //
      if (condition.operator === 'eq') {
        response = fieldValue === condition.value;
      }
      if (condition.operator === 'isNotEmpty') {
        response = fieldValue;
      }
      if (condition.operator === 'isEmpty') {
        response = !fieldValue;
      }
    } else {
      for (let key in record) {
        if (typeof record[key] === 'object' && record[key] !== null) {
          response = checkConditions(record[key], conditions);
        }
      }
    }
  }
  return response;
}

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
      if (
        automation.conditions &&
        !checkConditions(record.new_record, automation.conditions)
      )
        return;

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
      if (
        automation.conditions &&
        !checkConditions(record.new_record, automation.conditions)
      )
        return;

      const createNotifications = await import(
        '@/automations/createNotifications'
      );
      createNotifications.default.start({ automation, record });
    }
  });
});

export default recordEmitter;
