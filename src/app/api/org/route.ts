import { NextResponse } from 'next/server';
import { requireRole, isAuthError, type AuthContext } from '@/lib/auth/rbac';
import { getOrgById, updateOrganization } from '@/lib/db/queries/org';

/**
 * GET /api/org
 * Get current org details for the authenticated user.
 */
export async function GET() {
  const result = await requireRole('calc:view'); // any role can view org info
  if (isAuthError(result)) return result;
  const { orgId } = result as AuthContext;

  try {
    const org = await getOrgById(orgId);
    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      createdAt: org.createdAt,
    });
  } catch (error) {
    console.error('[org] Failed to get organization:', error);
    return NextResponse.json(
      { error: 'Failed to get organization' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/org
 * Update org name and/or slug.
 * Owner only.
 */
export async function PATCH(request: Request) {
  const result = await requireRole('org:manage');
  if (isAuthError(result)) return result;
  const { orgId } = result as AuthContext;

  try {
    const body = await request.json();
    const { name, slug } = body;

    const updates: { name?: string; slug?: string } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Organization name cannot be empty' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (slug !== undefined) {
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        return NextResponse.json(
          { error: 'Organization slug cannot be empty' },
          { status: 400 }
        );
      }
      // Sanitize slug
      const sanitized = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (sanitized.length === 0) {
        return NextResponse.json(
          { error: 'Invalid slug format' },
          { status: 400 }
        );
      }
      updates.slug = sanitized;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await updateOrganization(orgId, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      plan: updated.plan,
    });
  } catch (error) {
    console.error('[org] Failed to update organization:', error);
    // Handle unique constraint violation on slug
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'This slug is already taken' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
