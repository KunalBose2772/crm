'use client';

import React, { useState, useEffect } from 'react';
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
  Shield,
  HelpCircle,
  X
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

export const IsolatedLoginScreen: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';
  const { login, isAuthenticated } = useCRM();

  // Inputs start completely EMPTY — no demo credentials shown on UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await login(email, password, 'admin');
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

  const features = [
    'Real-time MT4/MT5 bridge & LP liquidity aggregation',
    'Instant crypto USDT (TRC20/ERC20) & wire treasury queues',
    'Automated client KYC & tiered risk compliance scoring',
    'Multi-tier Introducing Broker (IB) automated rebate engine',
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white select-none">
      
      {/* Left Hero Pane - Royal Purple with Blueprint Grid Pattern (Hidden on Mobile for optimal UX) */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-12 xl:p-16 flex-col justify-center text-white relative min-h-screen"
        style={{
          backgroundColor: '#581c87', // Royal Purple
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        {/* Subtle radial ambient lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Center Main Value Proposition (Vertically Balanced, no top suite logo or bottom testimonial) */}
        <div className="max-w-lg space-y-6 relative z-10 my-auto">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15] font-heading">
            Institutional Trading Operations.
            <br />
            Settled with absolute precision.
          </h1>

          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed font-sans font-normal">
            Unified command center for multi-asset trading, automated KYC compliance, MT4/MT5 bridge liquidity, and instant treasury settlements.
          </p>

          {/* Checklist items */}
          <div className="space-y-3.5 pt-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-purple-50 font-sans">
                <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0 stroke-[2.2]" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom subtle trust indicator */}
        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/80 font-sans">
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
          
          {/* Brand Logo placed directly above Admin Portal pill as requested */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 shrink-0">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-heading flex items-center gap-1.5">
                  ND1 <span className="text-purple-600">CRM</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">
                  Broker Operations Suite
                </span>
              </div>
            </div>

            {/* Admin Portal Pill directly below the logo */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/90 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Sign in to your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              Sign in to manage leads, clients &amp; brokerage operations
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
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs font-sans transition-all"
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
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium cursor-pointer transition-colors"
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
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs font-sans transition-all"
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Footer Navigation Row - Clean and minimal */}
        <div className="max-w-md w-full mx-auto pt-6 flex items-center justify-between text-xs text-slate-400 font-sans border-t border-slate-100 mt-6">
          <Link 
            href="/admin/dashboard" 
            className="hover:text-purple-700 transition-colors flex items-center gap-1"
          >
            &larr; Back to platform
          </Link>
          <span className="text-[11px] text-slate-400">
            Internal Authorized Use Only
          </span>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Password Recovery</h3>
              <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
                For security compliance, institutional access credentials must be reset by your SuperAdministrator or updated in system settings.
              </p>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
