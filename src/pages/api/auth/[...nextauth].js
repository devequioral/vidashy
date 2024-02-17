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

export default async function auth(req, res) {
  //TODO IMPLEMENT REMEMBER ME
  const maxAge = req.body.remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  if (req.body.remember === true) {
    nookies.set({ res }, 'rememberSession', true, {
      maxAge: 5 * 24 * 60 * 60,
      path: '/',
    });
  } else if (req.body.remember === false) {
    nookies.set({ res }, 'rememberSession', false, {
      maxAge: 5 * 24 * 60 * 60,
      path: '/',
    });
  }

  return await NextAuth(req, res, {
    session: {
      strategy: 'jwt',
      maxAge: 1 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) token.id = user.id;
        if (user?.role) token.role = user.role;
        if (user?.name) token.name = user.name;
        if (user?.username) token.username = user.username;
        //if (user?.username) token.maxAge = maxAge;
        return token;
      },
      async session({ session, token }) {
        if (token?.id) session.user.id = token.id;
        if (token?.role) session.user.role = token.role;
        if (token?.name) session.name = token.name;
        if (token?.username) session.username = token.username;
        //if (token?.username) session.maxAge = maxAge;
        return session;
      },
    },
    providers: [
      CredentialsProvider({
        async authorize(credentials) {
          const user = await fetchUser(credentials.username);
          if (
            user &&
            bcryptjs.compareSync(credentials.password, user.password)
          ) {
            return {
              id: user.id,
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
}
