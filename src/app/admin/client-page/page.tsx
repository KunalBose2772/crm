'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Client, TradingAccount } from '@/types/crm';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { 
  UserPlus, 
  Eye, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Globe, 
  Calendar,
  ExternalLink
} from 'lucide-react';

export default function ClientManagementPage() {
  const { clients, updateClientStatus, addClient, startImpersonation } = useCRM();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New client form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'United Kingdom',
    city: 'London',
    platform: 'MT5' as const,
    accountType: 'ECN' as const,
    leverage: '1:500',
    currency: 'USD',
  });

  const handleOpenClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    addClient({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: 'United Kingdom',
      city: 'London',
      platform: 'MT5',
      accountType: 'ECN',
      leverage: '1:500',
      currency: 'USD',
    });
  };

  const columns: Column<Client>[] = [
    {
      header: 'Client ID',
      accessorKey: 'id',
      sortable: true,
      className: 'font-mono text-xs text-purple-700 font-bold tabular-nums',
    },
    {
      header: 'Client Name & Contact',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 font-sans">{row.name}</div>
          <div className="text-xs text-slate-500 font-sans">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Country',
      accessorKey: 'country',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-700 font-medium font-sans">{row.country}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Accounts',
      cell: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.accounts.length > 0 ? (
            row.accounts.map(acc => (
              <span
                key={acc.id}
                className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 font-mono text-[11px] text-purple-800 font-semibold tabular-nums"
              >
                #{acc.login} ({acc.platform})
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic font-sans">No trading accounts</span>
          )}
        </div>
      ),
    },
    {
      header: 'Total Balance',
      accessorKey: 'totalBalance',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm tabular-nums">
          ${row.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Net Deposit',
      accessorKey: 'netDeposit',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-emerald-600 font-mono text-xs sm:text-sm tabular-nums">
          ${row.netDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Registered',
      accessorKey: 'registeredAt',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500" suppressHydrationWarning>
          {new Date(row.registeredAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenClientDetails(row)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Inspect
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startImpersonation(row)}
            title="Impersonate Portal"
            leftIcon={<ExternalLink className="w-3.5 h-3.5 text-purple-600" />}
          >
            Portal
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Client Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Oversee trader registrations, account balances, verification levels, and trading logins.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add New Client
        </Button>
      </div>

      {/* Main Clients Data Table */}
      <DataTable
        data={clients as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search clients by name, email, or country..."
        searchKeys={['name', 'email', 'country', 'id']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Verified', value: 'verified' },
              { label: 'Pending', value: 'pending' },
              { label: 'Unverified', value: 'unverified' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Suspended', value: 'suspended' },
            ],
          },
        ]}
        exportFilename="crm-clients-directory.csv"
      />

      {/* Client Detail Slide-out Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedClient ? selectedClient.name : 'Client Details'}
        subtitle={selectedClient ? `${selectedClient.email} • ID: ${selectedClient.id}` : ''}
        width="xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Quick Profile Overview */}
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedClient.status} />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => startImpersonation(selectedClient)}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5 text-purple-700" />}
                >
                  Impersonate Client
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span className="truncate font-medium">{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-medium">{selectedClient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-medium">{selectedClient.city}, {selectedClient.country}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-medium" suppressHydrationWarning>Registered: {new Date(selectedClient.registeredAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Financial Summary
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500">Total Deposits</span>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    ${selectedClient.totalDeposit.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500">Total Withdrawals</span>
                  <p className="text-sm font-bold text-rose-600 mt-0.5">
                    ${selectedClient.totalWithdrawal.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500">Combined Balance</span>
                  <p className="text-sm font-bold text-purple-900 mt-0.5">
                    ${selectedClient.totalBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Trading Accounts List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Associated Trading Accounts ({selectedClient.accounts.length})
                </h4>
              </div>

              <div className="space-y-3">
                {selectedClient.accounts.length > 0 ? (
                  selectedClient.accounts.map((acc: TradingAccount) => (
                    <div
                      key={acc.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-xs">
                            {acc.platform}
                          </span>
                          <span className="font-mono text-sm font-bold text-slate-900">
                            #{acc.login}
                          </span>
                          <span className="text-xs text-slate-500">({acc.type})</span>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-500">
                          {acc.leverage} • {acc.server}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Balance</span>
                          <span className="font-bold text-slate-900">${acc.balance.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Equity</span>
                          <span className="font-bold text-emerald-600">${acc.equity.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Free Margin</span>
                          <span className="font-bold text-slate-700">${acc.freeMargin.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Margin Level</span>
                          <span className="font-bold text-purple-600">{acc.marginLevel}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No active trading accounts registered yet.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Administrative State Changes */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Account Status Control
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedClient.status === 'verified' ? 'primary' : 'outline'}
                  onClick={() => updateClientStatus(selectedClient.id, 'verified')}
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                >
                  Set Verified
                </Button>
                <Button
                  size="sm"
                  variant={selectedClient.status === 'suspended' ? 'danger' : 'outline'}
                  onClick={() => updateClientStatus(selectedClient.id, 'suspended')}
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                >
                  Suspend Account
                </Button>
                <Button
                  size="sm"
                  variant={selectedClient.status === 'pending' ? 'secondary' : 'outline'}
                  onClick={() => updateClientStatus(selectedClient.id, 'pending')}
                >
                  Set Pending Review
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add New Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Client Account"
        subtitle="Manually create a client profile and provision an initial trading account."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Johnathan Smith"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. j.smith@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="+1 555 0192"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
              <input
                type="text"
                placeholder="e.g. United Kingdom"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Initial Trading Account Provisioning
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Platform</label>
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value as 'MT5' })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer font-medium"
                >
                  <option value="MT5">MetaTrader 5 (MT5)</option>
                  <option value="MT4">MetaTrader 4 (MT4)</option>
                  <option value="cTrader">cTrader</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Type</label>
                <select
                  value={formData.accountType}
                  onChange={e => setFormData({ ...formData, accountType: e.target.value as 'ECN' })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer font-medium"
                >
                  <option value="Standard">Standard</option>
                  <option value="ECN">ECN Raw Spread</option>
                  <option value="Pro">Pro Institutional</option>
                  <option value="Islamic">Islamic (Swap-Free)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Leverage</label>
                <select
                  value={formData.leverage}
                  onChange={e => setFormData({ ...formData, leverage: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer font-medium"
                >
                  <option value="1:100">1:100</option>
                  <option value="1:200">1:200</option>
                  <option value="1:400">1:400</option>
                  <option value="1:500">1:500</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Client & Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
