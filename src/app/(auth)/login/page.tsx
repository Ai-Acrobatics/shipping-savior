'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-xl shadow-card p-8 animate-pulse h-96" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
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

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      // Redirect to invite page if logging in via invite link
      if (inviteToken) {
        router.push(`/invite/${inviteToken}`);
      } else {
        router.push('/platform');
      }
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
        Sign in to your account
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-navy-700"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-ocean-600 hover:text-ocean-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-ocean-600 hover:text-ocean-700 font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
