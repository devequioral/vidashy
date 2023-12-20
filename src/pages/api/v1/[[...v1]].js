import api_access from '@/data/api_access.json';
import users from '@/data/users.json';

export default function handler(req, res) {
  const { body, method, query, cookies, headers } = req;
  const { v1 } = query;
  //GET "Authorization: Bearer YOUR_SECRET_API_TOKEN"
  const apikey = headers.authorization;
  const request = {
    organization: v1 && v1.length > 0 ? v1[0] : null,
    collection: v1 && v1.length > 1 ? v1[1] : null,
    object: v1 && v1.length > 2 ? v1[2] : null,
    method,
    params: query,
    body,
    apikey,
  };

  if (!apikey) return res.status(401).json({ error: 'Unauthorized' });

  const verification = {
    organizationfound: false,
    apikeyfound: false,
    collectionfound: false,
    objectfound: false,
    methodfound: false,
  };
  api_access.map((item) => {
    if (item.uid === request.organization) {
      verification.organizationfound = true;
      item.apiaccess.map((apikey_item) => {
        if (apikey_item.apikey === apikey.replace('Bearer ', '')) {
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
    }
  });

  if (!verification.organizationfound)
    return res.status(401).json({ error: 'Unauthorized' });
  if (!verification.apikeyfound)
    return res.status(401).json({ error: 'Unauthorized' });
  if (!verification.collectionfound)
    return res.status(401).json({ error: 'Collection Not Found' });
  if (!verification.objectfound)
    return res.status(401).json({ error: 'Object Not Found' });
  if (!verification.methodfound)
    return res.status(401).json({ error: 'Action Unauthorized' });

  const { records } = users;

  if (query.filterBy) {
    const filterBy = query.filterBy.split(',');
    const filterValue = query.filterValue.split(',');
    const filterOperator = query.filterOperator.split(',');
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
