import generateApiKey from 'generate-api-key';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  const apikey = generateApiKey({ method: 'bytes', length: 48 });
  res.status(200).json({ apikey });
}
