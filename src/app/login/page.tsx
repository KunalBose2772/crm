'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admintest@gmail.com');
  const [password, setPassword] = useState('Test123');
  const [role, setRole] = useState<'admin' | 'superadmin' | 'client'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickFill = () => {
    setEmail('admintest@gmail.com');
    setPassword('Test123');
    setRole('admin');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admintest@gmail.com' && password === 'Test123') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_auth_token', 'demo_jwt_token_nd1crm');
          localStorage.setItem('crm_user_role', role);
        }
        router.push('/admin/dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid credentials. Use admintest@gmail.com / Test123');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 items-center justify-center text-white shadow-xl shadow-purple-600/25 mb-1">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
            ND1 CRM <span className="text-purple-600">Admin</span>
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Sign in to access broker operations, client KYC, and financial settlement queues.
          </p>
        </div>

        {/* Quick Demo Fill Pill */}
        <div 
          onClick={handleQuickFill}
          className="p-3 rounded-xl bg-purple-50 border border-purple-200/80 text-xs text-purple-700 flex items-center justify-between cursor-pointer hover:bg-purple-100/70 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-semibold">Click to Autofill Demo Credentials</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded">
            admintest@gmail.com
          </span>
        </div>

        {/* Card Form */}
        <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-purple-900/5 backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-heading">Portal Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['admin', 'superadmin', 'client'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize border cursor-pointer transition-all ${
                      role === r
                        ? 'bg-purple-600 border-purple-600 text-white shadow-xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-heading">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-heading">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs font-sans"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Broker Console
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-sans">
          Secured with SHA-256 Enterprise TLS • ND1 Multi-Asset Brokerage Engine
        </p>
      </div>
    </div>
  );
}
