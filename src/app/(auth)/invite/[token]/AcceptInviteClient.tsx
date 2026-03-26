'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

interface AcceptInviteClientProps {
  token: string;
  orgName: string;
  inviterName: string;
  role: string;
  email: string;
  isLoggedIn: boolean;
}

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  member: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
};

export function AcceptInviteClient({
  token,
  orgName,
  inviterName,
  role,
  email,
  isLoggedIn,
}: AcceptInviteClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleAccept() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orgs/invite/${token}/accept`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to accept invite');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Redirect to platform after short delay
      setTimeout(() => {
        router.push('/platform');
      }, 2000);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <div className="text-green-500 text-4xl mb-4">&#10003;</div>
        <h2 className="text-xl font-semibold text-navy-900 mb-2">
          Welcome to {orgName}!
        </h2>
        <p className="text-navy-500">
          You&apos;ve joined as a <span className="font-medium">{role}</span>. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-8">
      <h2 className="text-xl font-semibold text-navy-900 text-center mb-2">
        You&apos;ve been invited
      </h2>
      <p className="text-navy-500 text-center mb-6">
        {inviterName} invited you to join <span className="font-medium text-navy-700">{orgName}</span>
      </p>

      <div className="bg-navy-50 rounded-lg p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-navy-500">Email</span>
          <span className="text-navy-700 font-medium">{email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-navy-500">Role</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColors[role] || 'bg-gray-100 text-gray-700'}`}
          >
            {role}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {isLoggedIn ? (
        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Joining...' : 'Accept Invite'}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-navy-500 text-center">
            Create an account or sign in to accept this invite.
          </p>
          <Link
            href={`/register?invite=${token}`}
            className="block w-full py-2.5 px-4 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700 text-center transition-colors"
          >
            Create Account
          </Link>
          <Link
            href={`/login?invite=${token}`}
            className="block w-full py-2.5 px-4 rounded-lg border border-navy-200 text-navy-700 font-medium hover:bg-navy-50 text-center transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
