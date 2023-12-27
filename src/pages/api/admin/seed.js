import User from '@/models/User';
import ApiAccess from '@/models/ApiAccess';
//import Temp from '@/models/Temp';
import { getDynamicSchema } from '@/models/DynamicModel';
import data from '@/data/seed_data';
import db from '@/utils/db';
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {
  if (process.env.NEXT_PUBLIC_SYSTEM_SCOPE !== 'development')
    return res.status(401).send({ message: 'Bad Environment' });

  const token = await getToken({ req });

  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (token.role !== 'admin')
    return res.status(401).send({ message: 'User Not authorized' });

  await db.connect();
  await User.deleteMany();
  await User.insertMany(data.users);
  await ApiAccess.deleteMany();
  await ApiAccess.insertMany(data.apiaccess);

  data.userCollections.map(async (collection) => {
    // await Temp.deleteMany();
    // await Temp.insertMany(data.userCollections[0].data);
    let schema = getDynamicSchema(collection.name, collection.fields, true);
    await schema.deleteMany();
    await schema.insertMany(collection.data);
  });

  await db.disconnect();
  res.send({ message: 'seeded successfully', tepm: JSON.stringify(ApiAccess) });
};
export default handler;
