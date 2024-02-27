import db from '@/utils/db';
import { consoleError } from '@/utils/error';

function formatRequest(req) {
  const { body, method, query, cookies, headers } = req;
  const { v1 } = query;
  //GET "Authorization: Bearer YOUR_SECRET_API_TOKEN"
  const apikey = headers.authorization;
  return {
    organization: v1 && v1.length > 0 ? v1[0] : null,
    collection: v1 && v1.length > 1 ? v1[1] : null,
    object: v1 && v1.length > 2 ? v1[2] : null,
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

  const verification = {
    organizationfound: false,
    apikeyfound: false,
    collectionfound: false,
    objectfound: false,
    methodfound: false,
  };
  const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
  const apiaccessDB = await database
    .collection('apiaccess')
    .findOne({ organization_id: request.organization });
  await client.close();

  if (!apiaccessDB)
    return { status: 401, response: { error: 'Organization Not Found' } };

  apiaccessDB.apiaccess.map((apikey_item) => {
    if (apikey_item.apikey === request.apikey.replace('Bearer ', '')) {
      verification.apikeyfound = true;
      apikey_item.permissions.map((permission) => {
        if (permission.client_collection === request.collection) {
          verification.collectionfound = true;
          if (permission.object.name === request.object) {
            verification.objectfound = true;
            if (permission.object.methods.includes(request.method)) {
              verification.methodfound = true;
            }
          }
        }
      });
    }
  });

  if (!verification.apikeyfound)
    return { status: 401, response: { error: 'Unauthorized' } };
  if (!verification.collectionfound)
    return { status: 401, response: { error: 'Collection Not Found' } };
  if (!verification.objectfound)
    return { status: 401, response: { error: 'Object Not Found' } };
  if (!verification.methodfound)
    return { status: 401, response: { error: 'Action Unauthorized' } };

  return true;
}

export { formatRequest, formatRequestMedia, verifyRequest };
