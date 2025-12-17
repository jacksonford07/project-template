import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
// import Google from 'next-auth/providers/google';
// import GitHub from 'next-auth/providers/github';

import { prisma } from './prisma';
import { env } from './env';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: env.NEXTAUTH_SECRET,
  providers: [
    // Uncomment and configure providers as needed:
    //
    // Google({
    //   clientId: env.GOOGLE_CLIENT_ID!,
    //   clientSecret: env.GOOGLE_CLIENT_SECRET!,
    // }),
    //
    // GitHub({
    //   clientId: env.GITHUB_ID!,
    //   clientSecret: env.GITHUB_SECRET!,
    // }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Add any custom fields to session
        // session.user.role = user.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    // Add other custom pages as needed
  },
});
