import {
  formatRequestMedia,
  verifyRequest,
  getCollectionName,
} from '@/utils/API_V2';
import { getRecords, createRecord } from '@/utils/customerCollectionsv2';
import { consoleError } from '@/utils/error';

import { Formidable } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import buckets from '@/data/buckets.json';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function uploadToAWS(bucket, files) {
  try {
    const client = new S3Client({
      region: process.env[`AWS_REGION_${bucket.id}`],
      credentials: {
        accessKeyId: process.env[`AWS_ACCESS_KEY_ID_${bucket.id}`],
        secretAccessKey: process.env[`AWS_SECRET_ACCESS_KEY_${bucket.id}`],
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
        Bucket: process.env[`AWS_BUCKET_NAME_${bucket.id}`],
        Key,
        Body,
        ACL: 'public-read',
        ContentType,
      })
    );

    if (response['$metadata'].httpStatusCode === 200) {
      const URL = `https://${
        process.env[`AWS_BUCKET_NAME_${bucket.id}`]
      }.s3.amazonaws.com/${Key}`;
      return { ok: 200, Key, URL };
    }

    return false;
  } catch (error) {
    //console.log(error.message);
    return false;
  }
}

export default async function handler(req, res) {
  //FORMAT THE REQUEST
  const request = formatRequestMedia(req);

  //VERIFY IF THE REQUEST IS AUTHORIZED
  const verify = await verifyRequest(request);
  if (verify !== true) return res.status(verify.status).json(verify.response);

  request.collectionName = await getCollectionName(request);

  if (request.collectionName === false)
    return res.status(500).json({ error: 'Collection Not Found' });

  if (request.method === 'GET') {
  }

  if (request.method === 'POST') {
    const form = new Formidable();
    const [fields, files] = await form.parse(req);
    console.log(fields);

    const bucket = buckets.find((b) => {
      return b.organization === request.organization;
    });

    if (!bucket) return res.status(500).json({ error: 'Bad Configuration' });

    if (bucket.type === 'AWS') {
      const resp = await uploadToAWS(bucket, files);
      if (resp !== false) {
        return res.status(200).json({ ...resp });
      } else {
        return res.status(500).json({ error: 'Error Found' });
      }
    }
  }

  if (request.method === 'DELETE') {
  }
}
