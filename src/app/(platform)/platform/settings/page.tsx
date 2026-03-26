import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Building2, Users, Lock, ChevronRight } from 'lucide-react';
import { getOrgById, getOrgMembers, getOrgMembership } from '@/lib/db/queries/org';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { user } = session;
  const orgId = user.orgId;

  // Fetch real org data
  const org = orgId ? await getOrgById(orgId) : null;
  const members = orgId ? await getOrgMembers(orgId) : [];
  const membership = orgId ? await getOrgMembership(orgId, user.id!) : null;
  const userRole = membership?.role ?? 'viewer';
  const isOwner = userRole === 'owner';

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-navy-500 mt-1">
          Manage your profile, organization, and team settings.
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
          <User className="w-5 h-5 text-navy-600" />
          <h2 className="font-semibold text-navy-900">Profile</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
              <span className="text-xl font-semibold text-white">
                {user.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) ?? 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-navy-900">{user.name}</p>
              <p className="text-sm text-navy-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={user.name ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
          </div>

          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-navy-400 bg-navy-100 rounded-lg cursor-not-allowed"
            title="Coming soon"
          >
            Edit Profile
          </button>
        </div>
      </section>

      {/* Organization Section */}
      <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
          <Building2 className="w-5 h-5 text-navy-600" />
          <h2 className="font-semibold text-navy-900">Organization</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={org?.name ?? 'No organization'}
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Plan
              </label>
              <input
                type="text"
                value={(org?.plan ?? 'free').charAt(0).toUpperCase() + (org?.plan ?? 'free').slice(1)}
                readOnly
                className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm bg-navy-50 text-navy-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Your Role
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                  userRole === 'owner'
                    ? 'bg-purple-100 text-purple-700'
                    : userRole === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : userRole === 'member'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Lock className="w-3 h-3" />
                {userRole}
              </span>
            </div>
          </div>

          {isOwner ? (
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-navy-400 bg-navy-100 rounded-lg cursor-not-allowed"
              title="Coming soon"
            >
              Edit Organization
            </button>
          ) : null}
        </div>
      </section>

      {/* Team Members Section */}
      <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-navy-50 border-b border-navy-200">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-navy-600" />
            <h2 className="font-semibold text-navy-900">
              Team Members ({members.length})
            </h2>
          </div>
          <Link
            href="/platform/settings/members"
            className="flex items-center gap-1 text-sm text-ocean-600 hover:text-ocean-700 font-medium transition-colors"
          >
            Manage
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-navy-100">
          {members.slice(0, 5).map((member) => (
            <div
              key={member.memberId}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-navy-500">{member.email}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  member.role === 'owner'
                    ? 'bg-purple-100 text-purple-700'
                    : member.role === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : member.role === 'member'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {member.role}
              </span>
            </div>
          ))}
          {members.length > 5 && (
            <div className="px-6 py-3 text-center">
              <Link
                href="/platform/settings/members"
                className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
              >
                View all {members.length} members
              </Link>
            </div>
          )}
          {members.length === 0 && (
            <div className="px-6 py-6 text-center text-navy-400 text-sm">
              No team members yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
