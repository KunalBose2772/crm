'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Client, TradingAccount } from '@/types/crm';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  Check, 
  CircleAlert, 
  Pen, 
  Monitor, 
  LogIn, 
  Key, 
  UserX, 
  UserCheck, 
  UserPlus, 
  Mail, 
  Phone, 
  Globe, 
  Calendar,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  X,
  CreditCard,
  Building
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ClientManagementPage() {
  const { clients, updateClientStatus, addClient, startImpersonation, showToast } = useCRM();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'activated' | 'suspended'>('all');
  const [emailFilter, setEmailFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [ibFilter, setIbFilter] = useState<'all' | 'active' | 'inactive' | 'none'>('all');

  // Interactive Modals and Drawers state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isMt5ModalOpen, setIsMt5ModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for password change
  const [passwordForm, setPasswordForm] = useState({
    passwordType: 'master',
    newPassword: '',
    confirmPassword: '',
  });

  // Form state for new client
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'United Kingdom',
    city: 'London',
  });

  // Filter clients based on search & filters
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.country.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Status filter (activated = verified/pending/unverified; suspended = suspended)
      if (statusFilter === 'activated' && client.status === 'suspended') return false;
      if (statusFilter === 'suspended' && client.status !== 'suspended') return false;

      // Email filter
      if (emailFilter === 'verified' && !client.emailVerified) return false;
      if (emailFilter === 'unverified' && client.emailVerified) return false;

      // KYC filter
      if (kycFilter === 'verified' && !client.kycVerified) return false;
      if (kycFilter === 'unverified' && client.kycVerified) return false;

      // IB filter
      if (ibFilter !== 'all') {
        const ibStatus = (client.ibPartnerStatus || 'None').toLowerCase();
        if (ibStatus !== ibFilter) return false;
      }

      return true;
    });
  }, [clients, searchQuery, statusFilter, emailFilter, kycFilter, ibFilter]);

  // Actions
  const handleOpenDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsDrawerOpen(true);
  };

  const handleOpenMt5Accounts = (client: Client) => {
    setSelectedClient(client);
    setIsMt5ModalOpen(true);
  };

  const handleOpenManagePassword = (client: Client) => {
    setSelectedClient(client);
    setPasswordForm({ passwordType: 'master', newPassword: '', confirmPassword: '' });
    setIsPasswordModalOpen(true);
  };

  const handleToggleStatus = (client: Client) => {
    const isSuspended = client.status === 'suspended';
    const newStatus = isSuspended ? 'verified' : 'suspended';
    updateClientStatus(client.id, newStatus);
    showToast(
      isSuspended ? 'success' : 'warning',
      isSuspended ? 'Client Activated' : 'Client Suspended',
      `${client.name} has been ${isSuspended ? 'activated' : 'suspended'}.`
    );
  };

  const handleImpersonate = (client: Client) => {
    startImpersonation(client);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'Password Mismatch', 'The passwords entered do not match.');
      return;
    }
    showToast('success', 'Password Updated', `New ${passwordForm.passwordType} password set for ${selectedClient?.name}.`);
    setIsPasswordModalOpen(false);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name || !newClientForm.email) return;

    addClient({
      name: newClientForm.name,
      email: newClientForm.email,
      phone: newClientForm.phone || '+1 555 0199',
      country: newClientForm.country,
      city: newClientForm.city,
      status: 'verified',
      emailVerified: true,
      kycVerified: false,
      ibPartnerStatus: 'None',
      totalBalance: 0,
      totalDeposit: 0,
      totalWithdrawal: 0,
      netDeposit: 0,
      accounts: [
        {
          id: `acc_${Date.now()}`,
          login: Math.floor(2600000 + Math.random() * 90000),
          platform: 'MT5',
          type: 'Standard',
          currency: 'USD',
          balance: 0,
          equity: 0,
          freeMargin: 0,
          marginLevel: 0,
          leverage: '1:500',
          server: 'Live-Server-01',
          createdAt: new Date().toISOString(),
        }
      ]
    });

    setIsAddModalOpen(false);
    setNewClientForm({
      name: '',
      email: '',
      phone: '',
      country: 'United Kingdom',
      city: 'London',
    });
    showToast('success', 'Client Registered', 'New client profile added successfully.');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Email Verified', 'KYC Verified', 'IB Partner', 'Country', 'Status', 'Balance'];
    const rows = filteredClients.map(c => [
      `"${c.name}"`,
      `"${c.email}"`,
      c.emailVerified ? 'Verified' : 'Unverified',
      c.kycVerified ? 'Verified' : 'Unverified',
      c.ibPartnerStatus || 'None',
      `"${c.country}"`,
      c.status === 'suspended' ? 'Suspended' : 'Activated',
      c.totalBalance || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clients_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Export Successful', `Exported ${filteredClients.length} clients to CSV.`);
  };

  const handleRefresh = () => {
    showToast('success', 'Clients Synchronized', 'Real-time trader directory and MT5 state updated.');
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setEmailFilter('all');
    setKycFilter('all');
    setIbFilter('all');
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    emailFilter !== 'all',
    kycFilter !== 'all',
    ibFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 select-none pb-12">
      {/* 1. Royal Purple Welcome Header Banner */}
      <WelcomeBanner
        title="Client Management"
        subtitle="Manage all your clients in one place"
        badgeText="Client Directory"
        onRefresh={handleRefresh}
      />

      {/* 2. Search, Filter, and Export Controls Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-xs p-3.5 sm:p-5 relative z-20">
        <div className="flex flex-col gap-3 sm:gap-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or country..."
                className="w-full pl-11 pr-4 h-10 sm:h-12 border border-slate-200/90 rounded-xl sm:rounded-2xl focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50 focus:outline-none transition-all text-xs sm:text-sm font-sans bg-slate-50/50 hover:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Buttons: Filters, Export, Add Client */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Filters Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className={clsx(
                    "h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl sm:rounded-2xl font-bold transition-all duration-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95",
                    activeFiltersCount > 0 || filterMenuOpen
                      ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-300"
                      : "bg-purple-50 hover:bg-purple-100/90 text-purple-900 border border-purple-200/90"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline font-heading">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white text-purple-700 text-[10px] font-mono flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", filterMenuOpen && "rotate-180")} />
                </button>

                {/* Filter Popover Dropdown */}
                {filterMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setFilterMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-purple-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-50">
                        <span className="font-heading font-bold text-xs uppercase tracking-wider text-purple-900">
                          Filter Clients
                        </span>
                        {activeFiltersCount > 0 && (
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                          >
                            Reset all
                          </button>
                        )}
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* Status Filter */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Status</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['all', 'activated', 'suspended'] as const).map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setStatusFilter(st)}
                                className={clsx(
                                  "py-1.5 px-2 rounded-lg text-center font-medium capitalize transition-colors cursor-pointer",
                                  statusFilter === st ? "bg-purple-600 text-white font-bold" : "bg-slate-50 text-slate-600 hover:bg-purple-50"
                                )}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Email Verified Filter */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Email Verification</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['all', 'verified', 'unverified'] as const).map(ef => (
                              <button
                                key={ef}
                                type="button"
                                onClick={() => setEmailFilter(ef)}
                                className={clsx(
                                  "py-1.5 px-2 rounded-lg text-center font-medium capitalize transition-colors cursor-pointer",
                                  emailFilter === ef ? "bg-purple-600 text-white font-bold" : "bg-slate-50 text-slate-600 hover:bg-purple-50"
                                )}
                              >
                                {ef}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* KYC Verified Filter */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">KYC Status</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['all', 'verified', 'unverified'] as const).map(kf => (
                              <button
                                key={kf}
                                type="button"
                                onClick={() => setKycFilter(kf)}
                                className={clsx(
                                  "py-1.5 px-2 rounded-lg text-center font-medium capitalize transition-colors cursor-pointer",
                                  kycFilter === kf ? "bg-purple-600 text-white font-bold" : "bg-slate-50 text-slate-600 hover:bg-purple-50"
                                )}
                              >
                                {kf}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* IB Partner Filter */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">IB Partner</label>
                          <div className="grid grid-cols-4 gap-1">
                            {(['all', 'active', 'inactive', 'none'] as const).map(ib => (
                              <button
                                key={ib}
                                type="button"
                                onClick={() => setIbFilter(ib)}
                                className={clsx(
                                  "py-1.5 px-1.5 rounded-lg text-center font-medium capitalize text-[10px] sm:text-xs transition-colors cursor-pointer",
                                  ibFilter === ib ? "bg-purple-600 text-white font-bold" : "bg-slate-50 text-slate-600 hover:bg-purple-50"
                                )}
                              >
                                {ib}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl sm:rounded-2xl font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 transition-all duration-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                title="Export filtered clients to CSV"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline font-heading">Export</span>
              </button>

              {/* Add New Client Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="h-10 sm:h-12 px-3.5 sm:px-5 text-xs sm:text-sm rounded-xl sm:rounded-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span className="font-heading">Add Client</span>
              </button>
            </div>
          </div>

          {/* Bottom Counter & Active Filters Indicator */}
          <div className="pt-2 sm:pt-3 border-t border-purple-50 flex items-center justify-between text-xs text-slate-500 font-sans">
            <div>
              Found <span className="text-purple-700 font-extrabold font-mono text-sm">{filteredClients.length}</span> clients
              {searchQuery && (
                <span className="text-slate-400 ml-1.5 font-normal">
                  matching &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-purple-700 hover:text-purple-900 font-semibold cursor-pointer underline text-[11px]"
              >
                Clear all filters
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. DESKTOP CLIENTS DATA TABLE (Exact Columns matching reference HTML) */}
      <div className="hidden lg:block bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-50">
            {/* Table Header */}
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                  Name &amp; Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                  Email Verified
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                  KYC Verified
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                  IB Partners
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                  Country
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                  Quick Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-sans text-sm">
                    No clients found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isSuspended = client.status === 'suspended';
                  const isActivated = !isSuspended;

                  return (
                    <tr 
                      key={client.id}
                      className="hover:bg-purple-50/40 transition-colors duration-150 group"
                    >
                      {/* 1. Name & Email */}
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 text-sm font-sans group-hover:text-purple-900 transition-colors">
                          {client.name}
                        </div>
                        <div className="text-xs text-slate-400 font-sans">
                          {client.email}
                        </div>
                      </td>

                      {/* 2. Email Verified */}
                      <td className="px-6 py-3.5">
                        {client.emailVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <CircleAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* 3. KYC Verified */}
                      <td className="px-6 py-3.5">
                        {client.kycVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <CircleAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* 4. IB Partners */}
                      <td className="px-6 py-3.5 text-xs text-slate-700 capitalize font-medium">
                        {client.ibPartnerStatus || 'None'}
                      </td>

                      {/* 5. Country */}
                      <td className="px-6 py-3.5 text-xs text-slate-700 font-medium">
                        {client.country}
                      </td>

                      {/* 6. Status Badge */}
                      <td className="px-6 py-3.5">
                        {isActivated ? (
                          <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-full shadow-2xs text-xs font-bold capitalize">
                            activated
                          </span>
                        ) : (
                          <span className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 py-1 rounded-full shadow-2xs text-xs font-bold capitalize">
                            suspended
                          </span>
                        )}
                      </td>

                      {/* 7. Quick Actions */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. View Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(client)}
                            className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all cursor-pointer shadow-2xs"
                            title="View Details"
                          >
                            <Pen className="w-4 h-4" />
                          </button>

                          {/* 2. View MT5 Accounts */}
                          <button
                            type="button"
                            onClick={() => handleOpenMt5Accounts(client)}
                            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all cursor-pointer shadow-2xs"
                            title="View MT5 Accounts"
                          >
                            <Monitor className="w-4 h-4" />
                          </button>

                          {/* 3. Login as Client */}
                          <button
                            type="button"
                            onClick={() => handleImpersonate(client)}
                            className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 transition-all cursor-pointer shadow-2xs"
                            title="Login as Client"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>

                          {/* 4. Manage Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenManagePassword(client)}
                            className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 transition-all cursor-pointer shadow-2xs"
                            title="Manage Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* 5. Activate / Suspend */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(client)}
                            className={clsx(
                              "p-2 rounded-full transition-all cursor-pointer hover:scale-110 shadow-2xs",
                              isSuspended
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                            )}
                            title={isSuspended ? "Activate Client" : "Suspend Client"}
                          >
                            {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MOBILE RESPONSIVE CARD VIEW (Exact match to reference HTML) */}
      <div className="lg:hidden space-y-3.5">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-purple-100 text-slate-400 text-sm">
            No clients found matching the search criteria.
          </div>
        ) : (
          filteredClients.map((client) => {
            const isSuspended = client.status === 'suspended';
            const isActivated = !isSuspended;

            return (
              <div 
                key={client.id}
                className="bg-white rounded-2xl border border-purple-100/90 shadow-xs p-4 space-y-3.5 hover:border-purple-200 transition-all"
              >
                {/* Header: Name, Email & Status Badge */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate font-sans">
                      {client.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate font-sans">
                      {client.email}
                    </p>
                  </div>
                  {isActivated ? (
                    <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize shrink-0 shadow-2xs">
                      activated
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize shrink-0 shadow-2xs">
                      suspended
                    </span>
                  )}
                </div>

                {/* 2x2 Grid of details */}
                <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase tracking-wider">Email Status</p>
                    {client.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3 stroke-[2.5]" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <CircleAlert className="w-3 h-3 stroke-[2.5]" /> Unverified
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase tracking-wider">KYC Status</p>
                    {client.kycVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3 stroke-[2.5]" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <CircleAlert className="w-3 h-3 stroke-[2.5]" /> Unverified
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase tracking-wider">IB Partner</p>
                    <p className="text-slate-800 font-bold capitalize text-xs">{client.ibPartnerStatus || 'None'}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-[10px] mb-1 font-semibold uppercase tracking-wider">Country</p>
                    <p className="text-slate-800 font-bold truncate text-xs">{client.country}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-50">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(client)}
                    className="flex-1 min-w-[calc(50%-0.25rem)] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Pen className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMt5Accounts(client)}
                    className="flex-1 min-w-[calc(50%-0.25rem)] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>MT5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleImpersonate(client)}
                    className="flex-1 min-w-[calc(50%-0.25rem)] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenManagePassword(client)}
                    className="flex-1 min-w-[calc(50%-0.25rem)] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </button>

                  {/* Suspend / Activate Full-Width Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(client)}
                    className={clsx(
                      "w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs",
                      isSuspended
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                    )}
                  >
                    {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    <span>{isSuspended ? 'Activate Client' : 'Suspend Client'}</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 5. CLIENT DETAILS SLIDE-OUT DRAWER */}
      <Drawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={selectedClient ? selectedClient.name : 'Client Details'}
        subtitle={selectedClient ? `${selectedClient.email} • ID: ${selectedClient.id}` : ''}
        width="xl"
      >
        {selectedClient && (
          <div className="space-y-5">
            {/* Top Status & Impersonate Bar */}
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-900 font-bold block">Status Level</span>
                <span className={clsx(
                  "inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize",
                  selectedClient.status === 'suspended' ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {selectedClient.status === 'suspended' ? 'Suspended' : 'Active Trader'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleImpersonate(selectedClient)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Open Trading Portal</span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                Contact &amp; Location
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{selectedClient.phone || '+1 555 0199'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">{selectedClient.city || 'City'}, {selectedClient.country}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>IB: {selectedClient.ibPartnerStatus || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Total Deposit</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-700 font-mono">
                  ${(selectedClient.totalDeposit || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-center">
                <span className="text-[10px] text-rose-800 font-semibold block uppercase">Total Withdrawal</span>
                <span className="text-sm sm:text-base font-extrabold text-rose-700 font-mono">
                  ${(selectedClient.totalWithdrawal || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-center">
                <span className="text-[10px] text-purple-800 font-semibold block uppercase">Net Balance</span>
                <span className="text-sm sm:text-base font-extrabold text-purple-700 font-mono">
                  ${(selectedClient.totalBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Trading Accounts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Trading Accounts ({selectedClient.accounts?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsDrawerOpen(false);
                    setIsMt5ModalOpen(true);
                  }}
                  className="text-xs text-purple-700 font-bold hover:underline cursor-pointer"
                >
                  Manage MT5
                </button>
              </div>

              {selectedClient.accounts && selectedClient.accounts.length > 0 ? (
                <div className="space-y-2">
                  {selectedClient.accounts.map((acc) => (
                    <div key={acc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">#{acc.login} ({acc.platform})</span>
                        <span className="text-slate-400 text-[11px]">{acc.server} • Leverage {acc.leverage}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-emerald-600 block">${acc.balance.toLocaleString()}</span>
                        <span className="text-slate-400 text-[11px]">Equity: ${acc.equity.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No trading accounts created yet.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* 6. VIEW MT5 ACCOUNTS MODAL */}
      <Modal
        isOpen={isMt5ModalOpen}
        onClose={() => setIsMt5ModalOpen(false)}
        title={selectedClient ? `Trading Accounts for ${selectedClient.name}` : 'MT5 Trading Accounts'}
        subtitle={selectedClient ? `Client ID: ${selectedClient.id}` : ''}
        maxWidth="lg"
      >
        {selectedClient && (
          <div className="space-y-4">
            {selectedClient.accounts && selectedClient.accounts.length > 0 ? (
              <div className="space-y-3">
                {selectedClient.accounts.map((acc) => (
                  <div key={acc.id} className="p-4 rounded-2xl bg-slate-50/80 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-mono text-xs font-bold">
                          {acc.platform}
                        </span>
                        <span className="font-mono font-extrabold text-base text-slate-900">
                          #{acc.login}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 text-[10px] font-bold">
                          {acc.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans">
                        Server: <span className="font-semibold text-slate-700">{acc.server}</span> • Leverage: <span className="font-semibold text-slate-700">{acc.leverage}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Balance</span>
                        <span className="font-mono font-extrabold text-base text-emerald-600 block">
                          ${acc.balance.toLocaleString()} {acc.currency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMt5ModalOpen(false);
                          handleOpenManagePassword(selectedClient);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active MT5 trading accounts on file for this client.
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMt5ModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 7. MANAGE PASSWORD MODAL */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={selectedClient ? `Manage Password: ${selectedClient.name}` : 'Manage Password'}
        subtitle="Set new credentials for platform or investor access"
        maxWidth="md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Password Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPasswordForm({ ...passwordForm, passwordType: 'master' })}
                className={clsx(
                  "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  passwordForm.passwordType === 'master'
                    ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                )}
              >
                Master Trading Password
              </button>
              <button
                type="button"
                onClick={() => setPasswordForm({ ...passwordForm, passwordType: 'investor' })}
                className={clsx(
                  "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  passwordForm.passwordType === 'investor'
                    ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                )}
              >
                Investor (Read-Only)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Enter new strong password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. ADD NEW CLIENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Client"
        subtitle="Add a trader record to the ND1 CRM"
        maxWidth="md"
      >
        <form onSubmit={handleCreateClient} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newClientForm.name}
              onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={newClientForm.email}
              onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
              placeholder="e.g. john@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
              <input
                type="text"
                required
                value={newClientForm.country}
                onChange={(e) => setNewClientForm({ ...newClientForm, country: e.target.value })}
                placeholder="Country"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                required
                value={newClientForm.city}
                onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                placeholder="City"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
            <input
              type="text"
              value={newClientForm.phone}
              onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
              placeholder="+1 555 0199"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Register Client
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
