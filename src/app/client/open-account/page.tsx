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
  Check, 
  Copy,
  Users,
  TrendingUp,
  Award,
  CheckCheck,
  Loader2,
  Key,
  Server
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { MT5_ACCOUNT_MAPPING, MT5_CONFIG, MT5AccountType } from '@/config/mt5';
import { clsx } from 'clsx';

export default function ClientOpenAccountPage() {
  const router = useRouter();
  const { clients, impersonation, clientUser, showToast, addTradingAccount } = useCRM();
  const rawClient = impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;
  const clientName = client?.name || 'Trading Client';

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAccount, setSelectedAccount] = useState<'BASIC' | 'STANDARD' | 'VVIP'>('STANDARD');
  const [leverage, setLeverage] = useState('1:300');
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newLogin, setNewLogin] = useState<number | null>(null);
  const [createdGroup, setCreatedGroup] = useState('');
  const [createdServer, setCreatedServer] = useState(MT5_CONFIG.serverName);
  const [createdPasswords, setCreatedPasswords] = useState<{ main?: string; investor?: string }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [groupMappings, setGroupMappings] = useState<Record<string, any>>(MT5_ACCOUNT_MAPPING);

  // Fetch live account group configurations from backend API
  React.useEffect(() => {
    fetch('/api/mt5/groups')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.groups) {
          setGroupMappings(data.groups);
        }
      })
      .catch(err => console.warn('Could not fetch live groups, using fallback:', err));
  }, []);

  const basicConfig = groupMappings.BASIC || MT5_ACCOUNT_MAPPING.BASIC;
  const standardConfig = groupMappings.STANDARD || MT5_ACCOUNT_MAPPING.STANDARD;
  const vvipConfig = groupMappings.VVIP || MT5_ACCOUNT_MAPPING.VVIP;

  const accountTypes = [
    {
      id: 'BASIC' as const,
      name: basicConfig.name,
      group: basicConfig.group,
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      tag: basicConfig.tag,
      deposit: basicConfig.deposit,
      description: basicConfig.description,
      features: basicConfig.features,
      highlightsCount: basicConfig.highlightsCount || basicConfig.features?.length || 5,
      server: basicConfig.server || MT5_CONFIG.serverName,
      leverageOptions: `Up to ${basicConfig.maxLeverage || '1:300'}`,
    },
    {
      id: 'STANDARD' as const,
      name: standardConfig.name,
      group: standardConfig.group,
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      tag: standardConfig.tag,
      deposit: standardConfig.deposit,
      description: standardConfig.description,
      features: standardConfig.features,
      highlightsCount: standardConfig.highlightsCount || standardConfig.features?.length || 5,
      server: standardConfig.server || MT5_CONFIG.serverName,
      leverageOptions: `Up to ${standardConfig.maxLeverage || '1:500'}`,
    },
    {
      id: 'VVIP' as const,
      name: vvipConfig.name,
      group: vvipConfig.group,
      icon: <Award className="w-5 h-5 text-indigo-600" />,
      tag: vvipConfig.tag,
      deposit: vvipConfig.deposit,
      description: vvipConfig.description,
      features: vvipConfig.features,
      highlightsCount: vvipConfig.highlightsCount || vvipConfig.features?.length || 5,
      server: vvipConfig.server || MT5_CONFIG.serverName,
      leverageOptions: `Up to ${vvipConfig.maxLeverage || '1:200'}`,
    },
  ];

  const handleSelectAccount = (id: 'BASIC' | 'STANDARD' | 'VVIP') => {
    setSelectedAccount(id);
    const chosen = groupMappings[id] || MT5_ACCOUNT_MAPPING[id];
    setLeverage(chosen.defaultLeverage || '1:100');
    setStep(2);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch('/api/mt5/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client?.id,
          clientName,
          email: client?.email || `${clientName.toLowerCase().replace(/\s+/g, '')}@testcrm.co.in`,
          accountType: selectedAccount,
          leverage,
        }),
      });

      const data = await res.json();

      if (data.success && data.account) {
        const loginNum = parseInt(data.account.login, 10);
        setNewLogin(loginNum);
        setCreatedGroup(data.account.group);
        setCreatedServer(data.account.server || MT5_CONFIG.serverName);
        setCreatedPasswords({
          main: data.account.mainPassword,
          investor: data.account.investorPassword,
        });

        // Add to client's account ledger
        addTradingAccount({
          id: `acc_${data.account.login}`,
          login: loginNum,
          platform: 'MT5',
          type: selectedAccount,
          currency: 'USD',
          balance: 0,
          equity: 0,
          freeMargin: 0,
          marginLevel: 0,
          leverage: leverage,
          server: data.account.server || MT5_CONFIG.serverName,
          group: data.account.group,
          mainPassword: data.account.mainPassword,
          investorPassword: data.account.investorPassword,
          createdAt: new Date().toISOString(),
        });

        setIsSuccess(true);
        showToast(
          'success',
          'Live Account Provisioned',
          `New MT5 ${selectedAccount} Account #${loginNum} generated in ${data.account.group}.`
        );
      } else {
        throw new Error(data.error || 'Server error provisioning account');
      }
    } catch (err: any) {
      console.error('Account creation error:', err);
      showToast('error', 'Provisioning Failed', err.message || 'Could not connect to MT5 server.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    showToast('info', 'Copied', `${field} copied to clipboard.`);
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
          {
            label: 'Server',
            value: MT5_CONFIG.serverName,
            icon: <Server className="w-3.5 h-3.5 text-blue-200" />
          }
        ]}
      />

      {isSuccess ? (
        /* SUCCESS PROVISIONED STATE */
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs text-center space-y-6 max-w-xl mx-auto animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider font-heading mb-1.5">
              Live MT5 Account Active
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">Account Provisioned</h2>
            <p className="text-xs text-slate-500 mt-1">Your new live MT5 account has been registered on {createdServer}.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3.5">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">New Account Login</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-mono text-3xl font-extrabold text-blue-700">#{newLogin}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('Account Login', newLogin?.toString() || '')}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-2xs transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Copy Login"
                >
                  {copiedField === 'Account Login' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedField === 'Account Login' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Trading Password</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xs font-bold text-slate-900">{createdPasswords.main || '••••••••'}</span>
                  {createdPasswords.main && (
                    <button
                      type="button"
                      onClick={() => handleCopy('Password', createdPasswords.main!)}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      {copiedField === 'Password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Investor Password</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xs font-bold text-slate-900">{createdPasswords.investor || '••••••••'}</span>
                  {createdPasswords.investor && (
                    <button
                      type="button"
                      onClick={() => handleCopy('Investor Password', createdPasswords.investor!)}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      {copiedField === 'Investor Password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Summary */}
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono">
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-sans">Type</span>
                <span className="font-bold text-slate-800">{selectedAccount}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-sans">Group</span>
                <span className="font-bold text-slate-800">{createdGroup || MT5_ACCOUNT_MAPPING[selectedAccount].group}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-sans">Leverage</span>
                <span className="font-bold text-blue-600">{leverage}</span>
              </div>
            </div>
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
                <span>Active Server</span>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 font-mono mt-2 truncate">{MT5_CONFIG.serverName}</p>
                <p className="text-xs text-slate-500 mt-0.5">3 active tier groups configured on server.</p>
              </div>
            </div>
          </div>

          {/* 3 Main Account Cards */}
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
                    onClick={() => handleSelectAccount(acc.id)}
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
                            'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5',
                            isSelected
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
                          )}
                        >
                          <span>{isSelected ? 'Configure' : 'Select'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
                            {(acc.features || []).map((feat: any, idx: number) => (
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

                      {/* Server & Group Grid */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
                          <span className="text-[10px] font-bold uppercase text-slate-400 font-heading block">
                            MT5 Group
                          </span>
                          <span className="font-bold font-mono text-slate-800 mt-0.5 block truncate">{acc.group}</span>
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

                      {/* Prominent Card Action Button */}
                      <div className="pt-2">
                        <div
                          className={clsx(
                            "w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs",
                            isSelected
                              ? "bg-blue-600 text-white group-hover:bg-blue-700"
                              : "bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700"
                          )}
                        >
                          <span>{isSelected ? `Proceed with ${acc.name}` : `Select ${acc.name} & Continue`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Next Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-blue-200/60 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 shadow-xs">
              <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                      Selected Setup:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold font-mono tracking-wide">
                      {selectedAccount}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({MT5_ACCOUNT_MAPPING[selectedAccount].group})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {accountTypes.find(a => a.id === selectedAccount)?.tag} • {accountTypes.find(a => a.id === selectedAccount)?.deposit}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <span>Next: Configure {selectedAccount} Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
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
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Group</span>
                  <span className="font-extrabold text-slate-900 font-mono">{MT5_ACCOUNT_MAPPING[selectedAccount].group}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Leverage</span>
                  <span className="font-extrabold text-blue-600 font-mono">{leverage}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-mono block">Server</span>
                  <span className="font-extrabold text-slate-800 font-mono">{MT5_CONFIG.serverName}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isCreating}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Provisioning on MT5...</span>
                  </>
                ) : (
                  <>
                    <span>Create Trading Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
