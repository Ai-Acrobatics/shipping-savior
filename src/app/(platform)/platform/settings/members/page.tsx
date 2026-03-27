'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Trash2,
  Copy,
  Check,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Member {
  memberId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

// ── Role badge colors ────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  owner: { bg: 'bg-purple-100', text: 'text-purple-700' },
  admin: { bg: 'bg-blue-100', text: 'text-blue-700' },
  member: { bg: 'bg-green-100', text: 'text-green-700' },
  viewer: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_BADGE[role] || ROLE_BADGE.member;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${colors.bg} ${colors.text}`}
    >
      <Shield className="w-3 h-3" />
      {role}
    </span>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Current user role (derived from session stored in members)
  const [currentUserRole, setCurrentUserRole] = useState<string>('viewer');

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  // ── Fetch data ──────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch('/api/org/members'),
        fetch('/api/org/invites'),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);

        // Detect current user role from JWT (check for session cookie)
        // We'll infer from the API response — the session user is the one who can access this page
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          const userId = sessionData?.user?.id;
          const myMembership = (data.members || []).find(
            (m: Member) => m.userId === userId
          );
          if (myMembership) {
            setCurrentUserRole(myMembership.role);
          }
        }
      }

      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setPendingInvites(data.invites || []);
      }
    } catch {
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Send invite ─────────────────────────────────────────────────────────────

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    setInviteUrl(null);

    try {
      const res = await fetch('/api/orgs/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || 'Failed to send invite');
        return;
      }

      setInviteUrl(data.inviteUrl);
      setInviteEmail('');
      // Refresh pending invites
      fetchData();
    } catch {
      setInviteError('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  // ── Copy invite URL ─────────────────────────────────────────────────────────

  async function copyInviteUrl() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Remove member ───────────────────────────────────────────────────────────

  async function handleRemoveMember(userId: string, memberName: string) {
    if (!confirm(`Remove ${memberName} from the organization?`)) return;

    try {
      const res = await fetch('/api/org/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to remove member');
        return;
      }

      fetchData();
    } catch {
      alert('Network error. Please try again.');
    }
  }

  // ── Revoke invite ───────────────────────────────────────────────────────────

  async function handleRevokeInvite(inviteId: string) {
    if (!confirm('Revoke this invite?')) return;

    try {
      const res = await fetch('/api/org/invites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch {
      // Silently fail — user can retry
    }
  }

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-ocean-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-navy-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Team Members</h1>
        <p className="text-navy-500 mt-1">
          Manage your organization&apos;s team members and invitations.
        </p>
      </div>

      {/* Invite Form (admin/owner only) */}
      {canManage && (
        <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
            <UserPlus className="w-5 h-5 text-navy-600" />
            <h2 className="font-semibold text-navy-900">Invite Team Member</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2.5 border border-navy-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                {currentUserRole === 'owner' && (
                  <option value="admin">Admin</option>
                )}
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={inviting || !inviteEmail}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-ocean-600 text-white text-sm font-medium rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </form>

            {inviteError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{inviteError}</p>
              </div>
            )}

            {inviteUrl && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium mb-2">
                  Invite created! Share this link:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 px-3 py-2 border border-green-200 rounded-lg text-sm bg-white text-navy-700"
                  />
                  <button
                    onClick={copyInviteUrl}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Members List */}
      <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
          <Users className="w-5 h-5 text-navy-600" />
          <h2 className="font-semibold text-navy-900">
            Members ({members.length})
          </h2>
        </div>
        <div className="divide-y divide-navy-100">
          {members.map((member) => (
            <div
              key={member.memberId}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-white">
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
              <div className="flex items-center gap-3">
                <RoleBadge role={member.role} />
                {canManage && member.role !== 'owner' && (
                  <button
                    onClick={() =>
                      handleRemoveMember(member.userId, member.name)
                    }
                    className="p-1.5 text-navy-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="px-6 py-8 text-center text-navy-400">
              No members found.
            </div>
          )}
        </div>
      </section>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <section className="bg-white border border-navy-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-navy-50 border-b border-navy-200">
            <Clock className="w-5 h-5 text-navy-600" />
            <h2 className="font-semibold text-navy-900">
              Pending Invites ({pendingInvites.length})
            </h2>
          </div>
          <div className="divide-y divide-navy-100">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-navy-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      {invite.email}
                    </p>
                    <p className="text-xs text-navy-400">
                      Expires{' '}
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RoleBadge role={invite.role} />
                  {canManage && (
                    <button
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="p-1.5 text-navy-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Revoke invite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
