import { getToken } from 'next-auth/jwt';
import { generateUUID } from '@/utils/utils';

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  const { length } = req.query;

  const uuid = generateUUID(Number.parseInt(length) || 32);
  res.status(200).json({ uuid });
}
