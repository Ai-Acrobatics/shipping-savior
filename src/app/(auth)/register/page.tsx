'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ship, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign-in failed. Please try logging in.');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 4 ? 'medium' : 'weak';

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-ocean-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-500 to-indigo-500 flex items-center justify-center">
              <Ship className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-navy-900">Shipping Savior</span>
          </div>
          <p className="text-navy-500">Create your logistics platform account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-card border border-navy-200/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-light"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-light"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-navy-700 mb-1.5">
                Company Name
              </label>
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="input-light"
                placeholder="Acme Logistics"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-light"
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
              {password && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${
                      passwordStrength === 'strong'
                        ? 'text-emerald-500'
                        : passwordStrength === 'medium'
                        ? 'text-amber-500'
                        : 'text-navy-300'
                    }`}
                  />
                  <span
                    className={
                      passwordStrength === 'strong'
                        ? 'text-emerald-600'
                        : passwordStrength === 'medium'
                        ? 'text-amber-600'
                        : 'text-navy-400'
                    }
                  >
                    {passwordStrength === 'strong'
                      ? 'Strong password'
                      : passwordStrength === 'medium'
                      ? 'Add more characters for a stronger password'
                      : 'Too short'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            Already have an account?{' '}
            <Link href="/login" className="text-ocean-600 hover:text-ocean-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Plan info */}
        <p className="mt-4 text-center text-xs text-navy-400">
          Start with a free trial. Upgrade anytime to Starter ($299/mo), Professional ($799/mo), or Enterprise ($2,499/mo).
        </p>
      </div>
    </div>
  );
}
