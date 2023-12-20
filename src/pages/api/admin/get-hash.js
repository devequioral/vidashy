import bcryptjs from 'bcryptjs';

export default function handler(req, res) {
  const { tohash } = req.query;
  if (!tohash) return res.status(400).json({ error: 'Missing tohash' });
  const salt = `$2a$10$${process.env.BCRIPT_SALT}`; //bcryptjs.genSaltSync(10);
  const hash = bcryptjs.hashSync(tohash, salt);
  res.status(200).json({ hash });
}
