import bcryptjs from 'bcryptjs';

export default function handler(req, res) {
  const salt = bcryptjs.genSaltSync(10);
  res.status(200).json({ salt, saltbody: `${salt.replace('$2a$10$', '')}` });
}
