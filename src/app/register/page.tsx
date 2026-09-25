'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Gift, 
  TrendingUp, 
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { clsx } from 'clsx';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, ibPartners } = useCRM();

  // Read referral/IB parameters from URL (e.g. ?ib=REF750828 or ?ref=REF750828)
  const ibCodeFromUrl = searchParams.get('ib') || searchParams.get('ref') || '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [referralCode, setReferralCode] = useState(ibCodeFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<any>(null);

  // Auto-fill and lookup partner details
  const matchedPartner = referralCode
    ? ibPartners.find(p => p.referralCode?.toLowerCase() === referralCode.toLowerCase())
    : null;

  useEffect(() => {
    if (ibCodeFromUrl) {
      setReferralCode(ibCodeFromUrl);
    }
  }, [ibCodeFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Risk Disclosure.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || '+44 7911 123456',
          country: country || 'United Kingdom',
          password: password || undefined,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create client registration.');
      }

      setRegisteredSuccess(data);
      showToast('success', 'Registration Submitted', 'Verification link dispatched to your email address.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none font-sans text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>MetaTrader 5 Client Portal</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          Create Trading Account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Instant MetaTrader 5 account allocation with institutional spreads and automated settlement.
        </p>

        {/* Partner Referral Banner if code is present */}
        {referralCode && (
          <div className="mt-4 mx-4 sm:mx-0 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/40 text-left flex items-start gap-3 shadow-md">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 shrink-0 mt-0.5">
              <Gift className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300">
                  Referred Invitation
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 font-mono text-[10px] font-bold">
                  {referralCode}
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                {matchedPartner ? `Partner Desk: ${matchedPartner.name}` : `Affiliate Code Applied`}
              </p>
              <p className="text-[11px] text-slate-400">
                You will automatically qualify for tier rebates and preferred spreads upon activation.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/90 py-8 px-5 sm:px-10 shadow-2xl rounded-3xl border border-slate-800/80 backdrop-blur-xl">
          {registeredSuccess ? (
            /* SUCCESS ACTIVATION CONFIRMATION */
            <div className="space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white font-heading">
                  Check Your Inbox to Activate
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  We have dispatched a verification email to{' '}
                  <strong className="text-blue-400">{registeredSuccess.client?.email || email}</strong>.
                  Please click the link inside to verify your account and receive your MT5 trading credentials.
                </p>
              </div>

              {/* Direct Verification Shortcut for Local Development */}
              {registeredSuccess.verificationUrl && (
                <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-left space-y-2">
                  <p className="text-[11px] font-mono font-bold uppercase text-blue-300">
                    Instant Activation Link
                  </p>
                  <p className="text-xs text-slate-300 break-all font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {registeredSuccess.verificationUrl}
                  </p>
                  <a
                    href={registeredSuccess.verificationUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline pt-1"
                  >
                    <span>Click here to complete email verification now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/client/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  <span>Go to Client Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+44 7911 123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Country of Residence
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="India">India</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Germany">Germany</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other Global</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Referral / Partner Code */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Partner / Referral Code (Optional)
                  </label>
                  {matchedPartner && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      ✓ Verified IB: {matchedPartner.name}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Gift className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. REF750828"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Portal Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Create secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    I confirm that I am 18+ years old and agree to the <strong>Customer Agreement</strong>, <strong>Privacy Policy</strong>, and acknowledge the financial risk associated with leveraged FX/CFD trading.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating MetaTrader 5 Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Open Live Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link href="/client/login" className="font-bold text-blue-400 hover:text-blue-300 hover:underline">
                    Sign in here
                  </Link>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Loading registration desk...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
