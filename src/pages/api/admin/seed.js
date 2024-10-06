// import data from '@/data/seed_data';
// import { getToken } from 'next-auth/jwt';
// import { consoleError } from '@/utils/error';
// import db from '@/utils/db';

// const seedClientData = async (data) => {
//   await data.userDatabases.map(async (userDatabase) => {
//     try {
//       const { client, database } = db.mongoConnect(userDatabase.name);
//       userDatabase.userCollections.map(async (collection) => {
//         const newCollection = database.collection(collection.name);
//         await newCollection.deleteMany();
//         await newCollection.insertMany(collection.data);
//       });

//       await client.close();
//     } catch (err) {
//       consoleError(err);
//     }
//   });
// };

// const handler = async (req, res) => {
//   if (process.env.NEXT_PUBLIC_SYSTEM_SCOPE !== 'development')
//     return res.status(401).send({ message: 'Bad Environment' });

//   const token = await getToken({ req });

//   if (!token) return res.status(401).send({ message: 'Not authorized' });

//   if (token.role !== 'admin')
//     return res.status(401).send({ message: 'User Not authorized' });

//   const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);

//   try {
//     const users = database.collection('users');
//     await users.deleteMany({});
//     await users.insertMany(data.users);

//     const apiaccess = database.collection('apiaccess');
//     await apiaccess.deleteMany({});
//     await apiaccess.insertMany(data.apiaccess);

//     const automations = database.collection('automations');
//     await automations.deleteMany({});
//     await automations.insertMany(data.automations);

//     const organizations = database.collection('organizations');
//     await organizations.deleteMany({});
//     await organizations.insertMany(data.organizations);

//     await seedClientData(data);
//   } catch (err) {
//     consoleError(err);
//   } finally {
//     await client.close();
//   }

//   res.send({ message: 'seeded successfully' });
// };
// export default handler;
