'use client';

import React from 'react';
import { 
  Monitor, 
  Download, 
  Smartphone, 
  Globe, 
  Cpu, 
  Laptop, 
  ShieldCheck, 
  ExternalLink,
  Server,
  Layers
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

export default function ClientPlatformsPage() {
  const { showToast } = useCRM();

  const platforms = [
    {
      name: 'MetaTrader 5 for Windows',
      os: 'Windows 10 / 11 64-bit',
      desc: 'Industry standard for institutional EAs, algorithmic backtesting, and full Depth of Market (DOM).',
      badge: 'Desktop EXE',
      icon: <Laptop className="w-6 h-6 text-blue-600" />,
      features: ['Automated Expert Advisors (EA)', '21 Timeframes & 80+ Indicators', 'Built-in MQL5 Development IDE'],
    },
    {
      name: 'MetaTrader 5 for macOS',
      os: 'macOS Monterey / Ventura / Sonoma',
      desc: 'Native macOS package optimized for Apple Silicon (M1/M2/M3) and Intel architectures with retina UI.',
      badge: 'macOS DMG',
      icon: <Monitor className="w-6 h-6 text-indigo-600" />,
      features: ['Retina multi-monitor charting', 'Zero wine configuration required', 'Direct biometric TouchID support'],
    },
    {
      name: 'MT5 WebTrader Platform',
      os: 'Chrome / Safari / Firefox / Edge',
      desc: 'Instant browser execution without any local software installation. Trade securely on any workstation.',
      badge: 'Cloud Web',
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      features: ['Zero local installation', 'Real-time quotes & depth', 'Cloud synchronized layout presets'],
    },
    {
      name: 'MetaTrader 5 Mobile',
      os: 'iOS App Store & Android APK',
      desc: 'Comprehensive trading and portfolio oversight on mobile smartphones and tablets with push alerts.',
      badge: 'Mobile App',
      icon: <Smartphone className="w-6 h-6 text-sky-600" />,
      features: ['Real-time trade notifications', 'Interactive touch gesture charts', 'Full financial news feed'],
    },
  ];

  const handleDownload = (name: string) => {
    showToast('info', 'Download Started', `Starting package download for ${name}.`);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="Execution Infrastructure"
        badgeIcon={<Monitor className="h-6 w-6 sm:h-7 sm:w-7 text-sky-200" />}
        title="Trading Platforms & Terminals"
        subtitle="Download industry-grade MetaTrader 5 terminals optimized for low-latency desktop execution and on-the-go mobile trading."
        chips={[
          { label: 'Server Latency', value: '<2ms LD4', icon: <Cpu className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Engine Build', value: 'MT5 Build 4150', icon: <Layers className="w-3.5 h-3.5 text-blue-200" /> },
        ]}
      />

      {/* 2. PLATFORMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((p, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-2xs">
                  {p.icon}
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                  {p.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">{p.name}</h3>
                <span className="text-[11px] font-mono text-blue-700 font-semibold">{p.os}</span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {p.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDownload(p.name)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download & Setup</span>
            </button>
          </div>
        ))}
      </div>

      {/* 3. SERVER CONNECTION TELEMETRY CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 font-heading">Server Credentials & Discovery</h4>
            <p className="text-xs text-slate-500">Enter these host specifications during MT5 terminal connection.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
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
