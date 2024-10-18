import db from '@/utils/db';
import { sanitizeOBJ, sanitize } from '@/utils/utils';
import { getCollectionName } from '@/utils/API_V2';

export default async function handler(req, res) {
  const [media, organization, collection, id] = [...req.query.media];

  const collectionName = await getCollectionName({
    organization,
    collection,
  });

  if (collectionName === false)
    return res.status(500).json({ error: 'Collection Not Found' });

  let dataBaseName = sanitize(`DB_${organization}_${collection}`);

  const { client, database } = db.mongoConnect(sanitize(dataBaseName));

  const collectionDB = database.collection(sanitize('media'));

  const query = sanitizeOBJ({ id });

  const records = await collectionDB.find(query).toArray();

  await client.close();

  if (records.length > 0) {
    const record = records[0];
    const img = await fetch(record.private_url);
    const buffer = await img.arrayBuffer();
    res.setHeader('Content-Type', record.mimetype);
    res.send(Buffer.from(buffer));
  } else {
    res.send('');
  }
}
