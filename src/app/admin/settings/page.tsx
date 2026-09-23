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
  Globe
} from 'lucide-react';
import { API_BASE_URL, USE_MOCK_API } from '@/services/api/endpoints';

export default function AdminSettingsPage() {
  const { showToast } = useCRM();
  const [activeTab, setActiveTab] = useState<'branding' | 'api' | 'servers' | 'gateways' | 'security'>('api');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states
  const [brandName, setBrandName] = useState('ND1 Capital / Test Brand');
  const [supportEmail, setSupportEmail] = useState('support@testcrm.co.in');
  const [defaultLeverage, setDefaultLeverage] = useState('1:500');
  const [usdtAddress, setUsdtAddress] = useState('TYDzsYUEpvnYmQk4zGP9s263VSt59b74bK');
  const [mt5Host, setMt5Host] = useState('mt5.testcrm.co.in:443');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Settings Saved', 'Broker configuration has been updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">System & Broker Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage brand configuration, trading servers, payment gateways, and your backend API mapping.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
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

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Accounting Currency</label>
                  <select className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                  Save Changes
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
            title="Treasury Receiving Gateways"
            subtitle="Configure crypto cold/hot wallets and bank deposit coordinates"
            icon={<CreditCard className="w-5 h-5 text-purple-600" />}
          />
          <CardContent className="space-y-4">
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
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Institutional Wire Beneficiary IBAN
              </label>
              <input
                type="text"
                defaultValue="GB82BARC20000012345678"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-purple-900 font-mono font-bold focus:outline-none focus:border-purple-600 shadow-2xs"
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" onClick={() => showToast('success', 'Gateways Updated', 'Payment receiving coordinates saved.')}>
                Save Gateways
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
