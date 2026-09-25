'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  LaptopMinimal, 
  Apple, 
  Smartphone, 
  Monitor, 
  Globe, 
  ArrowUpRight, 
  Waves, 
  ShieldCheck, 
  Server, 
  Download, 
  ExternalLink,
  Layers,
  Copy,
  Check,
  Key,
  WalletCards,
  Info
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';
import { MT5_CONFIG } from '@/config/mt5';

function ClientPlatformsContent() {
  const searchParams = useSearchParams();
  const targetClientId = searchParams?.get('clientId');
  const { clients, impersonation, clientUser, showToast } = useCRM();

  // Active client context
  const clientFromParam = targetClientId ? clients.find(c => c.id === targetClientId) : null;
  const rawClient = clientFromParam || impersonation.client || clientUser || clients[0];
  const client = (rawClient?.id ? clients.find(c => c.id === rawClient.id || c.email === rawClient.email) : null) || rawClient;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast('info', 'Copied to Clipboard', `${label}: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Official verified MT5 download & launch routes
  const platformLinks = {
    ios: 'https://download.mql5.com/cdn/mobile/mt5/ios',
    android: 'https://download.mql5.com/cdn/mobile/mt5/android',
    desktop: 'https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe',
    webtrader: `https://trade.mql5.com/trade?servers=${encodeURIComponent(MT5_CONFIG.serverName)}&trade_server=${encodeURIComponent(MT5_CONFIG.serverName)}&startup_version=2`,
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. SIGNATURE ROYAL BLUE HERO BANNER */}
      <ClientPageHeader
        badge="Trading Platform Access"
        badgeIcon={<LaptopMinimal className="h-6 w-6 sm:h-7 sm:w-7 text-sky-200" />}
        title="Trade from any screen."
        subtitle="Mobile, desktop, and browser-ready access. Connect directly to our execution liquidity using your MT5 login credentials across all supported devices."
        chips={[
          { label: 'Live Server', value: MT5_CONFIG.serverName, icon: <Server className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Access mode', value: 'Install or WebTrader', icon: <Download className="w-3.5 h-3.5 text-sky-300" /> },
          { label: 'Security posture', value: 'SSL 256-bit', icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> },
        ]}
      />

      {/* 2. DYNAMIC CLIENT MT5 ACCOUNTS & CREDENTIALS BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-md border border-blue-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-200 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold font-heading text-white">
                  Your MT5 Terminal Credentials
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Trade
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Use these account numbers with your master password to sign in on Desktop, Mobile, or WebTrader.
              </p>
            </div>
          </div>

          {/* Quick Copy Server Name */}
          <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-700/60 px-3.5 py-2 rounded-xl self-start md:self-auto">
            <span className="text-[11px] font-mono text-blue-300">Server:</span>
            <span className="text-xs font-mono font-bold text-white">{MT5_CONFIG.serverName}</span>
            <button
              type="button"
              onClick={() => handleCopy(MT5_CONFIG.serverName, 'Server Name')}
              className="ml-1 text-blue-300 hover:text-white transition p-1 hover:bg-white/10 rounded-lg cursor-pointer"
              title="Copy server name"
            >
              {copiedKey === 'Server Name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Accounts List */}
        <div className="mt-5">
          {client?.accounts && client.accounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {client.accounts.map((acc: any) => (
                <div 
                  key={acc.login} 
                  className="bg-white/5 border border-white/10 hover:border-blue-400/50 rounded-xl p-3.5 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <WalletCards className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-sm text-white tracking-wide">
                          #{acc.login}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-200 border border-blue-400/20 font-bold uppercase">
                          {acc.type || 'Standard'}
                        </span>
                      </div>
                      <span className="text-[11px] text-blue-200/70 font-mono block mt-0.5">
                        Bal: ${Number(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(String(acc.login), `Account #${acc.login}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/60 text-xs font-semibold text-blue-200 hover:text-white transition border border-blue-400/30 cursor-pointer active:scale-95"
                  >
                    {copiedKey === `Account #${acc.login}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[11px]">Copy Login</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs text-blue-200">
                  No active MT5 accounts provisioned yet. Open a live trading account from the dashboard to receive your login and start trading.
                </span>
              </div>
              <a
                href="/client/open-account"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition text-center shrink-0"
              >
                Open Account
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 3. 3 COVERAGE HIGHLIGHT CARDS */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Platform coverage
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            4 Channels
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            iOS, Android, Windows desktop, and zero-install WebTrader mapped into one execution ecosystem.
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Execution Latency
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-blue-700 font-heading">
            Sub-millisecond
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Direct routing to our Equinix LD4 trading bridge with tight spreads and negative balance protection.
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Security posture
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-emerald-600 font-heading">
            Encrypted
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            256-bit SSL encrypted connection between your client terminal and MetaTrader 5 server.
          </p>
        </div>
      </div>

      {/* 4. PLATFORM LINEUP SECTION (ACTIVE DOWNLOAD & LAUNCH BUTTONS) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <LaptopMinimal className="h-3.5 w-3.5 text-blue-600" />
                <span>Client Terminals</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Launch or Download MetaTrader 5
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">
                Choose your preferred device. All platforms share the same account balance, orders, and execution speed.
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs sm:flex">
              <LaptopMinimal className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="p-5 sm:p-6 lg:p-7 grid gap-4 xl:grid-cols-2">
          {/* 1. Web Terminal (Instant Browser Launch) */}
          <article className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-all shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-300 bg-white text-blue-600 shadow-2xs">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-blue-600">
                        Browser Access
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                        Instant
                      </span>
                    </div>
                    <h3 className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                      MetaTrader 5 WebTrader
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600">
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Start trading directly from your web browser with zero software installation. Full technical indicators, interactive candlestick charts, and one-click order execution.
              </p>
            </div>

            <a
              href={platformLinks.webtrader}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-xs sm:text-sm font-bold transition cursor-pointer self-start shadow-sm hover:shadow active:scale-98"
            >
              <span>Launch WebTrader</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </article>

          {/* 2. Desktop Terminal (Windows / macOS) */}
          <article className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-white text-indigo-600 shadow-2xs">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                      Windows &amp; macOS
                    </p>
                    <h3 className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                      Desktop Terminal
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <Download className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Full-featured desktop workstation supporting Expert Advisors (EA algorithmic bots), institutional Depth of Market, multi-monitor workspaces, and custom indicator templates.
              </p>
            </div>

            <a
              href={platformLinks.desktop}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 transition cursor-pointer self-start shadow-2xs active:scale-98"
            >
              <Download className="h-4 w-4 text-slate-600" />
              <span>Download for Windows (.exe)</span>
            </a>
          </article>

          {/* 3. iOS App Store */}
          <article className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xs">
                    <Apple className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                      Apple App Store
                    </p>
                    <h3 className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                      iOS App (iPhone &amp; iPad)
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Native iOS trading with interactive touch gestures, real-time push price notifications, and Face ID / Touch ID biometric authentication.
              </p>
            </div>

            <a
              href={platformLinks.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 transition cursor-pointer self-start shadow-2xs active:scale-98"
            >
              <span>Download on App Store</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </article>

          {/* 4. Google Play Store */}
          <article className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-2xs">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                      Google Play
                    </p>
                    <h3 className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                      Android App
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Optimized mobile trading for Android devices with customizable watchlists, market news feed, and fast order modifications.
              </p>
            </div>

            <a
              href={platformLinks.android}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 transition cursor-pointer self-start shadow-2xs active:scale-98"
            >
              <span>Get it on Google Play</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </article>
        </div>
      </section>

      {/* 5. SERVER CONNECTION TELEMETRY CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 font-heading">Server Credentials &amp; Discovery</h4>
            <p className="text-xs text-slate-500">When prompted in the MT5 terminal, search for or select these server settings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Production Server</span>
              <span className="font-extrabold text-blue-700 mt-0.5 block">{MT5_CONFIG.serverName}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(MT5_CONFIG.serverName, 'Production Server')}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 transition cursor-pointer"
              title="Copy"
            >
              {copiedKey === 'Production Server' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Trading Host</span>
              <span className="font-extrabold text-slate-800 mt-0.5 block">{MT5_CONFIG.serverHost}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(MT5_CONFIG.serverHost, 'Trading Host')}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 transition cursor-pointer"
              title="Copy"
            >
              {copiedKey === 'Trading Host' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Trading Port</span>
            <span className="font-extrabold text-slate-800 mt-0.5 block">{MT5_CONFIG.serverPort || 443} / SSL</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Center</span>
            <span className="font-extrabold text-emerald-600 mt-0.5 block">Equinix LD4 (London)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientPlatformsPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ClientPlatformsContent />
    </React.Suspense>
  );
}
