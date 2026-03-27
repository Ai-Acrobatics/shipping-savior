# Phase 2: Authentication (NextAuth v5)

**Goal:** Users can register, log in, log out with email/password. JWT sessions with 30-day expiry. Audit logging on all auth events.
**Requirements:** R1, R5
**Depends on:** Phase 1 (users, organizations, org_members, audit_logs tables in `src/lib/db/schema.ts`)
**Status:** Planned

---

## Dependencies to Install

```bash
npm install next-auth@5.0.0-beta.25 bcryptjs
npm install -D @types/bcryptjs
```

## Environment Variables

Add to `.env.local`:
```
NEXTAUTH_SECRET=<generate with `openssl rand -base64 32`>
NEXTAUTH_URL=http://localhost:3000
```

---

## Tasks

### Task 1: Audit log helper — `src/lib/auth/audit.ts`

**Purpose:** Reusable function to write auth events to the `audit_logs` table.

**Key patterns:**
```typescript
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';

export type AuditAction = 'login' | 'login_failed' | 'register' | 'logout' | 'password_change';

export async function writeAuditLog(params: {
  userId?: string;
  action: AuditAction;
  metadata?: Record<string, unknown>; // email on failed login, IP, user-agent
}) {
  await db.insert(auditLogs).values({
    userId: params.userId ?? null,
    action: params.action,
    metadata: params.metadata ?? {},
  });
}
```

**Notes:**
- `userId` is nullable for failed login attempts (user may not exist).
- `metadata` stores IP address, user-agent, email (for failed attempts).
- Wraps insert in try/catch — audit failures must never block auth flow.

**Verification:** Unit-testable in isolation. Confirm row appears in `audit_logs` table.

---

### Task 2: NextAuth configuration — `src/lib/auth/config.ts`

**Purpose:** Central NextAuth v5 config with Credentials provider, JWT strategy, 30-day sessions.

**Key patterns:**
```typescript
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
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
        // 1. Validate input
        // 2. Look up user by email: db.select().from(users).where(eq(users.email, email))
        // 3. bcrypt.compare(password, user.passwordHash)
        // 4. On success: writeAuditLog({ userId: user.id, action: 'login' })
        // 5. On failure: writeAuditLog({ action: 'login_failed', metadata: { email } })
        // 6. Return { id, email, name } or null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    // newUser: '/register', // not a NextAuth page, handled by custom route
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, add user.id and orgId to token
      if (user) {
        token.userId = user.id;
        // Query org_members for user's orgId and role
      }
      return token;
    },
    async session({ session, token }) {
      // Expose userId, orgId, role on session object
      session.user.id = token.userId as string;
      session.user.orgId = token.orgId as string;
      session.user.role = token.role as string;
      return session;
    },
  },
};
```

**Notes:**
- JWT token stores `userId`, `orgId`, `role` so downstream pages don't need DB hits for identity.
- `pages.signIn` points to `/login` (our custom route, Task 6).
- Credentials provider calls `writeAuditLog` for both success and failure.
- Password comparison uses `bcryptjs` (pure JS, works in Vercel serverless).

**Verification:** Import config without errors. Credentials provider resolves correctly.

---

### Task 3: Auth exports — `src/lib/auth/index.ts`

**Purpose:** Export `auth()`, `signIn`, `signOut`, and `handlers` from NextAuth using the config.

**Key patterns:**
```typescript
import NextAuth from 'next-auth';
import { authConfig } from './config';

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
```

**Notes:**
- Single source of truth for all auth imports across the app.
- `auth()` is the server-side session getter (replaces `getServerSession`).
- `handlers` exposes GET and POST for the route handler.

**Verification:** `import { auth } from '@/lib/auth'` resolves without errors.

---

### Task 4: NextAuth route handler — `src/app/api/auth/[...nextauth]/route.ts`

**Purpose:** Wire NextAuth HTTP handlers into Next.js App Router.

**Key patterns:**
```typescript
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

**Notes:**
- This is the standard NextAuth v5 App Router integration.
- All auth API calls (sign-in, sign-out, CSRF, session) route through here.
- No custom logic — delegates entirely to the config in Task 2.

**Verification:** `GET /api/auth/providers` returns JSON with `credentials` provider listed.

---

### Task 5: Registration endpoint — `src/app/api/auth/register/route.ts`

**Purpose:** POST endpoint to create a new user with org and org_member records. Hashes password, writes audit log.

**Key patterns:**
```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, organizations, orgMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/auth/audit';

