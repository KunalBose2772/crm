'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { IBTierConfig, IBPartner } from '@/types/crm';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { 
  GitFork, 
  Award, 
  Save, 
  Copy, 
  Check
} from 'lucide-react';

export default function IBConfigurationPage() {
  const { ibTiers, updateIBTiers, ibPartners } = useCRM();
  const [tiers, setTiers] = useState<IBTierConfig[]>(ibTiers);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTierChange = (index: number, field: keyof IBTierConfig, val: number) => {
    const updated = [...tiers];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setTiers(updated);
  };

  const handleSaveTiers = () => {
    updateIBTiers(tiers);
  };

  const partnerColumns: Column<IBPartner>[] = [
    {
      header: 'Partner ID',
      accessorKey: 'id',
      sortable: true,
      className: 'font-mono text-xs text-purple-700 font-bold',
    },
    {
      header: 'Partner Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-xs text-slate-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Assigned Tier',
      accessorKey: 'tier',
      sortable: true,
      cell: (row) => {
        const tier = row.tier;
        let color: 'purple' | 'cyan' | 'info' | 'warning' = 'purple';
        if (tier === 'VIP') color = 'warning';
        if (tier === 'Diamond') color = 'cyan';
        if (tier === 'Platinum') color = 'purple';
        return <Badge variant={color}>{row.tier}</Badge>;
      },
    },
    {
      header: 'Referral Code',
      accessorKey: 'referralCode',
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 font-semibold">
          <span>{row.referralCode}</span>
          <button
            onClick={() => handleCopy(row.referralCode)}
            className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded-full cursor-pointer transition-colors"
            title="Copy Code"
          >
            {copiedCode === row.referralCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      ),
    },
    {
      header: 'Referred Clients',
      accessorKey: 'activeClientsCount',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-800">
          {row.activeClientsCount} Traders ({row.subIbCount} Sub-IBs)
        </span>
      ),
    },
    {
      header: 'Trading Volume',
      accessorKey: 'totalVolumeLots',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-purple-700 font-bold tabular-nums">
          {row.totalVolumeLots.toLocaleString()} Lots
        </span>
      ),
    },
    {
      header: 'Lifetime Commission',
      accessorKey: 'totalCommissionEarned',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-emerald-600 text-xs sm:text-sm font-mono tabular-nums">
          ${row.totalCommissionEarned.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Wallet Balance',
      accessorKey: 'withdrawableCommission',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono tabular-nums">
          ${row.withdrawableCommission.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Introducing Broker (IB) Configuration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure multi-tier partner commissions, per-lot asset rebates, and sub-IB revenue splits.
          </p>
        </div>

        <Button
          onClick={handleSaveTiers}
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Tier Rates
        </Button>
      </div>

      {/* Multi-Tier Rebate Matrix Editor */}
      <Card>
        <CardHeader
          title="Commission Tier Structures"
          subtitle="Define rebate values ($ USD per round-turn lot) by partner tier"
          icon={<GitFork className="w-5 h-5 text-purple-600" />}
        />
        <div className="overflow-x-auto p-5 custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                <th className="py-3 px-4">Tier Level</th>
                <th className="py-3 px-4">Min Monthly Lots</th>
                <th className="py-3 px-4">Forex ($/lot)</th>
                <th className="py-3 px-4">Metals ($/lot)</th>
                <th className="py-3 px-4">Crypto ($/lot)</th>
                <th className="py-3 px-4">Indices ($/lot)</th>
                <th className="py-3 px-4">Sub-IB Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {tiers.map((tier, idx) => (
                <tr key={tier.tierName} className="hover:bg-purple-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-purple-900 flex items-center gap-2 font-heading">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>{tier.tierName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="number"
                      value={tier.minLots}
                      onChange={e => handleTierChange(idx, 'minLots', Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs tabular-nums"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="number"
                      step="0.5"
                      value={tier.forexRebatePerLot}
                      onChange={e => handleTierChange(idx, 'forexRebatePerLot', Number(e.target.value))}
                      className="w-20 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-mono text-emerald-600 font-bold focus:outline-none focus:border-purple-600 shadow-2xs tabular-nums"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="number"
                      step="0.5"
                      value={tier.metalsRebatePerLot}
                      onChange={e => handleTierChange(idx, 'metalsRebatePerLot', Number(e.target.value))}
                      className="w-20 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-mono text-amber-600 font-bold focus:outline-none focus:border-purple-600 shadow-2xs tabular-nums"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="number"
                      step="0.5"
                      value={tier.cryptoRebatePerLot}
                      onChange={e => handleTierChange(idx, 'cryptoRebatePerLot', Number(e.target.value))}
                      className="w-20 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-mono text-purple-700 font-bold focus:outline-none focus:border-purple-600 shadow-2xs tabular-nums"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <input
                      type="number"
                      step="0.5"
                      value={tier.indicesRebatePerLot}
                      onChange={e => handleTierChange(idx, 'indicesRebatePerLot', Number(e.target.value))}
                      className="w-20 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-mono text-blue-600 font-bold focus:outline-none focus:border-purple-600 shadow-2xs tabular-nums"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={tier.subIbSharePercent}
                        onChange={e => handleTierChange(idx, 'subIbSharePercent', Number(e.target.value))}
                        className="w-16 px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs tabular-nums"
                      />
                      <span className="text-xs text-slate-500 font-bold font-sans">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active IB Partners Table */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">Active Introducing Brokers Directory</h3>
          <p className="text-xs text-slate-500">
            Registered broker affiliates, commission earnings, and referred trading volume.
          </p>
        </div>

        <DataTable
          data={ibPartners as unknown as Record<string, unknown>[]}
          columns={partnerColumns as unknown as Column<Record<string, unknown>>[]}
          searchPlaceholder="Search partners by name, email, or code..."
          searchKeys={['name', 'email', 'referralCode', 'tier']}
          filters={[
            {
              key: 'tier',
              label: 'Tier',
              options: [
                { label: 'Gold', value: 'Gold' },
                { label: 'Platinum', value: 'Platinum' },
                { label: 'Diamond', value: 'Diamond' },
                { label: 'VIP', value: 'VIP' },
              ],
            },
          ]}
          exportFilename="crm-ib-partners.csv"
        />
      </div>
    </div>
  );
}
