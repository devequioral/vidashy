import db from '@/utils/db';
import { consoleError } from '@/utils/error';
import bcryptjs from 'bcryptjs';
import { sanitizeOBJ } from '@/utils/utils';

function formatRequest(req) {
  const { body, method, query, cookies, headers } = req;
  const { v2 } = query;
  //GET "Authorization: Bearer YOUR_SECRET_API_TOKEN"
  const apikey = headers.authorization;
  return {
    organization: v2 && v2.length > 0 ? v2[0] : null,
    collection: v2 && v2.length > 1 ? v2[1] : null,
    object: v2 && v2.length > 2 ? v2[2] : null,
    method,
    params: query,
    body,
    apikey,
    cookies,
    headers,
  };
}

function formatRequestMedia(req) {
  const { body, method, query, cookies, headers } = req;
  const { media } = query;
  //GET "Authorization: Bearer YOUR_SECRET_API_TOKEN"
  const apikey = headers.authorization;
  return {
    organization: media && media.length > 0 ? media[0] : null,
    collection: media && media.length > 1 ? media[1] : null,
    object: 'media',
    method,
    params: query,
    body,
    apikey,
    cookies,
    headers,
  };
}

//FUNCTION TO VERIFY IF THE REQUEST IS AUTHORIZED
async function verifyRequest(request) {
  if (!request.apikey)
    return { status: 401, response: { error: 'Unauthorized' } };

  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

  const request_apikey = request.apikey.replace('Bearer ', '');
  if (!request_apikey)
    return { status: 401, response: { error: 'Api Key Lost?' } };

  const salt = `$2a$10$${process.env.BCRIPT_SALT}`;
  const request_apikey_hashed = bcryptjs.hashSync(request_apikey, salt);

  const apikey_consult = { apikey: request_apikey_hashed };

  const apiaccessDB = await database
    .collection('apiaccessv2')
    .findOne(sanitizeOBJ(apikey_consult));
  await client.close();

  if (!apiaccessDB) return { response: { error: 'Unauthorized' } };

  const { organization, collection, method } = { ...request };
  const { scope, access } = apiaccessDB;

  if (scope === 'READ_ONLY' && method !== 'GET') {
    return { response: { error: 'Bad Method Request' } };
  }

  if (method === 'POST' && scope !== 'MANAGE_RECORDS') {
    return { response: { error: 'Bad Method Request' } };
  }

  if (method === 'PUT' && scope !== 'MANAGE_RECORDS') {
    return { response: { error: 'Bad Method Request' } };
  }

  if (method === 'DELETE' && scope !== 'MANAGE_RECORDS') {
    return { response: { error: 'Bad Method Request' } };
  }

  if (method === 'PATCH' && scope !== 'MANAGE_RECORDS') {
    return { response: { error: 'Bad Method Request' } };
  }

  let allow_access = false;
  if (access.indexOf('ALL_ORGANIZATIONS') >= 0) allow_access = true;
  if (access.indexOf(`ALL_COLLECTIONS:${organization}`) >= 0)
    allow_access = true;
  if (access.indexOf(`${collection}`) >= 0) allow_access = true;

  if (!allow_access) {
    return { response: { error: 'Not Authorized Access' } };
  }

  return true;
}

async function getCollectionName(request) {
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const consult_record = sanitizeOBJ({
    organization_id: request.organization,
    id: request.collection,
  });
  const collectionsDB = await database
    .collection('collections')
    .findOne(consult_record);
  await client.close();

  if (!collectionsDB) return false;

  return collectionsDB.name;
}

export { formatRequest, formatRequestMedia, verifyRequest, getCollectionName };
