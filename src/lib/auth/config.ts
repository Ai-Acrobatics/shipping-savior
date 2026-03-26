import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, orgMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from './audit';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        // Look up user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user) {
          // Fire-and-forget audit log for failed login
          writeAuditLog({
            action: 'failed_login',
            metadata: { email, reason: 'user_not_found' },
          });
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          writeAuditLog({
            userId: user.id,
            action: 'failed_login',
            metadata: { email, reason: 'invalid_password' },
          });
          return null;
        }

        // Successful login — get org membership
        const [membership] = await db
          .select()
          .from(orgMembers)
          .where(eq(orgMembers.userId, user.id))
          .limit(1);

        // Fire-and-forget audit log for successful login
        writeAuditLog({
          userId: user.id,
          orgId: membership?.orgId,
          action: 'login',
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          orgId: membership?.orgId,
          role: membership?.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, persist user data into the JWT
      if (user) {
        token.userId = user.id as string;
        token.orgId = (user as { orgId?: string }).orgId ?? '';
        token.role = (user as { role?: string }).role ?? 'member';
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.orgId = token.orgId as string;
      session.user.role = token.role as string;
      return session;
    },
  },
};
