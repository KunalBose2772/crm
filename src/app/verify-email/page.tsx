'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ExternalLink 
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { showToast, startImpersonation } = useCRM();

  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
    loginUrl: string;
  } | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hasVerified = React.useRef(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError('No verification token provided in the URL.');
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (data.success && data.credentials) {
          setIsVerified(true);
          setCredentials(data.credentials);
          setClientData(data.client);
          showToast('success', 'Email Verified Successfully', 'Your account credentials have been generated and sent to your email.');
        } else {
          setError(data.error || 'Failed to verify email. The link may have expired.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error while verifying email.');
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token]);

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    showToast('info', 'Copied', `${field} copied to clipboard.`);
  };

  const handleProceedToLogin = () => {
    router.push('/client/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 text-center text-white relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-blue-200 animate-spin" />
            ) : isVerified ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold font-heading">
            {isLoading ? 'Verifying Email...' : isVerified ? 'Email Verified Successfully!' : 'Verification Failed'}
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xs mx-auto">
            {isLoading
              ? 'Please wait while we validate your activation token.'
              : isVerified
              ? 'Your identity has been confirmed and trading workspace is active.'
              : 'The verification link is invalid or has already been used.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {isLoading && (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold">Validating security token...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center space-y-3">
              <p className="text-xs font-bold text-rose-800">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          )}

          {isVerified && credentials && !isLoading && (
            <div className="space-y-5 animate-in fade-in">
              <div className="rounded-2xl bg-blue-50/80 border border-blue-200/80 p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>Save your login credentials.</strong> A copy has also been sent to your email inbox from <strong>ND1 CRM</strong>.
                </div>
              </div>

              {/* Copyable Credentials Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trading Credentials</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                </div>

                {/* Username / Email */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">USER ID / EMAIL</label>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-xs font-mono font-bold text-slate-800 truncate mr-2">{credentials.username}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('Username', credentials.username)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                      title="Copy Username"
                    >
                      {copiedField === 'Username' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">PASSWORD</label>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-xs font-mono font-bold text-slate-800 truncate mr-2">{credentials.password}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('Password', credentials.password)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                      title="Copy Password"
                    >
                      {copiedField === 'Password' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Proceed to Login Button */}
              <button
                type="button"
                onClick={handleProceedToLogin}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Proceed to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
