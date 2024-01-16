import { formatRequestMedia, verifyRequest } from '@/utils/API_V1';
import { getRecords, createRecord } from '@/utils/customersCollections';
import { consoleError } from '@/utils/error';

import { Formidable } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  //FORMAT THE REQUEST
  const request = formatRequestMedia(req);

  //VERIFY IF THE REQUEST IS AUTHORIZED
  const verify = await verifyRequest(request);
  if (verify !== true) return res.status(verify.status).json(verify.response);

  const { fields, files } = await new Promise((resolve, reject) => {
    const form = new Formidable();
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve({ fields, files });
    });
  });

  try {
    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const { Body, ContentType, FileSize, Key } = ((files) => {
      if (!files || !files.file || !files.file[0].filepath) {
        return { Body: null, ContentType: null, FileSize: null, Key: null };
      }
      const fs = require('fs');
      return {
        Body: fs.createReadStream(files.file[0].filepath),
        ContentType: files.file[0].mimetype,
        FileSize: files.file[0].size,
        Key: uuidv4(),
      };
    })(files);

    if (Body === null) {
      return res.status(500).json({ error: 'File Not Found' });
    }

    if (FileSize / (1024 * 1024) > 5) {
      return res.status(500).json({ error: 'File size too large. 5MB max.' });
    }

    const response = await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key,
        Body,
        ACL: 'public-read',
        ContentType,
      })
    );

    if (response['$metadata'].httpStatusCode === 200) {
      const URL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${Key}`;
      return res.status(200).json({ ok: 200, Key, URL });
    }

    return res.status(500).json({ error: 'Error Found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
