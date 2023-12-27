import { formatRequest, verifyRequest } from '@/utils/API_V1';
import { getRecords } from '@/utils/customersCollections';

export default async function handler(req, res) {
  //FORMAT THE REQUEST
  const request = formatRequest(req);

  //VERIFY IF THE REQUEST IS AUTHORIZED
  const verify = await verifyRequest(request);
  if (verify !== true) return res.status(verify.status).json(verify.response);

  //GET THE RECORDS
  const response = await getRecords(request);

  //VERIFY IF THE RECORDS WERE FOUND
  if (!response.records)
    return res.status(404).json({ error: 'Records Not Found' });

  //RETURN THE RECORDS
  res.status(200).json(response);
}
