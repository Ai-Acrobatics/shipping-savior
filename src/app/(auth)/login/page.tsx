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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.737 2.986-4.295 2.986-7.351z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.227-2.51c-.895.6-2.04.955-3.391.955-2.605 0-4.81-1.76-5.595-4.123H3.073v2.59A9.997 9.997 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.405 13.9A6.005 6.005 0 0 1 6.09 12c0-.66.114-1.302.314-1.9V7.51H3.073A10.003 10.003 0 0 0 2 12c0 1.614.387 3.14 1.073 4.49l3.332-2.59z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.787.504 3.823 1.495l2.866-2.866C16.96 3.07 14.696 2 12 2 8.099 2 4.728 4.236 3.073 7.51l3.332 2.59C7.19 7.737 9.395 5.977 12 5.977z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.27-.01-.99-.02-1.94-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const verified = searchParams.get('verified') === '1';
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

  function handleOAuth(provider: 'google' | 'github') {
    const callbackUrl = inviteToken ? `/invite/${inviteToken}` : '/platform';
    void signIn(provider, { callbackUrl });
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-8">
      <h2 className="text-xl font-semibold text-navy-900 text-center mb-6">
        Sign in to your account
      </h2>

      {verified && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
          Email verified. Sign in to continue.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-2 mb-5">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-navy-200 bg-white text-navy-800 font-medium text-sm hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth('github')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-navy-200 bg-navy-900 text-white font-medium text-sm hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-colors"
        >
          <GitHubIcon />
          Continue with GitHub
        </button>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-navy-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-navy-400">or</span>
        </div>
      </div>

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
