import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, organizations, orgMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/auth/audit';
import { issueVerificationToken } from '@/lib/auth/verification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, companyName, inviteToken } = body;

    // ── Validation ────────────────────────────────────────
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Check for duplicate email ─────────────────────────
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // ── Hash password ─────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Invite flow: create user only (no org) ────────────
    if (inviteToken) {
      const [user] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
        });

      writeAuditLog({
        userId: user.id,
        action: 'register',
        metadata: { email: normalizedEmail, inviteToken },
      });

      // Fire-and-forget: send the verification email. Failures don't block
      // registration — the user can request a resend from /verify-email.
      issueVerificationToken({ userId: user.id, email: normalizedEmail }).catch(
        (err) =>
          console.error('[register] verification email send failed:', err)
      );

      return NextResponse.json(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          inviteToken,
        },
        { status: 201 }
      );
    }

    // ── Standard flow: create org + user + org_member ──────
    const orgName = companyName?.trim() || `${name.trim()}'s Organization`;
    const orgSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 255);

    const result = await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({
          name: orgName,
          slug: orgSlug + '-' + Date.now(), // Ensure unique slug
        })
        .returning({ id: organizations.id });

      const [user] = await tx
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
        });

      await tx.insert(orgMembers).values({
        orgId: org.id,
        userId: user.id,
        role: 'owner',
      });

      return { user, orgId: org.id };
    });

    // ── Audit log (fire-and-forget) ───────────────────────
    writeAuditLog({
      userId: result.user.id,
      orgId: result.orgId,
      action: 'register',
      metadata: { email: normalizedEmail },
    });

    // Fire-and-forget: send the verification email.
    issueVerificationToken({
      userId: result.user.id,
      email: normalizedEmail,
    }).catch((err) =>
      console.error('[register] verification email send failed:', err)
    );

    return NextResponse.json(
      {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[register] Registration failed:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
