'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  DollarSign, 
  Star, 
  Monitor, 
  Scale, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Check,
  Copy,
  Loader2,
  Server
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { MT5_ACCOUNT_MAPPING, MT5_CONFIG } from '@/config/mt5';
import { clsx } from 'clsx';

interface OpenAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenAccountModal: React.FC<OpenAccountModalProps> = ({ isOpen, onClose }) => {
  const { showToast, impersonation, clientUser, clients, addTradingAccount } = useCRM();

  const rawClient = impersonation.client || clientUser || clients[0];
  const activeClient = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;
  const clientName = activeClient?.name || 'Trading Client';
  const clientEmail = activeClient?.email || `${clientName.toLowerCase().replace(/\s+/g, '')}@livecrm.com`;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<'BASIC' | 'STANDARD' | 'VVIP'>('STANDARD');
  const [leverage, setLeverage] = useState('1:300');
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newLogin, setNewLogin] = useState<number | null>(null);
  const [createdGroup, setCreatedGroup] = useState('');
  const [createdServer, setCreatedServer] = useState(MT5_CONFIG.serverName);
  const [createdPasswords, setCreatedPasswords] = useState<{ main?: string; investor?: string }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [groupMappings, setGroupMappings] = useState<Record<string, any>>(MT5_ACCOUNT_MAPPING);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/mt5/groups')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.groups) {
            setGroupMappings(data.groups);
          }
        })
        .catch(err => console.warn('Could not fetch live groups in modal:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    onClose();
  };

  const handleCreate = async () => {
    setIsCreating(true);

    try {
      const res = await fetch('/api/mt5/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          email: clientEmail,
          accountType: selectedType,
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
          type: selectedType,
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
          `New MT5 ${selectedType} Account #${loginNum} generated in ${data.account.group}.`
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

  const basicConfig = groupMappings.BASIC || MT5_ACCOUNT_MAPPING.BASIC;
  const standardConfig = groupMappings.STANDARD || MT5_ACCOUNT_MAPPING.STANDARD;
  const vvipConfig = groupMappings.VVIP || MT5_ACCOUNT_MAPPING.VVIP;

  const accountTypes = [
    {
      id: 'BASIC' as const,
      name: basicConfig.name,
      group: basicConfig.group,
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      tag: basicConfig.tag,
      deposit: basicConfig.deposit,
      description: basicConfig.description,
      features: Array.isArray(basicConfig.features) ? basicConfig.features.join(' • ') : basicConfig.features || 'Low minimum deposit • Instant execution',
      platform: 'MT5',
      leverageOptions: `Up to ${basicConfig.maxLeverage || '1:300'}`,
    },
    {
      id: 'STANDARD' as const,
      name: standardConfig.name,
      group: standardConfig.group,
      icon: <DollarSign className="w-5 h-5 text-blue-600" />,
      tag: standardConfig.tag,
      deposit: standardConfig.deposit,
      description: standardConfig.description,
      features: Array.isArray(standardConfig.features) ? standardConfig.features.join(' • ') : standardConfig.features || 'Tighter spreads from 0.8 pips • Zero commission',
      platform: 'MT5',
      leverageOptions: `Up to ${standardConfig.maxLeverage || '1:500'}`,
    },
    {
      id: 'VVIP' as const,
      name: vvipConfig.name,
      group: vvipConfig.group,
      icon: <Star className="w-5 h-5 text-indigo-600" />,
      tag: vvipConfig.tag,
      deposit: vvipConfig.deposit,
      description: vvipConfig.description,
      features: Array.isArray(vvipConfig.features) ? vvipConfig.features.join(' • ') : vvipConfig.features || 'Multi-level rebate structure • Institutional liquidity',
      platform: 'MT5',
      leverageOptions: `Up to ${vvipConfig.maxLeverage || '1:200'}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none flex items-start sm:items-center justify-center">
      <div className="relative w-full max-w-4xl my-auto bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 font-sans flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]">
        {/* Header Bar - Sticky Top */}
        <div className="p-3.5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/90 sticky top-0 z-10 shrink-0">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider font-heading">
              {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading mt-1 flex items-center gap-2 truncate">
              {step === 1 ? 'Open New Trading Account' : 'Account Configuration'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
              {step === 1
                ? 'Select the setup that matches your strategy and risk profile'
                : `Finalize leverage and platform details on ${MT5_CONFIG.serverName}`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-3.5 sm:p-6 sm:py-7 flex-1 overflow-y-auto custom-scrollbar">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5 max-w-md mx-auto animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider font-heading mb-1.5">
                  Live MT5 Account Active
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-heading">Account Ready</h3>
                <p className="text-xs text-slate-500 mt-1">Your live trading account is provisioned on {createdServer}.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Trading Account Login</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="font-mono text-3xl font-extrabold text-blue-700">#{newLogin}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy('Account Login', newLogin?.toString() || '')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-2xs transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    >
                      {copiedField === 'Account Login' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedField === 'Account Login' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Password</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono text-xs font-bold text-slate-800">{createdPasswords.main || '••••••••'}</span>
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

                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Investor</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono text-xs font-bold text-slate-800">{createdPasswords.investor || '••••••••'}</span>
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

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 font-mono flex items-center justify-between">
                  <span>Type: <strong className="text-slate-800">{selectedType}</strong></span>
                  <span>Group: <strong className="text-slate-800">{createdGroup || MT5_ACCOUNT_MAPPING[selectedType].group}</strong></span>
                  <span>Leverage: <strong className="text-blue-600">{leverage}</strong></span>
                </div>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 1: 3 Account Type Cards */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                {accountTypes.map((acc) => {
                  const isSelected = selectedType === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setSelectedType(acc.id);
                        setLeverage(MT5_ACCOUNT_MAPPING[acc.id].defaultLeverage);
                      }}
                      className={clsx(
                        'relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none',
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                      )}
                    >
                      <div>
                        {/* Top: Icon + Radio Indicator */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center">
                            {acc.icon}
                          </div>
                          <div
                            className={clsx(
                              'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Title & Tags */}
                        <h4 className="text-base font-extrabold text-slate-900 font-heading tracking-tight">
                          {acc.name}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-semibold text-slate-600">
                          <span className="text-emerald-700">{acc.tag}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-blue-700 font-mono">Deposit: {acc.deposit}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {acc.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                          {acc.features}
                        </p>
                      </div>

                      {/* Bottom Badges */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono">
                          {acc.group}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          <Scale className="w-3 h-3 text-slate-400" />
                          {acc.leverageOptions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700 font-heading uppercase text-[10px] tracking-wider mr-1.5">
                    Selected Setup:
                  </span>
                  <span className="font-bold text-blue-700 font-mono">{selectedType}</span> ({MT5_ACCOUNT_MAPPING[selectedType].group})
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer self-end sm:self-auto active:scale-95"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Configure Details */
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left 2 Cols: Form */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Leverage Setting
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
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block mb-2 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-blue-600" />
                      Trading Platform
                    </label>
                    <input
                      type="text"
                      value="MT5 (MetaTrader 5)"
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Right 1 Col: Quick Summary Box */}
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                    Quick Summary
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">Account Type</span>
                      <span className="font-extrabold text-slate-900 font-heading">{selectedType}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">MT5 Group</span>
                      <span className="font-extrabold text-blue-700 font-mono">{MT5_ACCOUNT_MAPPING[selectedType].group}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">Leverage</span>
                      <span className="font-extrabold text-blue-600 font-mono">{leverage}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono block">Server</span>
                      <span className="font-bold text-slate-800 font-mono">{MT5_CONFIG.serverName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
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
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning on MT5...</span>
                    </>
                  ) : (
                    <span>Create Trading Account</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
