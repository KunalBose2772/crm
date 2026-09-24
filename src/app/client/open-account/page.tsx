'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Monitor, 
  Scale, 
  Zap, 
  DollarSign, 
  Check, 
  Copy,
  Users,
  TrendingUp,
  Award,
  Shield,
  BarChart3,
  Headphones,
  CheckCheck
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { clsx } from 'clsx';

export default function ClientOpenAccountPage() {
  const router = useRouter();
  const { impersonation, showToast } = useCRM();

  const clientName = impersonation.client?.name || 'test nikita';

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAccount, setSelectedAccount] = useState<'BASIC' | 'STANDARD' | 'VVIP'>('STANDARD');
  const [leverage, setLeverage] = useState('1:300');
  const [isSuccess, setIsSuccess] = useState(false);
  const [newLogin, setNewLogin] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const accountTypes = [
    {
      id: 'BASIC' as const,
      name: 'BASIC',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      tag: 'Starter Account',
      deposit: '$5.00 – $2,500',
      description: 'Engineered for new market entrants with negative balance protection',
      features: [
        'Zero commission per lot',
        'Standard tight spreads',
        'Direct email & desk support',
        'Real-time risk telemetry',
        'Instant server onboarding',
      ],
      highlightsCount: 5,
      server: 'MT5 Live',
      leverageOptions: 'Up to 1:300',
    },
    {
      id: 'STANDARD' as const,
      name: 'STANDARD',
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      tag: 'Professional Account',
      deposit: '$3,000 – $4,000',
      description: 'Optimized for high-volume active traders requiring sub-millisecond execution',
      features: [
        'Tighter spreads from 0.8 pips',
        'Sub-millisecond execution routing',
        'Dedicated trading account manager',
        'Full Expert Advisor (EA) access',
        'Live market liquidity feeds',
      ],
      highlightsCount: 5,
      server: 'MT5 Live',
      leverageOptions: 'Up to 1:500',
    },
    {
      id: 'VVIP' as const,
      name: 'VVIP',
      icon: <Award className="w-5 h-5 text-indigo-600" />,
      tag: 'Partner / IB Account',
      deposit: '$5,000 – $10,000',
      description: 'Exclusive tier with institutional multi-level rebates and white-glove service',
      features: [
        'Multi-tier commission rebates',
        'Live partner network analytics',
        'Institutional order execution',
        'Comprehensive audit reporting',
        'Priority withdrawal processing',
      ],
      highlightsCount: 5,
      server: 'MT5 Live',
      leverageOptions: 'Up to 1:200',
    },
  ];

  const handleSelectAccount = (id: 'BASIC' | 'STANDARD' | 'VVIP') => {
    setSelectedAccount(id);
    setStep(2);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const login = Math.floor(200000000 + Math.random() * 900000000);
    setNewLogin(login);
    setIsSuccess(true);
    showToast('success', 'Account Provisioned', `New MT5 ${selectedAccount} Account #${login} generated successfully.`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', 'Copied', 'Account login copied to clipboard.');
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Trading Workspace"
        badgeIcon={<ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-300" />}
        title="Open a new trading account"
        subtitle={`${clientName}, choose an account type and confirm the setup details before launch.`}
        chips={[
          { label: 'Platform', value: 'MetaTrader 5', icon: <Monitor className="w-3.5 h-3.5 text-blue-200" /> },
          { 
            label: 'Workflow', 
            value: step === 1 ? 'Step 1: Select' : 'Step 2: Configure',
            icon: <Scale className="w-3.5 h-3.5 text-emerald-300" />
          },
        ]}
      />

      {isSuccess ? (
        /* SUCCESS PROVISIONED STATE */
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs text-center space-y-5 max-w-xl mx-auto animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">Account Provisioned</h2>
            <p className="text-xs text-slate-500 mt-1">Your new live MT5 account has been registered on Ocean Markets infrastructure.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">New Account Login</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-extrabold text-blue-700">#{newLogin}</span>
              <button
                type="button"
                onClick={() => handleCopy(newLogin?.toString() || '')}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-2xs transition-colors cursor-pointer"
                title="Copy Login"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-600 font-mono">
              Type: {selectedAccount} • Leverage: {leverage} • Server: Ocean Markets Ltd.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/client/dashboard"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setStep(1);
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Open Another
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        /* STEP 1: SELECT ACCOUNT TYPE */
        <div className="space-y-6 animate-in fade-in">
          {/* Setup Overview Cards */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider font-heading">
                <Sparkles className="w-4 h-4" />
                <span>Choose a setup</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                Select the account type to open
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                The account type defines the trading profile, platform routing, and leverage options available in the next step.
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider font-heading">
                <ShieldCheck className="w-4 h-4" />
                <span>Active setup</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 font-mono mt-2">3</p>
                <p className="text-xs text-slate-500 mt-0.5">account types available for this client profile.</p>
              </div>
            </div>
          </div>

          {/* 3 Main Account Cards (Professional Lucide Icons, No Cheap Emojis) */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-heading">
                  Step 1
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading mt-1">
                  Select account type
                </h3>
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Pick the structure that matches the way you want to trade. You can review leverage, server, and credentials in the next step.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {accountTypes.map((acc) => {
                const isSelected = selectedAccount === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedAccount(acc.id)}
                    className={clsx(
                      'rounded-2xl sm:rounded-3xl border p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between relative cursor-pointer group select-none',
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md scale-[1.01]'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md'
                    )}
                  >
                    <div>
                      {/* Top Row: Professional Lucide Icon Box + Action Button */}
                      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shadow-xs shrink-0">
                          {acc.icon}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAccount(acc.id);
                          }}
                          className={clsx(
                            'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer',
                            isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                          )}
                        >
                          Select setup
                        </button>
                      </div>

                      {/* Highlights & Features */}
                      <div className="mt-4 space-y-2 text-xs">
                        <p className="font-bold text-slate-900 text-sm font-heading">{acc.tag}</p>
                        <p className="font-mono font-bold text-blue-700">Deposit: {acc.deposit}</p>
                        <p className="text-slate-500 leading-relaxed">{acc.description}</p>

                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading mb-1.5">
                            Features
                          </p>
                          <ul className="space-y-1.5 text-slate-600">
                            {acc.features.map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Details Section */}
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                      {/* Title Pill */}
                      <div className="flex justify-center">
                        <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-4 py-2 text-center shadow-2xs">
                          <h4 className="text-xl font-extrabold tracking-tight text-blue-900 font-heading">
                            {acc.name}
                          </h4>
                        </div>
                      </div>

                      {/* Server & Status Grid */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                          <span className="text-[10px] font-bold uppercase text-slate-400 font-heading block">
                            Trading Server
                          </span>
                          <span className="font-bold font-mono text-slate-800 mt-0.5 block">{acc.server}</span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                          <span className="text-[10px] font-bold uppercase text-slate-400 font-heading block">
                            Status
                          </span>
                          <span className="font-bold text-emerald-600 mt-0.5 block">Ready to open</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          {acc.highlightsCount} key features
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {acc.leverageOptions}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: CONFIGURE ACCOUNT */
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6 max-w-3xl mx-auto animate-in fade-in">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider font-heading">
                Step 2 of 2
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading mt-1">
                Account Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Finalize leverage and platform routing for your {selectedAccount} trading account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to types
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Leverage Ratio
                </label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="1:100">1:100 (Conservative)</option>
                  <option value="1:200">1:200 (Balanced)</option>
                  <option value="1:300">1:300 (Standard)</option>
                  <option value="1:500">1:500 (High Leverage)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-1.5 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                  Trading Platform
                </label>
                <input
                  type="text"
                  value="MetaTrader 5 (MT5)"
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold font-mono cursor-not-allowed"
                />
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Launch Summary
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Account</span>
                  <span className="font-extrabold text-slate-900 font-heading">{selectedAccount}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Platform</span>
                  <span className="font-extrabold text-slate-900 font-mono">MT5</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Leverage</span>
                  <span className="font-extrabold text-blue-600 font-mono">{leverage}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Server</span>
                  <span className="font-extrabold text-slate-800 font-mono">Ocean Markets</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Create Trading Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
