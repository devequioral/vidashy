import { getToken } from 'next-auth/jwt';
import db from '@/utils/db';

async function updateRecordInMedia(id, url) {
  const update_record = {
    url: url,
  };

  const filter = { id };
  const { client, database } = db.mongoConnect('DB_1d89c334da33_9e543ba9d9e2');
  const collectionDB = database.collection('media');

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

async function replaceVercelDomainInMedia(record) {
  const search =
    'https://vidashy.vercel.app/api/public/media/1d89c334da33/9021b05d09464efb8035d1cef9eacb90/';
  if (record.url.search(search) !== -1) {
    const new_url = record.url.replace(
      'https://vidashy.vercel.app/',
      'https://vidashy-eight.vercel.app/'
    );
    await updateRecordInMedia(record.id, new_url);
  }
}

async function replaceCollectionIDInMedia(record) {
  const search =
    'https://vidashy-eight.vercel.app/api/public/media/1d89c334da33/9021b05d09464efb8035d1cef9eacb90/';
  if (record.url.search(search) !== -1) {
    const new_url = record.url.replace(
      '9021b05d09464efb8035d1cef9eacb90/',
      '9e543ba9d9e2/'
    );
    await updateRecordInMedia(record.id, new_url);
  }
}

async function fixMedia() {
  const { client, database } = db.mongoConnect('DB_1d89c334da33_9e543ba9d9e2');

  let query = {};

  const collectionDB = database.collection('media');

  const records = await collectionDB.find(query).toArray();

  if (records && records.length > 0) {
    for (var i = 0; i < records.length; i++) {
      const record = records[i];
      //REPLACE vidashy.vercel.app for vidashy-eight.vercel.app
      await replaceVercelDomainInMedia(record);
      //REPLACE OLD COLLECTION ID
      await replaceCollectionIDInMedia(record);
    }
  }

  await client.close();

  return { records };
}

async function updateRecordInPosts(_uid, photos) {
  const update_record = {
    Photos: photos,
  };

  const filter = { _uid };
  const { client, database } = db.mongoConnect('DB_1d89c334da33_9e543ba9d9e2');
  const collectionDB = database.collection('posts');

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

async function replaceVercelDomainInPosts(record) {
  if (record.Photos && record.Photos.length > 0) {
    const new_photos = [];
    let changed = false;
    for (var i = 0; i < record.Photos.length; i++) {
      const photo = record.Photos[i];
      if (!photo) continue;
      const search =
        'https://vidashy.vercel.app/api/public/media/1d89c334da33/9021b05d09464efb8035d1cef9eacb90/';
      if (photo.url.search(search) !== -1) {
        const new_url = photo.url.replace(
          'https://vidashy.vercel.app/',
          'https://vidashy-eight.vercel.app/'
        );
        photo.url = new_url;
        changed = true;
      }
      new_photos.push(photo);
    }

    if (changed) {
      const response = await updateRecordInPosts(record._uid, new_photos);
      console.log(record._uid, response);
    }
  }
}

async function replaceCollectionIDInPosts(record) {
  if (record.Photos && record.Photos.length > 0) {
    const new_photos = [];
    let changed = false;
    for (var i = 0; i < record.Photos.length; i++) {
      const photo = record.Photos[i];
      if (!photo) continue;
      const search =
        'https://vidashy-eight.vercel.app/api/public/media/1d89c334da33/9021b05d09464efb8035d1cef9eacb90/';
      if (photo.url.search(search) !== -1) {
        const new_url = photo.url.replace(
          '9021b05d09464efb8035d1cef9eacb90/',
          '9e543ba9d9e2/'
        );
        photo.url = new_url;
        changed = true;
      }
      new_photos.push(photo);
    }

    if (changed) {
      const response = await updateRecordInPosts(record._uid, new_photos);
      console.log(record._uid, response);
    }
  }
}

async function fixPosts() {
  const { client, database } = db.mongoConnect('DB_1d89c334da33_9e543ba9d9e2');

  let query = {};

  const collectionDB = database.collection('posts');

  const records = await collectionDB.find(query).toArray();

  if (records && records.length > 0) {
    for (var i = 0; i < records.length; i++) {
      const record = records[i];
      //REPLACE vidashy.vercel.app for vidashy-eight.vercel.app IN POSTS
      await replaceVercelDomainInPosts(record);
      //REPLACE OLD COLLECTION ID IN POSTS
      replaceCollectionIDInPosts(record);
    }
  }

  await client.close();

  return { records };
}

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  await fixMedia();
  await fixPosts();

  res.status(200).json({ success: true });
}