export async function POST(request: Request) {
  const { email, password, name, companyName } = await request.json();

  // 1. Validate: email format, password min 8 chars, name required
  // 2. Check if email already exists: db.select().from(users).where(eq(users.email, email))
  //    → return 409 if duplicate
  // 3. Hash password: const hash = await bcrypt.hash(password, 12);
  // 4. Transaction:
  //    a. Insert organization: { name: companyName || `${name}'s Organization` }
  //    b. Insert user: { email, name, passwordHash: hash, orgId: org.id }
  //    c. Insert org_member: { userId: user.id, orgId: org.id, role: 'owner' }
  // 5. writeAuditLog({ userId: user.id, action: 'register' })
  // 6. Return 201 { id, email, name }
}
```

**Notes:**
- Uses database transaction (`db.transaction()`) so org + user + org_member are atomic.
- bcrypt cost factor = 12 (good balance of security and speed for serverless).
- First user of an org always gets `owner` role.
- `companyName` is optional — defaults to `"${name}'s Organization"`.
- Returns 409 on duplicate email, 400 on validation errors, 500 on unexpected errors.

**Verification:** POST to `/api/auth/register` with valid data creates 3 rows (organization, user, org_member) and 1 audit_log entry.

---

### Task 6: Login page — `src/app/(auth)/login/page.tsx`

**Purpose:** Client component with email/password form. Calls NextAuth `signIn('credentials')`.

**Key patterns:**
```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/platform');
    }
  }

  // Render: card centered on screen, email + password inputs, submit button
  // Link to /register at bottom
  // Use ocean/navy brand colors from tailwind config
}
```

**Notes:**
- Uses `(auth)` route group so login/register share a centered layout without the main site header.
- `redirect: false` so we can show inline error messages.
- Redirects to `/platform` on success (platform shell, Phase 4).
- Loading state on button to prevent double-submit.

**Verification:** Form renders at `/login`. Submitting valid credentials redirects to `/platform`. Invalid credentials show inline error.

---

### Task 7: Registration page — `src/app/(auth)/register/page.tsx`

**Purpose:** Client component with registration form. Calls `/api/auth/register` then auto-signs-in.

**Key patterns:**
```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);

    // 1. POST /api/auth/register
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        companyName: formData.get('companyName'),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    // 2. Auto sign-in after successful registration
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    router.push('/platform');
  }

  // Render: card centered on screen
  // Fields: name, email, password, companyName (optional)
  // Link to /login at bottom
}
```

**Notes:**
- Two-step flow: register via API, then auto-sign-in via NextAuth.
- `companyName` field is optional with placeholder text.
- Same centered layout as login page via `(auth)` route group.
- Password field should show minimum length hint (8 chars).

**Verification:** Form renders at `/register`. Submitting creates user + org, auto-signs-in, redirects to `/platform`.

---

### Task 8: Auth layout — `src/app/(auth)/layout.tsx`

**Purpose:** Shared layout for login and register pages. Centered card, no main site navigation.

**Key patterns:**
```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50">
      <div className="w-full max-w-md p-8">
        {/* Logo / brand mark */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900">Shipping Savior</h1>
          <p className="text-navy-500 mt-1">International Logistics Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
```

**Notes:**
- Server component (no `'use client'`).
- Clean, minimal layout — just the brand name and a centered card.
- `bg-navy-50` for subtle background differentiation from white.

**Verification:** Both `/login` and `/register` render inside this layout.

---

### Task 9: Middleware — `src/middleware.ts`

**Purpose:** Protect `/platform/*` routes. Redirect unauthenticated users to `/login`.

**Key patterns:**
```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register');
  const isPlatformRoute = req.nextUrl.pathname.startsWith('/platform');

  // Unauthenticated user hitting /platform/* → redirect to /login
  if (isPlatformRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Authenticated user hitting /login or /register → redirect to /platform
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/platform', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/platform/:path*', '/login', '/register'],
};
```

**Notes:**
- Uses NextAuth v5 `auth()` wrapper for middleware — reads JWT from cookie automatically.
- `matcher` limits middleware to only relevant paths (no overhead on public pages or API routes).
- Authenticated users visiting `/login` or `/register` get redirected to `/platform` (standard UX).
- The `/api/auth/*` routes are NOT in the matcher — NextAuth handles its own auth there.

**Verification:** Visiting `/platform` while unauthenticated redirects to `/login`. After login, visiting `/login` redirects to `/platform`.

---

### Task 10: NextAuth session provider — `src/components/providers/SessionProvider.tsx`

**Purpose:** Wrap the app in NextAuth's `SessionProvider` for client-side `useSession()` access.

**Key patterns:**
```typescript
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

**Root layout update** (`src/app/layout.tsx`):
```typescript
import SessionProvider from '@/components/providers/SessionProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="...">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

**Notes:**
- Separate client component file avoids making the root layout a client component.
- Enables `useSession()` hook in any client component for auth state.

**Verification:** `useSession()` in a client component returns session data after login.

---

### Task 11: TypeScript augmentations — `src/types/next-auth.d.ts`

**Purpose:** Extend NextAuth types to include custom session fields (userId, orgId, role).

**Key patterns:**
```typescript
import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      orgId: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    orgId?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    orgId: string;
    role: string;
  }
}
```

**Notes:**
- Without these augmentations, TypeScript will error on `session.user.orgId` etc.
- Must be in a `.d.ts` file included by `tsconfig.json`.
- Check that `tsconfig.json` includes `src/types` in its type roots or includes.

**Verification:** No TypeScript errors when accessing `session.user.orgId` in code.

---

## Execution Order

Tasks have the following dependency chain:

```
Task 1 (audit helper)
  └── Task 2 (NextAuth config) — imports audit helper
        └── Task 3 (auth exports) — imports config
              ├── Task 4 (route handler) — imports handlers
              ├── Task 5 (register endpoint) — imports audit helper
              └── Task 9 (middleware) — imports auth()
Task 8 (auth layout) — no deps
Task 6 (login page) — needs Task 4 working
Task 7 (register page) — needs Task 4 + Task 5 working
Task 10 (session provider) — needs Task 3
Task 11 (type augmentations) — no deps, do early
```

**Recommended execution waves:**

| Wave | Tasks | Description |
|------|-------|-------------|
| Wave 1 | 1, 8, 11 | Audit helper, auth layout, type declarations (no deps) |
| Wave 2 | 2, 3 | NextAuth config + exports (depends on Task 1) |
| Wave 3 | 4, 5, 9, 10 | Route handler, register API, middleware, session provider (depends on Wave 2) |
| Wave 4 | 6, 7 | Login + register pages (depends on Wave 3) |

---

## Files Created (Summary)

| File | Type | Purpose |
|------|------|---------|
| `src/lib/auth/audit.ts` | Server | Audit log writer for auth events |
| `src/lib/auth/config.ts` | Server | NextAuth v5 configuration |
| `src/lib/auth/index.ts` | Server | Auth exports (auth, signIn, signOut, handlers) |
| `src/app/api/auth/[...nextauth]/route.ts` | API Route | NextAuth HTTP handlers |
| `src/app/api/auth/register/route.ts` | API Route | User registration endpoint |
| `src/app/(auth)/layout.tsx` | Server | Centered auth page layout |
| `src/app/(auth)/login/page.tsx` | Client | Login form |
| `src/app/(auth)/register/page.tsx` | Client | Registration form |
| `src/middleware.ts` | Middleware | Route protection for /platform/* |
| `src/components/providers/SessionProvider.tsx` | Client | NextAuth SessionProvider wrapper |
| `src/types/next-auth.d.ts` | Types | Session type augmentations |

## Files Modified (Summary)

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Wrap children in `<SessionProvider>` |
| `package.json` | Add next-auth, bcryptjs, @types/bcryptjs |

---

## Verification Checklist

After all tasks complete, verify end-to-end:

- [ ] `npm run build` passes with no type errors
- [ ] POST `/api/auth/register` with `{ name, email, password }` returns 201
- [ ] Database has new rows in `organizations`, `users`, `org_members`, `audit_logs`
- [ ] Password in `users` table is a bcrypt hash (starts with `$2a$` or `$2b$`)
- [ ] POST `/api/auth/register` with duplicate email returns 409
- [ ] Sign in at `/login` with registered credentials succeeds, redirects to `/platform`
- [ ] Sign in with wrong password shows inline error
- [ ] `audit_logs` table has entries for: register, login, login_failed
- [ ] Visiting `/platform` while logged out redirects to `/login`
- [ ] Visiting `/login` while logged in redirects to `/platform`
- [ ] `GET /api/auth/session` returns session with `userId`, `orgId`, `role`
- [ ] Sign out clears session, redirects to `/login`

---

*Created: 2026-03-26*
*Phase depends on: Phase 1 (database schema)*
