import { auth } from '@/lib/auth';
import { getInviteByToken, getOrgById } from '@/lib/db/queries/org';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AcceptInviteClient } from './AcceptInviteClient';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // Validate invite server-side
  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <div className="text-red-500 text-4xl mb-4">&#10007;</div>
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Invalid Invite Link</h2>
        <p className="text-navy-500">This invite link is invalid or has been revoked.</p>
      </div>
    );
  }

  if (invite.acceptedAt) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <div className="text-green-500 text-4xl mb-4">&#10003;</div>
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Already Accepted</h2>
        <p className="text-navy-500">This invite has already been accepted.</p>
      </div>
    );
  }

  if (new Date() > invite.expiresAt) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <div className="text-amber-500 text-4xl mb-4">&#9203;</div>
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Invite Expired</h2>
        <p className="text-navy-500">
          This invite has expired. Please ask the organization admin to send a new one.
        </p>
      </div>
    );
  }

  // Get org details
  const org = await getOrgById(invite.orgId);
  const orgName = org?.name ?? 'Organization';

  // Get inviter name
  const [inviter] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, invite.invitedBy))
    .limit(1);
  const inviterName = inviter?.name ?? 'A team member';

  // Check if user is logged in
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  return (
    <AcceptInviteClient
      token={token}
      orgName={orgName}
      inviterName={inviterName}
      role={invite.role}
      email={invite.email}
      isLoggedIn={isLoggedIn}
    />
  );
}
