import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          const data = await res.json();
          if (res.ok && data?.user) {
            return { id: data.user.id, name: data.user.displayName, email: data.user.email, token: data.token };
          }
        } catch (e) {
          console.error('Auth error', e);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      // Persist the JWT token from backend on first sign in
      if (user?.token) token.accessToken = user.token;
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      // Expose token to the client
      if (token?.accessToken) session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    // signIn: '/auth/signin', // Removed: signin page no longer exists
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};

export default NextAuth(authOptions as any);
