import ApiAccess from '@/models/ApiAccess';
import db from '@/utils/db';

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
  await db.connect();
  const apiaccessDB = await ApiAccess.findOne({
    uid: request.organization,
  });
  await db.disconnect();

  if (!apiaccessDB)
    return { status: 401, response: { error: 'Organization Not Found' } };

  apiaccessDB.apiaccess.map((apikey_item) => {
    if (apikey_item.apikey === request.apikey.replace('Bearer ', '')) {
      verification.apikeyfound = true;
      apikey_item.permissions.map((permission) => {
        if (permission.collection === request.collection) {
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

export { formatRequest, verifyRequest };
