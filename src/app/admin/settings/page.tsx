'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Code, 
  Server, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Copy, 
  Check,
  Globe,
  Layers,
  Sparkles,
  DollarSign,
  Star,
  Plus,
  Trash2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL, USE_MOCK_API } from '@/services/api/endpoints';
import { MT5_ACCOUNT_MAPPING, MT5GroupConfig } from '@/config/mt5';
import { clsx } from 'clsx';

export default function AdminSettingsPage() {
  const { showToast } = useCRM();
  const [activeTab, setActiveTab] = useState<'groups' | 'api' | 'branding' | 'servers' | 'gateways' | 'security'>('groups');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Groups state
  const [groups, setGroups] = useState<Record<string, MT5GroupConfig>>(MT5_ACCOUNT_MAPPING);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>('BASIC');
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSavingGroups, setIsSavingGroups] = useState(false);

  // Form states
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('kunalbose2570@gmail.com');
  const [brandName, setBrandName] = useState('ND1 Capital');
  const [supportEmail, setSupportEmail] = useState('support@testcrm.co.in');
  const [defaultLeverage, setDefaultLeverage] = useState('1:100');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [usdtAddress, setUsdtAddress] = useState('TX9aB2cD4eF6gH8jK1mN3pQ5rS7tU9vW2x');
  const [bankIban, setBankIban] = useState('GB82BARC20000012345678');
  const [bankName, setBankName] = useState('Standard Chartered Bank');
  const [bankBeneficiary, setBankBeneficiary] = useState('Ocean Markets Global Ltd.');
  const [mt5Host, setMt5Host] = useState('access.tgshost.org:26043');
  const [bypassPaymentGateway, setBypassPaymentGateway] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Fetch groups and broker settings on mount
  React.useEffect(() => {
    fetchGroups();
    fetchBrokerSettings();
  }, []);

  const fetchBrokerSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        if (s.adminNotificationEmail) setAdminNotificationEmail(s.adminNotificationEmail);
        if (s.brandName) setBrandName(s.brandName);
        if (s.supportEmail) setSupportEmail(s.supportEmail);
        if (s.defaultLeverage) setDefaultLeverage(s.defaultLeverage);
        if (s.baseCurrency) setBaseCurrency(s.baseCurrency);
        if (s.usdtAddress) setUsdtAddress(s.usdtAddress);
        if (s.bankIban) setBankIban(s.bankIban);
        if (s.bankName) setBankName(s.bankName);
        if (s.bankBeneficiary) setBankBeneficiary(s.bankBeneficiary);
        if (s.mt5Host) setMt5Host(s.mt5Host);
        if (s.bypassPaymentGateway !== undefined) setBypassPaymentGateway(s.bypassPaymentGateway);
      }
    } catch (err: any) {
      console.warn('Error fetching broker settings:', err);
    }
  };

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const res = await fetch('/api/mt5/groups');
      const data = await res.json();
      if (data.success && data.groups) {
        setGroups(data.groups);
        if (!data.groups[selectedGroupKey]) {
          setSelectedGroupKey(Object.keys(data.groups)[0] || 'BASIC');
        }
      }
    } catch (err: any) {
      console.warn('Error fetching account groups:', err);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleUpdateGroupField = (key: string, field: keyof MT5GroupConfig, value: any) => {
    setGroups(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleUpdateFeature = (key: string, index: number, value: string) => {
    setGroups(prev => {
      const currentFeatures = [...(prev[key]?.features || [])];
      currentFeatures[index] = value;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          features: currentFeatures
        }
      };
    });
  };

  const handleAddFeature = (key: string) => {
    setGroups(prev => {
      const currentFeatures = [...(prev[key]?.features || [])];
      currentFeatures.push('New key feature');
      return {
        ...prev,
        [key]: {
          ...prev[key],
          features: currentFeatures,
          highlightsCount: currentFeatures.length
        }
      };
    });
  };

  const handleRemoveFeature = (key: string, index: number) => {
    setGroups(prev => {
      const currentFeatures = [...(prev[key]?.features || [])].filter((_, i) => i !== index);
      return {
        ...prev,
        [key]: {
          ...prev[key],
          features: currentFeatures,
          highlightsCount: currentFeatures.length
        }
      };
    });
  };

  const handleSaveGroups = async () => {
    setIsSavingGroups(true);
    try {
      const res = await fetch('/api/mt5/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Account Groups Updated', 'Account tiers and MT5 group mappings saved to database and live APIs.');
      } else {
        throw new Error(data.error || 'Failed to save groups');
      }
    } catch (err: any) {
      console.error('Error saving groups:', err);
      showToast('error', 'Update Failed', err.message || 'Error updating account groups');
    } finally {
      setIsSavingGroups(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotificationEmail,
          brandName,
          supportEmail,
          defaultLeverage,
          baseCurrency,
          usdtAddress,
          bankIban,
          bankName,
          bankBeneficiary,
          mt5Host,
          bypassPaymentGateway,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Broker Settings Saved', 'Admin email, notification targets, and gateway coordinates updated successfully.');
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      console.error('Error saving broker settings:', err);
      showToast('error', 'Save Failed', err.message || 'Error updating settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">System & Broker Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage brand configuration, account tiers &amp; groups, trading servers, payment gateways, and API mapping.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'groups'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Account Tiers &amp; Groups
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Code className="w-4 h-4" />
          API Mapping Layer
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          Broker Branding
        </button>

        <button
          onClick={() => setActiveTab('servers')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'servers'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Server className="w-4 h-4" />
          Trading Servers (MT4/MT5)
        </button>

        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'gateways'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payment Gateways
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Admin Security & 2FA
        </button>
      </div>

      {/* Tab 0: Account Tiers & Groups Editor */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="MetaTrader 5 Account Tiers & Group Mapping"
              subtitle="Configure account tiers, MT5 group names, deposit bounds, leverage, and promotional features"
              icon={<Layers className="w-5 h-5 text-purple-600" />}
            />
            <CardContent className="space-y-6">
              {/* Top Banner & Refresh */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Live Account Group Mapping Active
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Changes here immediately update the client open-account desk, registration defaults, and the live <code className="px-1.5 py-0.5 rounded bg-white border border-purple-200 font-mono text-purple-700 font-bold">/api/mt5/groups</code> endpoint.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchGroups}
                    disabled={isLoadingGroups}
                    className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-100/60 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={clsx("w-3.5 h-3.5", isLoadingGroups && "animate-spin")} />
                    <span>Reload API</span>
                  </button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveGroups}
                    disabled={isSavingGroups}
                    leftIcon={isSavingGroups ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  >
                    {isSavingGroups ? 'Saving Changes...' : 'Save All Tiers'}
                  </Button>
                </div>
              </div>

              {/* Tier Selector Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {Object.keys(groups).map((key) => {
                  const g = groups[key];
                  const isSelected = selectedGroupKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedGroupKey(key)}
                      className={clsx(
                        "px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs",
                        isSelected
                          ? "bg-purple-600 border-purple-600 text-white shadow-sm ring-2 ring-purple-300"
                          : "bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
                      )}
                    >
                      <span>{g.name || key}</span>
                      <span className={clsx(
                        "px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {g.group}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Editing Form & Live Preview Grid */}
              {groups[selectedGroupKey] && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  {/* Left 2 Cols: Form Inputs */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Tier Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Display Tier Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={groups[selectedGroupKey].name}
                          onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'name', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                          placeholder="e.g. BASIC"
                        />
                      </div>

                      {/* MT5 Group Path */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          MT5 Group Path <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={groups[selectedGroupKey].group}
                          onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'group', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-purple-700 focus:outline-none focus:border-purple-600 shadow-2xs"
                          placeholder="e.g. crmtest\grp1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Tag / Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Category Tag / Subtitle
                        </label>
                        <input
                          type="text"
                          value={groups[selectedGroupKey].tag}
                          onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'tag', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-emerald-700 focus:outline-none focus:border-purple-600 shadow-2xs"
                          placeholder="e.g. Starter Account"
                        />
                      </div>

                      {/* Display Deposit Range */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Deposit Range Text
                        </label>
                        <input
                          type="text"
                          value={groups[selectedGroupKey].deposit}
                          onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'deposit', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 focus:outline-none focus:border-purple-600 shadow-2xs"
                          placeholder="e.g. $5.00 – $2,500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Min Deposit Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Min Deposit ($)
                        </label>
                        <input
                          type="number"
                          value={groups[selectedGroupKey].minDeposit || 0}
                          onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'minDeposit', parseFloat(e.target.value) || 0)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                        />
                      </div>

                      {/* Default Leverage */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Default Leverage
                        </label>
                        <input
                          type="text"
                          value={groups[selectedGroupKey].defaultLeverage}
                          onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'defaultLeverage', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                          placeholder="e.g. 1:100"
                        />
                      </div>

                      {/* Max Leverage */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Max Leverage
                        </label>
                        <input
                          type="text"
                          value={groups[selectedGroupKey].maxLeverage}
                          onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'maxLeverage', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                          placeholder="e.g. 1:300"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Marketing Description
                      </label>
                      <textarea
                        rows={2}
                        value={groups[selectedGroupKey].description}
                        onChange={(e) => handleUpdateGroupField(selectedGroupKey, 'description', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-purple-600 shadow-2xs leading-relaxed"
                        placeholder="Short summary for traders..."
                      />
                    </div>

                    {/* Features List Manager */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Account Features &amp; Bullet Points
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddFeature(selectedGroupKey)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Bullet Point</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(groups[selectedGroupKey].features || []).map((feat, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => handleUpdateFeature(selectedGroupKey, index, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(selectedGroupKey, index)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete point"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right 1 Col: Real-time Live Preview Card (Matches screenshot exactly!) */}
                  <div>
                    <div className="sticky top-24 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                          Live Client Preview
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Active State
                        </span>
                      </div>

                      {/* The exact Card UI rendered for clients */}
                      <div className="relative p-5 rounded-2xl sm:rounded-3xl border border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md flex flex-col justify-between select-none">
                        <div>
                          {/* Top: Icon + Radio Indicator */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                              {selectedGroupKey === 'BASIC' ? (
                                <Sparkles className="w-5 h-5 text-amber-500" />
                              ) : selectedGroupKey === 'STANDARD' ? (
                                <DollarSign className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Star className="w-5 h-5 text-indigo-600" />
                              )}
                            </div>
                            <div className="w-6 h-6 rounded-full border border-blue-600 bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>

                          {/* Title & Tags */}
                          <h4 className="text-lg font-extrabold text-slate-900 font-heading tracking-tight">
                            {groups[selectedGroupKey].name}
                          </h4>
                          <div className="mt-1 flex flex-col gap-0.5 text-xs font-semibold">
                            <span className="text-emerald-700 font-bold">{groups[selectedGroupKey].tag}</span>
                            <span className="text-blue-700 font-mono font-bold">Deposit: {groups[selectedGroupKey].deposit}</span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                            {groups[selectedGroupKey].description}
                          </p>

                          {/* Features */}
                          <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-600 leading-snug">
                            {groups[selectedGroupKey].features?.join(' • ')}
                          </div>
                        </div>

                        {/* Bottom Group Badge & Leverage */}
                        <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-bold text-slate-600">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-slate-800 text-[10px]">
                            {groups[selectedGroupKey].group}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[10px] flex items-center gap-1 font-mono">
                            <span>Up to {groups[selectedGroupKey].maxLeverage}</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="primary"
                          className="w-full"
                          onClick={handleSaveGroups}
                          disabled={isSavingGroups}
                          leftIcon={isSavingGroups ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        >
                          {isSavingGroups ? 'Publishing to APIs...' : 'Publish Tier Changes'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 1: API Mapping Documentation */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Backend API Integration Center"
              subtitle="Map your live backend endpoints effortlessly"
              icon={<Code className="w-5 h-5 text-purple-600" />}
            />
            <CardContent className="space-y-6">
              {/* Status Box */}
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-900">
                      API Abstraction Status: {USE_MOCK_API ? 'Mock Data Active' : 'Live Connected'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Base URL: <code className="px-1.5 py-0.5 rounded bg-white border border-purple-200 font-mono text-purple-700 font-bold">{API_BASE_URL}</code>
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-mono font-bold text-purple-800 shadow-2xs">
                  NEXT_PUBLIC_USE_MOCK_API={String(USE_MOCK_API)}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  How to map your live API endpoints:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">1</span>
                    <h5 className="font-bold text-slate-900">Edit Endpoints Registry</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Open <code className="text-purple-700 font-bold">src/services/api/endpoints.ts</code> and update the REST paths to match your server.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">2</span>
                    <h5 className="font-bold text-slate-900">Set Environment Variables</h5>
                    <p className="text-slate-600 leading-relaxed">
                      In <code className="text-purple-700 font-bold">.env.local</code> set <code className="text-slate-800 font-bold">NEXT_PUBLIC_API_BASE_URL</code> to your server URL.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">3</span>
                    <h5 className="font-bold text-slate-900">Disable Mock Engine</h5>
                    <p className="text-slate-600 leading-relaxed">
                      Set <code className="text-slate-800 font-bold">NEXT_PUBLIC_USE_MOCK_API=false</code>. All UI components will now call live endpoints!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Branding */}
      {activeTab === 'branding' && (
        <Card>
          <CardHeader
            title="Broker Identity & Defaults"
            subtitle="Configure public portal branding and customer defaults"
            icon={<Globe className="w-5 h-5 text-purple-600" />}
          />
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Broker Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Desk Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Primary Admin Notification Email <span className="text-purple-600 font-normal">(Receives KYC &amp; Account Alerts)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminNotificationEmail}
                    onChange={e => setAdminNotificationEmail(e.target.value)}
                    placeholder="admin@brokerage.com"
                    className="w-full px-3.5 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-bold text-purple-950 focus:outline-none focus:border-purple-600 shadow-2xs font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    System emails for KYC submissions, new client registrations, and account openings are routed here.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Account Leverage</label>
                  <select
                    value={defaultLeverage}
                    onChange={e => setDefaultLeverage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer"
                  >
                    <option value="1:100">1:100</option>
                    <option value="1:200">1:200</option>
                    <option value="1:400">1:400</option>
                    <option value="1:500">1:500</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Accounting Currency</label>
                <select 
                  value={baseCurrency}
                  onChange={e => setBaseCurrency(e.target.value)}
                  className="w-full max-w-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="flex justify-end pt-3">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSavingSettings}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {isSavingSettings ? 'Saving Settings...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Trading Servers */}
      {activeTab === 'servers' && (
        <Card>
          <CardHeader
            title="MetaTrader & cTrader Bridge"
            subtitle="Configure server cluster connections for automated account provisioning"
            icon={<Server className="w-5 h-5 text-purple-600" />}
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">MetaTrader 5 Live Server Host</label>
                <input
                  type="text"
                  value={mt5Host}
                  onChange={e => setMt5Host(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">MetaTrader 4 Manager API Gateway</label>
                <input
                  type="text"
                  defaultValue="mt4.testcrm.co.in:443"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Trading Server Bridge is Connected (Ping: 12ms)</span>
              </div>
              <Button size="sm" variant="outline">Test Ping</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Payment Gateways */}
      {activeTab === 'gateways' && (
        <Card>
          <CardHeader
            title="Treasury Receiving Gateways & Gateway Mode"
            subtitle="Configure crypto wallet addresses, bank coordinates, and automated payment gateway bypass"
            icon={<CreditCard className="w-5 h-5 text-purple-600" />}
          />
          <CardContent className="space-y-6">
            {/* PAYMENT GATEWAY BYPASS TOGGLE BANNER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider font-heading">
                      {bypassPaymentGateway ? 'Bypass Active (Direct Proof Mode)' : 'External Gateway Active'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      Payment Gateway Temporary Bypass Mode
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    When active, clients can select Crypto USDT or Bank Wire, view your treasury details, and submit deposit requests with receipts without requiring an active third-party merchant API (Stripe, Coingate, etc.). You can approve deposits manually in <strong>Finance &rarr; Deposits</strong> to credit MT5 accounts instantly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setBypassPaymentGateway(!bypassPaymentGateway)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer",
                    bypassPaymentGateway
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  )}
                >
                  {bypassPaymentGateway ? 'Bypass Enabled' : 'Enable Bypass Mode'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary USDT (TRC-20) Deposit Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={usdtAddress}
                  onChange={e => setUsdtAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-purple-900 font-mono font-bold focus:outline-none focus:border-purple-600 shadow-2xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopy(usdtAddress, 'usdt')}
                >
                  {copiedKey === 'usdt' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">This address will be presented to clients when depositing via Cryptocurrency USDT TRC-20.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Beneficiary Name / Account Title
                </label>
                <input
                  type="text"
                  value={bankBeneficiary}
                  onChange={e => setBankBeneficiary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Institutional Wire Beneficiary IBAN / Account Number
                </label>
                <input
                  type="text"
                  value={bankIban}
                  onChange={e => setBankIban(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-purple-900 font-mono font-bold focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button 
                variant="primary" 
                disabled={isSavingSettings}
                onClick={handleSave}
              >
                {isSavingSettings ? 'Saving...' : 'Save Gateways & Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Security */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader
            title="Security & Access Policies"
            subtitle="Manage administrator privileges, two-factor authentication, and IP whitelisting"
            icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
          />
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</h5>
                <p className="text-slate-500 mt-0.5">Enforce Google Authenticator / TOTP for all broker admins</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                ENFORCED
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Automated Idle Session Timeout</h5>
                <p className="text-slate-500 mt-0.5">Log out admins after 15 minutes of inactivity</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-bold">
                15 MIN
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
