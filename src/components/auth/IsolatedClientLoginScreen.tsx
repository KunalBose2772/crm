'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  User,
  HelpCircle,
  X
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

const ClientLoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/client/dashboard';
  const { clientLogin, clientUser } = useCRM();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // If already authenticated as a client, redirect to destination
  useEffect(() => {
    if (clientUser) {
      router.replace(redirectPath);
    }
  }, [clientUser, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await clientLogin(email, password);
      if (res.success) {
        router.push(redirectPath);
      } else {
        setIsLoading(false);
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setIsLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setIsForgotLoading(true);
    setForgotError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotSent(true);
      } else {
        setForgotError(data.error || 'Failed to dispatch password recovery link.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Network error.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const features = [
    'Real-time MT4/MT5 bridge & LP liquidity aggregation',
    'Instant crypto USDT (TRC20/ERC20) & wire treasury queues',
    'Automated client KYC & tiered risk compliance scoring',
    'Multi-tier Introducing Broker (IB) automated rebate engine',
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white select-none">
      
      {/* Left Hero Pane - Royal Trading Blue with Blueprint Grid Pattern */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-12 xl:p-16 flex-col justify-center text-white relative min-h-screen"
        style={{
          backgroundColor: '#1e3a8a', // Royal Trading Blue
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        {/* Subtle radial ambient lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Center Main Value Proposition */}
        <div className="max-w-lg space-y-6 relative z-10 my-auto">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15] font-heading">
            Institutional Trading Operations.
            <br />
            Settled with absolute precision.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-sans font-normal">
            Unified client desk for multi-asset trading, automated KYC compliance, MT4/MT5 bridge liquidity, and instant treasury settlements.
          </p>

          {/* Checklist items */}
          <div className="space-y-3.5 pt-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-blue-50 font-sans">
                <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0 stroke-[2.2]" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom subtle trust indicator */}
        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/80 font-sans">
          <span>Enterprise Multi-Asset Brokerage Architecture</span>
          <span>SHA-256 TLS • 99.99% Uptime</span>
        </div>
      </div>

      {/* Right Login Form Pane - Pure White & Fully Responsive */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-white min-h-screen">
        
        {/* Top spacer / header */}
        <div className="hidden sm:block" />

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          
          {/* Brand Logo & Client Login Pill */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-heading flex items-center gap-1.5">
                  Test <span className="text-blue-600">Brand</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">
                  Client Trading Desk
                </span>
              </div>
            </div>

            {/* Client Login Pill directly below logo */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/90 text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Client Login</span>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Client Login
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Sign in to manage your MetaTrader 5 live accounts &amp; deposits
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium font-sans">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="client@tradingdesk.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-sans transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 font-sans">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-sans transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in to Client Portal'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Footer Navigation Row */}
        <div className="max-w-md w-full mx-auto pt-6 flex items-center justify-between text-xs text-slate-400 font-sans border-t border-slate-100 mt-6">
          <Link 
            href="/client/dashboard" 
            className="hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            &larr; Back to desk
          </Link>
          <Link
            href="/login"
            className="text-slate-500 hover:text-blue-700 transition-colors font-medium"
          >
            Admin Portal &rarr;
          </Link>
        </div>
      </div>

      {/* Forgot Password Dialog with Live SMTP Dispatch */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                  setForgotError(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Reset Password</h3>
              <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
                Enter your account email address. We will dispatch a password recovery link via Hostinger SMTP immediately.
              </p>
            </div>

            {forgotSent ? (
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Reset Link Dispatched
                  </p>
                  <p className="text-[11px] leading-relaxed text-emerald-600">
                    Please check your inbox at <strong>{forgotEmail}</strong>. Follow the instructions to choose a new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 pt-1">
                {forgotError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {forgotError}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="client@tradingdesk.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isForgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const IsolatedClientLoginScreen: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ClientLoginContent />
    </Suspense>
  );
};
