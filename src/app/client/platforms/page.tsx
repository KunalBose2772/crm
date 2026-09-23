'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Download, ExternalLink } from 'lucide-react';

export default function ClientPlatformsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/client/dashboard" className="text-xs text-purple-400 hover:underline flex items-center gap-1.5 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">Trading Platforms</h1>
        <p className="text-xs text-slate-400 mt-1">Download MetaTrader 5 terminals for Desktop, iOS, Android, and Web</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'MetaTrader 5 Windows', desc: 'Full-featured desktop execution terminal', badge: 'Desktop' },
          { name: 'MT5 WebTrader', desc: 'Zero installation, instant browser trading', badge: 'Browser' },
          { name: 'MetaTrader 5 Mobile', desc: 'Trade anywhere on iOS and Android devices', badge: 'Mobile' },
        ].map((p, i) => (
          <div key={i} className="bg-[#0E1422] border border-[#1C263C] rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#162033] text-slate-300 text-[10px] font-mono font-bold">
                  {p.badge}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white">{p.name}</h3>
              <p className="text-xs text-slate-400">{p.desc}</p>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-[#141E33] hover:bg-[#1B2945] border border-[#243454] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Launch / Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
