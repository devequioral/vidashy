import { formatRequest, verifyRequest } from '@/utils/API_V1';
import { getRecords, createRecord } from '@/utils/customersCollections';
import { consoleError } from '@/utils/error';

export default async function handler(req, res) {
  //FORMAT THE REQUEST
  const request = formatRequest(req);

  //VERIFY IF THE REQUEST IS AUTHORIZED
  const verify = await verifyRequest(request);
  if (verify !== true) return res.status(verify.status).json(verify.response);

  if (request.method === 'GET') {
    //GET THE RECORDS
    const response = await getRecords(request);

    //VERIFY IF THE RECORDS WERE FOUND
    if (!response.records)
      return res.status(404).json({ error: 'Records Not Found' });

    //RETURN THE RECORDS
    return res.status(200).json(response);
  }

  if (request.method === 'POST') {
    //CREATE THE RECORD
    const response = await createRecord(request);

    //VERIFY IF THE RECORD WAS CREATED
    if (!response.record)
      return res.status(500).json({ error: 'Record Not Created' });

    //RETURN RESPONSE
    return res.status(200).json(response);
  }
}
