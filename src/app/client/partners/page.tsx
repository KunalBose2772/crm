'use client';

import React from 'react';
import { 
  Users, 
  DollarSign, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2, 
  Calendar,
  Wallet,
  Download
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ClientPageHeader } from '@/components/layout/ClientPageHeader';

export default function ClientPartnersPage() {
  const { openClientModal, showToast } = useCRM();

  const referredTraders = [
    { id: 'CL-88912', country: 'United Kingdom', lots: 48.5, rebate: '$388.00', status: 'Active', joined: '2026-02-10' },
    { id: 'CL-88741', country: 'Germany', lots: 34.2, rebate: '$273.60', status: 'Active', joined: '2026-02-18' },
    { id: 'CL-88609', country: 'United Arab Emirates', lots: 62.0, rebate: '$496.00', status: 'Active', joined: '2026-02-28' },
    { id: 'CL-88450', country: 'Singapore', lots: 22.5, rebate: '$180.00', status: 'Active', joined: '2026-03-05' },
    { id: 'CL-88311', country: 'Switzerland', lots: 17.0, rebate: '$136.00', status: 'Active', joined: '2026-03-12' },
  ];

  const handleClaim = () => {
    openClientModal('withdrawal');
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl mx-auto pb-12">
      {/* 1. ROYAL BLUE PAGE HEADER */}
      <ClientPageHeader
        badge="IB Partnership Desk"
        badgeIcon={<Users className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-200" />}
        title="Introducing Broker Network"
        subtitle="Monitor referred sub-traders, tiered spread rebates, volume milestones, and monthly commission settlement."
        chips={[
          { label: 'Unpaid Rebates', value: '$1,420.00', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: 'Tier Level', value: 'Tier 1 Master IB', icon: <Award className="w-3.5 h-3.5 text-amber-300" /> },
        ]}
        actionButton={
          <button
            type="button"
            onClick={handleClaim}
            className="px-4 py-2.5 rounded-full bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Wallet className="w-4 h-4 text-blue-600" />
            <span>Withdraw Commissions</span>
          </button>
        }
      />

      {/* 2. 3 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Partner Status</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
              Tier 1
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-blue-700">ACTIVE IB</div>
          <p className="text-xs text-slate-500">$8.00 USD spread rebate per standard lot</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Referred Traders</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              14 Total
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600">184.20 Lots</div>
          <p className="text-xs text-slate-500">Aggregate trading volume generated</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Accrued Commission</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
              Monthly
            </span>
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-600">$1,420.00</div>
          <p className="text-xs text-slate-500">Available for instant withdrawal to MT5 wallet</p>
        </div>
      </div>

      {/* 3. REFERRED CLIENT ROSTER TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">Referred Accounts Roster</h2>
            <p className="text-xs text-slate-500">Real-time volume telemetry and accrued rebates per sub-account.</p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">5 Active Accounts Shown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 font-bold">Client Account</th>
                <th className="p-4 font-bold">Jurisdiction</th>
                <th className="p-4 font-bold">Joined Date</th>
                <th className="p-4 font-bold text-right">Volume (Lots)</th>
                <th className="p-4 font-bold text-right">Rebate Earned</th>
                <th className="p-4 pr-6 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {referredTraders.map((trader) => (
                <tr key={trader.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-blue-700">{trader.id}</td>
                  <td className="p-4 font-medium text-slate-700">{trader.country}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{trader.joined}</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900">{trader.lots.toFixed(1)} lots</td>
                  <td className="p-4 text-right font-mono font-extrabold text-emerald-600">{trader.rebate}</td>
                  <td className="p-4 pr-6 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {trader.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
