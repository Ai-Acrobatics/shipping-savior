import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, organizations, orgMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from './audit';

// OAuth provider env vars are optional in development. We only register the
// providers when both the client id and secret are present so that local
// builds without OAuth credentials still succeed.
const oauthProviders = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  oauthProviders.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authConfig: NextAuthConfig = {
  providers: [
    ...oauthProviders,
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

        // Verify password (OAuth-only users have an empty/sentinel hash and
        // cannot sign in via Credentials)
        if (!user.passwordHash || user.passwordHash === 'OAUTH_USER') {
          writeAuditLog({
            userId: user.id,
            action: 'failed_login',
            metadata: { email, reason: 'oauth_only_account' },
          });
          return null;
        }

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
    async signIn({ user, account, profile }) {
      // Credentials path already created the user; just allow it through.
      if (!account || account.provider === 'credentials') {
        return true;
      }

      // OAuth path: ensure a local users row + personal org exist.
      const oauthEmail = (user.email || (profile as { email?: string })?.email)?.toLowerCase();
      const oauthName =
        user.name ||
        (profile as { name?: string; login?: string })?.name ||
        (profile as { login?: string })?.login ||
        (oauthEmail ? oauthEmail.split('@')[0] : 'New User');

      if (!oauthEmail) {
        // Cannot link without an email — block.
        return false;
      }

      try {
        // Look for an existing local account.
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, oauthEmail))
          .limit(1);

        if (existing) {
          // Backfill avatar if we just got one and the existing row is missing it.
          if (!existing.avatarUrl && user.image) {
            await db
              .update(users)
              .set({ avatarUrl: user.image, updatedAt: new Date() })
              .where(eq(users.id, existing.id));
          }

          writeAuditLog({
            userId: existing.id,
            action: 'login',
            metadata: { provider: account.provider, mode: 'oauth_existing' },
          });

          // Mutate `user` so the jwt callback sees the local id.
          user.id = existing.id;
          return true;
        }

        // First-time OAuth user — create user + personal org + owner membership in a tx.
        const firstName = oauthName.trim().split(/\s+/)[0] || 'My';
        const orgName = `${firstName}'s Workspace`;
        const orgSlugBase = orgName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 200);
        const orgSlug = `${orgSlugBase}-${Date.now()}`;

        const result = await db.transaction(async (tx) => {
          const [org] = await tx
            .insert(organizations)
            .values({ name: orgName, slug: orgSlug })
            .returning({ id: organizations.id });

          const [created] = await tx
            .insert(users)
            .values({
              email: oauthEmail,
              passwordHash: 'OAUTH_USER',
              name: oauthName,
              avatarUrl: user.image ?? null,
              // OAuth providers verify email before issuing the token, so we
              // mark these accounts as already verified.
              emailVerifiedAt: new Date(),
            })
            .returning({ id: users.id });

          await tx.insert(orgMembers).values({
            orgId: org.id,
            userId: created.id,
            role: 'owner',
          });

          return { userId: created.id, orgId: org.id };
        });

        writeAuditLog({
          userId: result.userId,
          orgId: result.orgId,
          action: 'register',
          metadata: {
            provider: account.provider,
            mode: 'oauth_new',
            email: oauthEmail,
          },
        });

        user.id = result.userId;
        return true;
      } catch (error) {
        console.error('[auth.signIn] OAuth user provisioning failed:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // On initial sign-in, persist user data into the JWT
      if (user) {
        token.userId = user.id as string;
        // For OAuth users, look up org membership now (it was just created or it
        // already existed). For credentials users, the authorize() return value
        // already supplied orgId/role on `user`.
        const passedOrgId = (user as { orgId?: string }).orgId;
        const passedRole = (user as { role?: string }).role;

        if (passedOrgId) {
          token.orgId = passedOrgId;
          token.role = passedRole ?? 'member';
        } else if (user.id) {
          const [membership] = await db
            .select({ orgId: orgMembers.orgId, role: orgMembers.role })
            .from(orgMembers)
            .where(eq(orgMembers.userId, user.id as string))
            .limit(1);
          token.orgId = membership?.orgId ?? '';
          token.role = membership?.role ?? 'member';
        }
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
