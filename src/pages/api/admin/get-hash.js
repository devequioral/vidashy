import bcryptjs from 'bcryptjs';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  const { tohash } = req.query;
  if (!tohash) return res.status(400).json({ error: 'Missing tohash' });
  const salt = `$2a$10$${process.env.BCRIPT_SALT}`; //bcryptjs.genSaltSync(10);
  const hash = bcryptjs.hashSync(tohash, salt);

  res.status(200).json({ hash });
}
