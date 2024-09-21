import { formatRequest, verifyRequest } from '@/utils/API_V1';
import {
  getRecords,
  createRecord,
  deleteRecord,
  updateRecord,
  prepareUpload,
} from '@/utils/customersCollections';
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

  if (request.method === 'DELETE') {
    //DELETE THE RECORD
    const response = await deleteRecord(request);

    //VERIFY IF THE RECORD WAS DELETED
    if (!response) return res.status(500).json({ error: 'Record Not DELETED' });

    //RETURN RESPONSE
    return res.status(200).json({ message: 'Record Deleted' });
  }

  if (request.method === 'PATCH') {
    //CREATE THE RECORD
    const response = await updateRecord(request);

    //VERIFY IF THE RECORD WAS UPDATED
    if (!response.record)
      return res.status(500).json({ error: 'Record Not UPDATED' });

    //RETURN RESPONSE
    return res.status(200).json(response);
  }

  // if (request.method === 'PUT') {
  //   //CREATE THE RECORD
  //   const response = await prepareUpload(request);

  //   //VERIFY IF THE RECORD WAS CREATED
  //   if (!response.url)
  //     return res.status(500).json({ error: 'Resource Not Ready' });

  //   //RETURN RESPONSE
  //   return res.status(200).json(response);
  // }
}
