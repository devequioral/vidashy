import ApiAccess from '@/models/ApiAccess';
import db from '@/utils/db';
import { getRecords } from '@/utils/customersCollections';
import { formatRequest } from '@/utils/API_V1';

export default async function handler(req, res) {
  const request = formatRequest(req);

  if (!request.apikey) return res.status(401).json({ error: 'Unauthorized' });

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
    return res.status(401).json({ error: 'Organization Not Found' });

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
    return res.status(401).json({ error: 'Unauthorized' });
  if (!verification.collectionfound)
    return res.status(401).json({ error: 'Collection Not Found' });
  if (!verification.objectfound)
    return res.status(401).json({ error: 'Object Not Found' });
  if (!verification.methodfound)
    return res.status(401).json({ error: 'Action Unauthorized' });

  const records = await getRecords(
    request.organization,
    request.collection,
    request.object
  );

  if (request.params.filterBy) {
    const filterBy = request.params.filterBy.split(',');
    const filterValue = request.params.filterValue.split(',');
    const filterOperator = request.params.filterOperator.split(',');
    const filter = [];
    filterBy.map((item, index) => {
      filter.push({
        field: item,
        value: filterValue[index],
        operator: filterOperator[index],
      });
    });
    const filteredRecords = records.filter((item) => {
      let result = true;
      filter.map((filterItem) => {
        if (filterItem.operator === 'eq') {
          if (item[filterItem.field] !== filterItem.value) result = false;
        }
        if (filterItem.operator === 'ne') {
          if (item[filterItem.field] === filterItem.value) result = false;
        }
        if (filterItem.operator === 'lt') {
          if (item[filterItem.field] >= filterItem.value) result = false;
        }
        if (filterItem.operator === 'gt') {
          if (item[filterItem.field] <= filterItem.value) result = false;
        }
        if (filterItem.operator === 'le') {
          if (item[filterItem.field] > filterItem.value) result = false;
        }
        if (filterItem.operator === 'ge') {
          if (item[filterItem.field] < filterItem.value) result = false;
        }
        if (filterItem.operator === 'like') {
          if (!item[filterItem.field].includes(filterItem.value))
            result = false;
        }
      });
      return result;
    });

    res.status(200).json(filteredRecords);
    return;
  }

  res.status(200).json(records);
  //res.status(200).json(request);
}
