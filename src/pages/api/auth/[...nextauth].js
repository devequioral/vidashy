import bcryptjs from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import db from '@/utils/db';

async function getUser(value, filterBy) {
  let user;
  if (filterBy === 'email') {
    await db.connect();
    user = await User.findOne({
      email: value,
    });
  }
  if (filterBy === 'username') {
    await db.connect();
    user = await User.findOne({
      username: value,
    });
  }
  return user;
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
      if (user?.usertype) token.usertype = user.usertype;
      return token;
    },
    async session({ session, token }) {
      if (token?._id) session.user._id = token._id;
      if (token?.usertype) session.user.usertype = token.usertype;
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
            usertype: user.usertype,
          };
        }
        throw new Error('Invalid email or password');
      },
    }),
  ],
});
