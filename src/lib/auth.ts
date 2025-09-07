import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          console.log('❌ User not found or no password');
          return null;
        }

        console.log('✅ User found:', user.name);

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('❌ Invalid password');
          return null;
        }

        console.log('✅ Password valid, creating session');

        return {
          id: user.id,
          email: user.email!,
          name: user.name || undefined,
          role: user.role,
          image: user.avatar || undefined,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET
};
