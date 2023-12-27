import bcryptjs from 'bcryptjs';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  const salt = bcryptjs.genSaltSync(10);
  res.status(200).json({ salt, saltbody: `${salt.replace('$2a$10$', '')}` });
}
