import { getToken } from 'next-auth/jwt';

function generateUUID(length) {
  let d = new Date().getTime();
  const uuid = Array(length + 1)
    .join('x')
    .replace(/[x]/g, (c) => {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  return uuid.slice(0, length);
}

export default async function handler(req, res) {
  const token = await getToken({ req });

  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  const { length } = req.query;

  const uuid = generateUUID(Number.parseInt(length) || 20);
  res.status(200).json({ uuid });
}
