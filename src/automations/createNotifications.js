import db from '@/utils/db';
import { v4 as uuidv4 } from 'uuid';

async function start(options) {
  const { automation, record } = options;
  const { organization, collection, object } = record;
  let dataBaseName = `DB_${organization}_${collection}`;
  const { client, database } = db.mongoConnect(dataBaseName);
  const { actionData, mailData } = automation;

  const collectionDB = database.collection('notifications');

  const new_notification = {
    id: uuidv4(),
    title: actionData.title,
    message: actionData.message,
    object: actionData.object,
    objectid: record.new_record.id,
    userid: actionData.userid,
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

    const sendMailData = {
      from: mailData.from,
      to: mailData.to,
      subject: mailData.subject,
      text: mailData.text,
      html: mailData.html,
    };

    transporter.sendMail(sendMailData, function (err, info) {
      if (err) {
        //TODO LOG ERROR
        //console.log('SEND EMAIL ERROR', err);
      } else {
        // TODO LOG SUCCESS
        //console.log('SEND EMAIL SUCCESS');
      }
    });
  } catch (e) {
    //TODO LOG ERROR
  }
}

export default { start };
