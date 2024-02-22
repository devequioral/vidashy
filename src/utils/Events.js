import EventEmitter from 'events';
import db from '@/utils/db';

function getValueFromField(record, field) {
  let keys = field.split('.');
  let value = record;
  for (let key of keys) {
    if (key === 'last') {
      value = value[value.length - 1];
    } else if (key === 'first') {
      value = value[0];
    } else {
      value = value[key];
    }
  }
  return typeof value === 'null' || typeof value === 'undefined' ? null : value;
}

function checkConditions(record, conditions) {
  if (!conditions || conditions.length === 0) return false;
  let response = [];
  for (let condition of conditions) {
    let fieldValue = getValueFromField(record, condition.field);
    if (condition.operator === 'eq') {
      response.push(fieldValue === condition.value);
    }
    if (condition.operator === 'isNotEmpty') {
      //IS NOT EMPTY RETURN TRUE
      response.push(fieldValue !== null);
    }
    if (condition.operator === 'isEmpty') {
      response.push(fieldValue === null);
    }
  }

  //VERYFY IN ARRAY RESPONSE EVERY VALUES ARE TRUE
  let count_falses = 0;

  response.map((resp) => {
    if (!resp) count_falses++;
  });

  return count_falses === 0;
}

class RecordEmitter extends EventEmitter {}

const recordEmitter = new RecordEmitter();

recordEmitter.on('recordCreated', async (record) => {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const collectionDB = database.collection('automations');
  const query = {
    id: `${record.organization}_${record.collection}_${record.object}_recordCreated`,
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
    id: `${record.organization}_${record.collection}_${record.object}_recordUpdated`,
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
