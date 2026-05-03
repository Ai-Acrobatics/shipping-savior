'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl shadow-card p-8 animate-pulse h-96" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);

    // 1. Register via API (pass invite token if present)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        companyName: inviteToken ? undefined : formData.get('companyName'),
        inviteToken: inviteToken || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    // 2. Auto sign-in after successful registration
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Account created but sign-in failed. Please try logging in.');
      setLoading(false);
      return;
    }

    // Redirect to invite accept page if registering via invite, otherwise dashboard
    if (inviteToken) {
      router.push(`/invite/${inviteToken}`);
    } else {
      router.push('/platform');
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-navy-500 hover:text-ocean-600 font-medium mb-4 transition-colors"
      >
        <span aria-hidden>←</span> Back to home
      </Link>

      <h2 className="text-xl font-semibold text-navy-900 text-center mb-6">
        Create your account
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-navy-700 mb-1"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-navy-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-navy-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-navy-400">Minimum 8 characters</p>
        </div>

        {!inviteToken && (
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-navy-700 mb-1"
            >
              Company name{' '}
              <span className="text-navy-400 font-normal">(optional)</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
              placeholder="Acme Logistics"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-ocean-600 hover:text-ocean-700 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
