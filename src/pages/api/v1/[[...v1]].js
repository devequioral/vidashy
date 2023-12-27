import { formatRequest, verifyRequest, filterRecords } from '@/utils/API_V1';
import { getRecords } from '@/utils/customersCollections';

export default async function handler(req, res) {
  //FORMAT THE REQUEST
  const request = formatRequest(req);

  //VERIFY IF THE REQUEST IS AUTHORIZED
  const verify = await verifyRequest(request);
  if (verify !== true) return res.status(verify.status).json(verify.response);

  //GET THE RECORDS
  const records = await getRecords(
    request.organization,
    request.collection,
    request.object
  );

  //FILTER THE RECORDS
  if (request.params.filterBy) {
    const filterRecordsResponse = filterRecords(records, request);
    return res
      .status(filterRecordsResponse.status)
      .json(filterRecordsResponse.response);
  }

  //RETURN THE RECORDS
  res.status(200).json(records);
}
