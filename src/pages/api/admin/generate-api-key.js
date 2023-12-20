import generateApiKey from 'generate-api-key';

export default function handler(req, res) {
  const apikey = generateApiKey({ method: 'bytes', length: 48 });
  res.status(200).json({ apikey });
}
