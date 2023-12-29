import db from '@/utils/db';
import bcryptjs from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

async function getUser(value, filterBy) {
  try {
    let user;
    const { client, database } = db.mongoConnect(process.env.MAIN_DB_NAME);
    const collectionDB = database.collection('users');
    const query = filterBy === 'email' ? { email: value } : { username: value };
    user = await collectionDB.findOne(query);
    await client.close();

    return user;
  } catch (err) {
    console.log(err);
  }
}
async function fetchUser(username) {
  //DETERMINE IF USERNAME IS AN EMAIL WITH REGEX
  const isEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+(\.)[a-zA-Z0-9_-]+$/;
  const filterBy = isEmail.test(username) ? 'email' : 'username';
  const user = await getUser(username, filterBy);
  if (!user) {
    throw new Error('User not found');
  }
  // You can now use the user object
  return user;
}

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user?._id) token._id = user._id;
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (token?._id) session.user._id = token._id;
      if (token?.role) session.user.role = token.role;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await fetchUser(credentials.username);
        if (user && bcryptjs.compareSync(credentials.password, user.password)) {
          return {
            _id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
          };
        }
        throw new Error('Invalid email or password');
      },
    }),
  ],
});
