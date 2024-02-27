import db from '@/utils/db';
import { v4 as uuidv4 } from 'uuid';
import qs from 'qs';

async function searchAllDB(obj, record) {
  const { organization, collection } = record;
  let dataBaseName = `DB_${organization}_${collection}`;
  const { client, database } = db.mongoConnect(dataBaseName);
  const collectionDB = database.collection(obj.searchAll.object);
  const query = obj.searchAll.conditions;
  const fields = obj.searchAll.fields.split(',');
  const projection = { _id: 0 };
  fields.map((field) => {
    projection[field] = 1;
  });
  //TODO PROJECTION DONT WORK (RETURN EVERY FIELDS)
  const result = await collectionDB.find(query, projection).toArray();
  await client.close();
  return result;
}

async function dynamicDataV2(expr, record) {
  let result = expr;
  let keys = Object.keys(record.new_record);
  if (!expr) return result;
  if (expr.search(/{{.*}}/g) === -1) return result;

  if (expr.search(/#.*#/g) !== -1) {
    keys.forEach((key) => {
      if (expr.includes(`#${key}#`)) {
        let value = record.new_record[key];
        expr = expr.replace(`#${key}#`, value);
      }
    });
  }

  const obj = qs.parse(expr.replace(/{{|}}/g, ''));
  if (obj.searchAll !== undefined) {
    const resultDB = await searchAllDB(obj, record);
    //TODO ONLY WORK FOR EMAILS - NEED TO WORK WITH ANY FIELD
    let emails = '';
    if (resultDB) {
      resultDB.map((item) => {
        if (emails !== '') emails += ',';
        emails += item.email;
      });
      result = emails;
    }
    return result;
  }

  keys.forEach(async (key) => {
    if (
      `{{${key}}}` === expr &&
      (typeof record[key] === 'string' || typeof record[key] === 'number')
    ) {
      let value = record[key];
      result = result.replace(`{{${key}}}`, value);
      return result;
    } else if (typeof record[key] === 'object' && record[key] !== null) {
      let nestedKeys = Object.keys(record[key]);
      nestedKeys.forEach((nestedKey) => {
        if (
          `{{${nestedKey}}}` === expr &&
          (typeof record[key] === 'string' || typeof record[key] === 'number')
        ) {
          let value = record[key][nestedKey];
          result = result.replace(`{{${key}.${nestedKey}}}`, value);
          return result;
        }
      });
    }
  });
  return result;
}

function dynamicData(expr, record) {
  let result = expr;
  let keys = Object.keys(record);
  keys.forEach((key) => {
    if (Array.isArray(record[key]) && expr.includes('.last.')) {
      let lastItem = record[key][record[key].length - 1];
      let itemKeys = Object.keys(lastItem);
      itemKeys.forEach((itemKey) => {
        let value = lastItem[itemKey];
        result = result.replace(`{{${key}.last.${itemKey}}}`, value);
      });
    } else if (typeof record[key] === 'object' && record[key] !== null) {
      let nestedKeys = Object.keys(record[key]);
      nestedKeys.forEach((nestedKey) => {
        let value = record[key][nestedKey];
        result = result.replace(`{{${key}.${nestedKey}}}`, value);
      });
    } else {
      let value = record[key];
      result = result.replace(`{{${key}}}`, value);
    }
  });
  return result;
}

async function start(options) {
  const { automation, record } = options;
  const { organization, collection, object } = record;
  let dataBaseName = `DB_${organization}_${collection}`;
  const { client, database } = db.mongoConnect(dataBaseName);
  const { actionData } = automation;
  const mailData = actionData.mailData;

  const collectionDB = database.collection('notifications');

  const new_notification = {
    id: uuidv4(),
    title: actionData.title,
    message: actionData.message,
    object: actionData.object,
    objectid: dynamicData(actionData.objectid, record.new_record),
    userid: dynamicData(actionData.userid, record.new_record),
    role: actionData.role,
    status: actionData.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await collectionDB.insertOne(new_notification);
    await client.close();

    if (!mailData) return;

    let nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: process.env.NODEMAILER_PORT,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mail_to = await dynamicDataV2(mailData.to, record);

    const sendMailData = {
      from: mailData.from,
      to: mail_to,
      subject: mailData.subject,
      text: mailData.text,
      html: mailData.html,
    };

    transporter.sendMail(sendMailData, function (err, info) {
      if (err) {
        //TODO LOG ERROR
        console.log('SEND EMAIL ERROR', err);
      } else {
        // TODO LOG SUCCESS
        console.log('SEND EMAIL SUCCESS');
      }
    });
  } catch (e) {
    //TODO LOG ERROR
  }
}

export default { start };
