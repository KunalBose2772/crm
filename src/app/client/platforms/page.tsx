'use client';

import React from 'react';
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
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

export default function ClientPlatformsPage() {
  const { showToast } = useCRM();

  const handlePlatformAction = (platformName: string, actionUrl: string) => {
    showToast('info', 'Platform Launch', `Opening ${platformName} access channel.`);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. SIGNATURE ROYAL BLUE HERO BANNER */}
      <ClientPageHeader
        badge="Trading Platform Access"
        badgeIcon={<LaptopMinimal className="h-6 w-6 sm:h-7 sm:w-7 text-sky-200" />}
        title="Trade from any screen."
        subtitle="Mobile, desktop, and browser-ready access. Keep the same command-surface feel as the dashboard while moving between devices for execution, monitoring, and account review."
        chips={[
          { label: 'Access mode', value: 'Install or launch', icon: <Download className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Platform coverage', value: '4 channels', icon: <Layers className="w-3.5 h-3.5 text-sky-300" /> },
          { label: 'Security posture', value: 'Protected', icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> },
        ]}
      />

      {/* 2. 3 COVERAGE HIGHLIGHT CARDS */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Platform coverage
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            4 channels
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Mobile, desktop, and browser access mapped into one synchronized view.
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Device fit
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-blue-700 font-heading">
            Cross-device
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Move between desk and mobile without switching portfolio or product context.
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
            Security posture
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold text-emerald-600 font-heading">
            Protected
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Designed and authenticated as part of the secured client workspace experience.
          </p>
        </div>
      </div>

      {/* 3. PLATFORM LINEUP SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-100 p-5 sm:p-6 lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <LaptopMinimal className="h-3.5 w-3.5 text-blue-600" />
                <span>Client dashboard</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Platform lineup
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500">
                Each access route is presented inside the same card treatment used across the client area, with clearer action labels and tighter information hierarchy.
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs sm:flex">
              <LaptopMinimal className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="p-5 sm:p-6 lg:p-7 grid gap-4 xl:grid-cols-2">
          {/* iOS App */}
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
                      iOS app
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Native mobile access for real-time account management, multi-timeframe chart review, and instant biometric order execution.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handlePlatformAction('iOS App', 'https://apps.apple.com')}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50/80 hover:bg-blue-100/90 px-4 py-3 text-xs sm:text-sm font-bold text-blue-700 transition cursor-pointer self-start shadow-2xs active:scale-98"
            >
              <span>Open App Store</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </article>

          {/* Android App */}
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
                      Android app
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Fast mobile trading with customized watchlists, push market alerts, and responsive interactive chart gestures.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handlePlatformAction('Android App', 'https://play.google.com')}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50/80 hover:bg-blue-100/90 px-4 py-3 text-xs sm:text-sm font-bold text-blue-700 transition cursor-pointer self-start shadow-2xs active:scale-98"
            >
              <span>Open Play Store</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </article>

          {/* Desktop Terminal */}
          <article className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-2xs">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                      Windows and macOS
                    </p>
                    <h3 className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                      Desktop terminal
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Full-screen workstation for algorithmic trading (EA), institutional depth of market, and multi-monitor custom charting.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handlePlatformAction('Desktop Terminal', '/downloads/terminal-setup.exe')}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50/80 hover:bg-blue-100/90 px-4 py-3 text-xs sm:text-sm font-bold text-blue-700 transition cursor-pointer self-start shadow-2xs active:scale-98"
            >
              <span>Get desktop build</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </article>

          {/* Web Terminal */}
          <article className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 shadow-2xs">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-slate-400">
                      Browser access
                    </p>
                    <h3 className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                      Web terminal
                    </h3>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instant secure sign-in from any modern browser with zero local software installation required.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handlePlatformAction('Web Terminal', 'https://webtrader.testcrm.co.in')}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50/80 hover:bg-blue-100/90 px-4 py-3 text-xs sm:text-sm font-bold text-blue-700 transition cursor-pointer self-start shadow-2xs active:scale-98"
            >
              <span>Launch web platform</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </article>
        </div>
      </section>

      {/* 4. BOTTOM SPLIT: WORKSPACE FIT & EXECUTION NOTE */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        {/* Workspace Fit */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <Waves className="h-3.5 w-3.5 text-blue-600" />
                <span>Client dashboard</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Workspace fit
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                The layout focuses on what matters operationally: where each platform fits and how it supports the same client workflow.
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs sm:flex">
              <Waves className="h-6 w-6" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 pt-1">
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Unified account access across mobile, desktop, and browser sessions.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Execution-ready layouts for charting, position tracking, and order flow.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Same workspace tone and operational hierarchy as the main client dashboard.
              </p>
            </article>
          </div>
        </section>

        {/* Execution Note */}
        <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Client dashboard</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                Execution note
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                A compact signal panel so the page reads like part of the same dashboard ecosystem.
              </p>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs sm:flex">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-blue-700">
                Session continuity
              </p>
              <p className="mt-1 text-base font-extrabold text-slate-900 font-heading">
                One workspace rhythm
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Device transitions now sit inside a calmer, more structured dashboard presentation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-blue-700">
                Coverage
              </p>
              <p className="mt-1 text-base font-extrabold text-slate-900 font-heading">
                iOS, Android, desktop, web
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Choose the surface that matches your session without leaving the visual system.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 5. SERVER CONNECTION TELEMETRY CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 font-heading">Server Credentials &amp; Discovery</h4>
            <p className="text-xs text-slate-500">Enter these host specifications during MT5 terminal setup.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Production Server</span>
            <span className="font-extrabold text-blue-700 mt-0.5 block">OceanMarkets-Live</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sandbox Server</span>
            <span className="font-extrabold text-slate-800 mt-0.5 block">OceanMarkets-Demo</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Trading Port</span>
            <span className="font-extrabold text-slate-800 mt-0.5 block">443 / SSL Secured</span>
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
