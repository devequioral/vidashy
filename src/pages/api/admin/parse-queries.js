import { getToken } from 'next-auth/jwt';
import qs from 'qs';
import assert from 'assert';

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  //searchAll(users,{role:admin},email)
  const obj = qs.parse('id');

  console.log(obj);

  res.status(200).json({ obj });

  //   try {
  //     assert.deepEqual(obj, { a: 'c' });
  //     res.status(200).json({ obj });
  //   } catch (e) {
  //     res.status(200).json({ error: e.message });
  //   }
}
