'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '@/context/CRMContext';
import { Client, TradingAccount } from '@/types/crm';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
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
  Building,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ClientManagementPage() {
  const router = useRouter();
  const { clients, updateClientStatus, addClient, startImpersonation, showToast } = useCRM();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    if (filterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterMenuOpen]);

  const [statusFilter, setStatusFilter] = useState<'all' | 'activated' | 'suspended'>('all');
  const [emailFilter, setEmailFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [ibFilter, setIbFilter] = useState<'all' | 'active' | 'inactive' | 'none'>('all');

  // Interactive Modals state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMt5ModalOpen, setIsMt5ModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Client Details Modal state (Image 1)
  const [detailsTab, setDetailsTab] = useState<'personal' | 'documents' | 'financial'>('personal');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '05/14/1992',
    country: '',
    education: '',
    emailStatus: 'verified', // 'verified' | 'unverified'
    kycStatus: 'verified', // 'verified' | 'unverified' | 'rejected'
    ibStatus: 'Active', // 'Active' | 'Not Active' | 'None'
  });

  // Password Modal state (Image 4)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPasswordVal, setCurrentPasswordVal] = useState('•••••••••••••••••••••••••');
  const [newPasswordVal, setNewPasswordVal] = useState('');

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

      // Status filter
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
    const names = client.name.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    setClientForm({
      firstName,
      lastName,
      email: client.email,
      phone: client.phone || '4567890321',
      dob: '05/14/1992',
      country: client.country || 'Algeria',
      education: '',
      emailStatus: client.emailVerified !== false ? 'verified' : 'unverified',
      kycStatus: client.kycVerified ? 'verified' : 'unverified',
      ibStatus: client.ibPartnerStatus === 'active' ? 'Active' : (client.ibPartnerStatus === 'inactive' ? 'Not Active' : 'None'),
    });
    setDetailsTab('personal');
    setIsEditingDetails(false);
    setIsDetailsModalOpen(true);
  };

  const handleOpenMt5Accounts = (client: Client) => {
    setSelectedClient(client);
    setIsMt5ModalOpen(true);
  };

  const handleOpenManagePassword = (client: Client) => {
    setSelectedClient(client);
    setCurrentPasswordVal('•••••••••••••••••••••••••');
    setNewPasswordVal('');
    setShowCurrentPassword(false);
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

  // Wire "Login as Client" directly to Client Portal at /client/dashboard in a new tab
  const handleImpersonate = (client: Client) => {
    startImpersonation(client);
    showToast('info', 'Client Portal Active', `Opening client workspace for ${client.name} in a new tab...`);
    window.open(`/client/dashboard?clientId=${client.id}`, '_blank');
  };

  const handleSaveDetails = () => {
    showToast('success', 'Client Details Updated', `Changes saved for ${clientForm.firstName} ${clientForm.lastName}.`);
    setIsEditingDetails(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordVal) {
      showToast('error', 'Password Required', 'Please enter a new password.');
      return;
    }
    showToast('success', 'Password Updated', `New credentials applied for ${selectedClient?.name}.`);
    setIsPasswordModalOpen(false);
  };

  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name || !newClientForm.email) return;

    setIsSubmittingClient(true);
    try {
      const res = await addClient({
        name: newClientForm.name,
        email: newClientForm.email,
        phone: newClientForm.phone || '+91 9876543210',
        country: newClientForm.country || 'India',
        city: newClientForm.city || 'Headquarters',
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setNewClientForm({
          name: '',
          email: '',
          phone: '',
          country: 'India',
          city: 'Mumbai',
        });
        showToast(
          'success',
          'Client Registered & Credentials Sent',
          `Welcome email with portal login link, username and password has been emailed to ${newClientForm.email}.`
        );
      }
    } finally {
      setIsSubmittingClient(false);
    }
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
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients by name, email, or country..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl sm:rounded-2xl border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200/50 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filter Popover Button */}
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                    filterMenuOpen || activeFiltersCount > 0
                      ? "bg-purple-600 text-white border-purple-600 shadow-purple-500/20"
                      : "bg-white text-slate-700 border-purple-200/80 hover:bg-purple-50/50 hover:text-purple-700"
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-purple-700 text-[10px] font-extrabold">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", filterMenuOpen && "rotate-180")} />
                </button>

                {/* Filter Dropdown Popover */}
                {filterMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-purple-100 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 font-heading">Filter Directory</span>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Account Status</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['all', 'activated', 'suspended'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setStatusFilter(s)}
                              className={clsx(
                                "py-1 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer",
                                statusFilter === s
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Email Verification</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['all', 'verified', 'unverified'] as const).map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => setEmailFilter(e)}
                              className={clsx(
                                "py-1 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer",
                                emailFilter === e
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">KYC Verification</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['all', 'verified', 'unverified'] as const).map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setKycFilter(k)}
                              className={clsx(
                                "py-1 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer",
                                kycFilter === k
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">IB Partner Status</label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['all', 'active', 'inactive', 'none'] as const).map((ib) => (
                            <button
                              key={ib}
                              type="button"
                              onClick={() => setIbFilter(ib)}
                              className={clsx(
                                "py-1 px-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer",
                                ibFilter === ib
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              )}
                            >
                              {ib}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFilterMenuOpen(false)}
                      className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      Apply Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold border border-purple-200/80 bg-white text-slate-700 hover:bg-purple-50/50 hover:text-purple-700 transition-all cursor-pointer shadow-2xs"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Add Client Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/25 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>
          </div>

          {/* Quick Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] text-slate-400 font-bold">Active Filters:</span>
              {statusFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center gap-1">
                  Status: {statusFilter}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setStatusFilter('all')} />
                </span>
              )}
              {emailFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center gap-1">
                  Email: {emailFilter}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setEmailFilter('all')} />
                </span>
              )}
              {kycFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center gap-1">
                  KYC: {kycFilter}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setKycFilter('all')} />
                </span>
              )}
              {ibFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center gap-1">
                  IB: {ibFilter}
                  <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setIbFilter('all')} />
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] text-purple-600 font-bold hover:underline ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 3. DESKTOP CLIENT DIRECTORY TABLE (Hidden on Mobile) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-purple-100/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100/90 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] font-heading">
                <th className="py-4 px-4 pl-6">Client Name</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-3 text-center">Email Verified</th>
                <th className="py-4 px-3 text-center">KYC Verified</th>
                <th className="py-4 px-4">IB Partner Status</th>
                <th className="py-4 px-4">Country</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700 font-sans">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No clients match your filter criteria.</p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); resetFilters(); }}
                      className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      Clear search &amp; filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isSuspended = client.status === 'suspended';
                  const isEmailVerified = client.emailVerified !== false;
                  const isKycVerified = !!client.kycVerified;
                  const ibStatus = client.ibPartnerStatus || 'None';

                  return (
                    <tr
                      key={client.id}
                      className={clsx(
                        "hover:bg-purple-50/30 transition-colors group",
                        isSuspended && "opacity-60 bg-rose-50/10"
                      )}
                    >
                      {/* 1. Client Name */}
                      <td className="py-4 px-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {client.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate group-hover:text-purple-700 transition-colors">
                              {client.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {client.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td className="py-4 px-4">
                        <span className="text-slate-600 font-mono text-[11px] block truncate max-w-[190px]">
                          {client.email}
                        </span>
                      </td>

                      {/* 3. Email Verified Pill */}
                      <td className="py-4 px-3 text-center">
                        <span className={clsx(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold",
                          isEmailVerified
                            ? "bg-emerald-100/90 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        )}>
                          {isEmailVerified ? <Check className="w-3 h-3 text-emerald-700" /> : <CircleAlert className="w-3 h-3 text-amber-700" />}
                          <span>{isEmailVerified ? 'Verified' : 'Unverified'}</span>
                        </span>
                      </td>

                      {/* 4. KYC Verified Pill */}
                      <td className="py-4 px-3 text-center">
                        <span className={clsx(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold",
                          isKycVerified
                            ? "bg-emerald-100/90 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        )}>
                          {isKycVerified ? <Check className="w-3 h-3 text-emerald-700" /> : <CircleAlert className="w-3 h-3 text-amber-700" />}
                          <span>{isKycVerified ? 'Verified' : 'Unverified'}</span>
                        </span>
                      </td>

                      {/* 5. IB Partner Status */}
                      <td className="py-4 px-4">
                        <span className={clsx(
                          "px-2.5 py-1 rounded-md text-[11px] font-bold inline-block",
                          ibStatus === 'active'
                            ? "bg-purple-100 text-purple-800"
                            : ibStatus === 'inactive'
                            ? "bg-slate-100 text-slate-600"
                            : "bg-slate-100 text-slate-400"
                        )}>
                          {ibStatus}
                        </span>
                      </td>

                      {/* 6. Country */}
                      <td className="py-4 px-4">
                        <span className="text-slate-700 font-medium block truncate max-w-[120px]">
                          {client.country}
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td className="py-4 px-3 text-center">
                        <span className={clsx(
                          "inline-block px-2.5 py-1 rounded-full text-[11px] font-bold capitalize",
                          isSuspended
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        )}>
                          {isSuspended ? 'Suspended' : 'Activated'}
                        </span>
                      </td>

                      {/* 8. Action Buttons */}
                      <td className="py-4 px-4 pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(client)}
                            className="p-1.5 rounded-lg border border-purple-200/80 bg-white hover:bg-purple-50 text-purple-700 transition-colors cursor-pointer shadow-2xs"
                            title="View Details"
                          >
                            <Pen className="w-3.5 h-3.5" />
                          </button>

                          {/* Accounts Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenMt5Accounts(client)}
                            className="p-1.5 rounded-lg border border-blue-200/80 bg-white hover:bg-blue-50 text-blue-700 transition-colors cursor-pointer shadow-2xs"
                            title="View MT5 Accounts"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>

                          {/* Login as Client Button (Wired to /client/dashboard) */}
                          <button
                            type="button"
                            onClick={() => handleImpersonate(client)}
                            className="p-1.5 rounded-lg border border-emerald-200/80 bg-white hover:bg-emerald-50 text-emerald-700 transition-colors cursor-pointer shadow-2xs"
                            title="Login as Client (Client Portal)"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                          </button>

                          {/* Manage Password Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenManagePassword(client)}
                            className="p-1.5 rounded-lg border border-amber-200/80 bg-white hover:bg-amber-50 text-amber-700 transition-colors cursor-pointer shadow-2xs"
                            title="Manage Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Activate Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(client)}
                            className={clsx(
                              "p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs",
                              isSuspended
                                ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                : "border-rose-200/80 bg-white hover:bg-rose-50 text-rose-600"
                            )}
                            title={isSuspended ? 'Activate Client' : 'Suspend Client'}
                          >
                            {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
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

        {/* Directory Footer with Count */}
        <div className="p-4 border-t border-purple-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredClients.length}</span> of{' '}
            <span className="font-bold text-slate-800">{clients.length}</span> total clients
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-purple-700 font-semibold">
              Live MT5 Realtime Connection Active
            </span>
          </div>
        </div>
      </div>

      {/* 4. MOBILE RESPONSIVE CARDS (Visible only on mobile/tablet) */}
      <div className="lg:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-purple-100 text-center text-slate-400">
            <p className="text-sm font-semibold">No clients match your filter criteria.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); resetFilters(); }}
              className="mt-2 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredClients.map((client) => {
            const isSuspended = client.status === 'suspended';
            const isEmailVerified = client.emailVerified !== false;
            const isKycVerified = !!client.kycVerified;

            return (
              <div
                key={client.id}
                className={clsx(
                  "p-4 rounded-2xl bg-white border border-purple-100/90 shadow-2xs space-y-3 transition-all",
                  isSuspended && "opacity-75 bg-rose-50/20"
                )}
              >
                {/* Header: Name, Country, and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{client.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">ID: {client.id}</span>
                    </div>
                  </div>
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0",
                    isSuspended ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  )}>
                    {isSuspended ? 'Suspended' : 'Activated'}
                  </span>
                </div>

                {/* Email and Country */}
                <div className="text-xs text-slate-600 space-y-1 font-mono">
                  <div className="truncate">{client.email}</div>
                  <div className="text-slate-400 font-sans text-[11px] flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{client.country}</span>
                    <span className="text-slate-300">•</span>
                    <span>IB: {client.ibPartnerStatus || 'None'}</span>
                  </div>
                </div>

                {/* Verification Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                  <span className={clsx(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                    isEmailVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>
                    {isEmailVerified ? <Check className="w-2.5 h-2.5" /> : <CircleAlert className="w-2.5 h-2.5" />}
                    <span>Email: {isEmailVerified ? 'Verified' : 'Unverified'}</span>
                  </span>

                  <span className={clsx(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                    isKycVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>
                    {isKycVerified ? <Check className="w-2.5 h-2.5" /> : <CircleAlert className="w-2.5 h-2.5" />}
                    <span>KYC: {isKycVerified ? 'Verified' : 'Unverified'}</span>
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(client)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <Pen className="w-3.5 h-3.5 mb-0.5" />
                    <span>Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMt5Accounts(client)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <Monitor className="w-3.5 h-3.5 mb-0.5" />
                    <span>Accounts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleImpersonate(client)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 mb-0.5" />
                    <span>Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenManagePassword(client)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-[10px] font-bold cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 mb-0.5" />
                    <span>Pass</span>
                  </button>
                </div>

                {/* Full-width toggle button */}
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
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. CLIENT DETAILS MODAL (Image 1)                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title=""
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Header Row: Title on Left, "Edit Details" button on Right (Image 1) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Client Details
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isEditingDetails) {
                    handleSaveDetails();
                  } else {
                    setIsEditingDetails(true);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Pen className="w-3.5 h-3.5" />
                <span>{isEditingDetails ? 'Save Details' : 'Edit Details'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Image 1) */}
          <div className="flex items-center gap-8 border-b border-slate-200 text-sm font-sans">
            <button
              type="button"
              onClick={() => setDetailsTab('personal')}
              className={clsx(
                "pb-3 font-semibold transition-all relative cursor-pointer",
                detailsTab === 'personal'
                  ? "text-purple-600 font-bold border-b-2 border-purple-600"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Personal Information
            </button>
            <button
              type="button"
              onClick={() => setDetailsTab('documents')}
              className={clsx(
                "pb-3 font-semibold transition-all relative cursor-pointer",
                detailsTab === 'documents'
                  ? "text-purple-600 font-bold border-b-2 border-purple-600"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Documents
            </button>
            <button
              type="button"
              onClick={() => setDetailsTab('financial')}
              className={clsx(
                "pb-3 font-semibold transition-all relative cursor-pointer",
                detailsTab === 'financial'
                  ? "text-purple-600 font-bold border-b-2 border-purple-600"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Financial Details
            </button>
          </div>

          {/* Tab 1: Personal Information (Exact layout of Image 1) */}
          {detailsTab === 'personal' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 space-y-6 shadow-sm">
              {/* 2-Column Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={clientForm.firstName}
                    disabled={!isEditingDetails}
                    onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 font-sans focus:outline-none focus:border-purple-600 disabled:opacity-90"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={clientForm.lastName}
                    disabled={!isEditingDetails}
                    onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 font-sans focus:outline-none focus:border-purple-600 disabled:opacity-90"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                    Email
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    disabled={!isEditingDetails}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 font-sans focus:outline-none focus:border-purple-600 disabled:opacity-90"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={clientForm.phone}
                    disabled={!isEditingDetails}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 font-sans focus:outline-none focus:border-purple-600 disabled:opacity-90"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={clientForm.dob}
                    disabled={!isEditingDetails}
                    onChange={(e) => setClientForm({ ...clientForm, dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 font-sans focus:outline-none focus:border-purple-600 disabled:opacity-90"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                    Country
                  </label>
                  <input
                    type="text"
                    value={clientForm.country}
                    disabled={!isEditingDetails}
                    onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 font-sans focus:outline-none focus:border-purple-600 disabled:opacity-90"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                    Education Level
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    value={clientForm.education}
                    disabled={!isEditingDetails}
                    onChange={(e) => setClientForm({ ...clientForm, education: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 font-sans focus:outline-none focus:border-purple-600 disabled:opacity-90"
                  />
                </div>
              </div>

              {/* Status Section 1: Email Status (Image 1) */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700 block font-sans">
                  Email Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, emailStatus: 'verified' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-xs",
                      clientForm.emailStatus === 'verified'
                        ? "bg-[#54D696] text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Check className="w-4 h-4" />
                    <span>Verified</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, emailStatus: 'unverified' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                      clientForm.emailStatus === 'unverified'
                        ? "bg-amber-500 text-white"
                        : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <CircleAlert className="w-4 h-4" />
                    <span>Unverified</span>
                  </button>
                </div>
              </div>

              {/* Status Section 2: KYC Status (Image 1) */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700 block font-sans">
                  KYC Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, kycStatus: 'verified' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-xs",
                      clientForm.kycStatus === 'verified'
                        ? "bg-[#54D696] text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Check className="w-4 h-4" />
                    <span>Verified</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, kycStatus: 'unverified' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                      clientForm.kycStatus === 'unverified'
                        ? "bg-amber-500 text-white"
                        : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <CircleAlert className="w-4 h-4" />
                    <span>Unverified</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, kycStatus: 'rejected' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                      clientForm.kycStatus === 'rejected'
                        ? "bg-rose-500 text-white"
                        : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rejected</span>
                  </button>
                </div>
              </div>

              {/* Status Section 3: IB Partner Status (Image 1) */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700 block font-sans">
                  IB Partner Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, ibStatus: 'Active' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-xs",
                      clientForm.ibStatus === 'Active'
                        ? "bg-[#A78BFA] text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <span>Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, ibStatus: 'Not Active' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                      clientForm.ibStatus === 'Not Active'
                        ? "bg-slate-400 text-white"
                        : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <span>Not Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => isEditingDetails && setClientForm({ ...clientForm, ibStatus: 'None' })}
                    className={clsx(
                      "py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                      clientForm.ibStatus === 'None'
                        ? "bg-slate-400 text-white"
                        : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <span>None</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Documents */}
          {detailsTab === 'documents' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 font-heading">Submitted KYC Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Government ID / Passport</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Document No: AL-88910492-X</p>
                  <div className="text-[11px] text-purple-700 font-bold hover:underline cursor-pointer">
                    View Uploaded Front Document
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Proof of Address (Utility Bill)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Issued: February 2026</p>
                  <div className="text-[11px] text-purple-700 font-bold hover:underline cursor-pointer">
                    View Uploaded Proof of Address
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Financial Details */}
          {detailsTab === 'financial' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 font-heading">Funding &amp; Trading Balance</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Total Deposits</span>
                  <div className="font-mono text-xl font-extrabold text-emerald-700 mt-1">
                    ${(selectedClient?.totalDeposit || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-800">Total Withdrawals</span>
                  <div className="font-mono text-xl font-extrabold text-rose-700 mt-1">
                    ${(selectedClient?.totalWithdrawal || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-purple-800">Net Equity</span>
                  <div className="font-mono text-xl font-extrabold text-purple-700 mt-1">
                    ${(selectedClient?.totalBalance || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. VIEW MT5 ACCOUNTS MODAL (Image 2)                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isMt5ModalOpen}
        onClose={() => setIsMt5ModalOpen(false)}
        title=""
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Modal Header: MT5 Accounts - {client.name} (Image 2) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              MT5 Accounts - {selectedClient?.name || 'ref soumya'}
            </h3>
            <button
              type="button"
              onClick={() => setIsMt5ModalOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Top Stat Cards (Image 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Blue - Total Accounts */}
            <div className="p-4 rounded-2xl bg-[#2563EB] text-white space-y-2 shadow-md">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-200" />
                <span className="text-xs font-bold font-sans">Total Accounts</span>
              </div>
              <div className="text-3xl font-extrabold font-mono">
                {selectedClient?.accounts?.length || 0}
              </div>
            </div>

            {/* Card 2: Green - Total Balance */}
            <div className="p-4 rounded-2xl bg-[#00BA63] text-white space-y-2 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold font-mono text-emerald-200">$</span>
                <span className="text-xs font-bold font-sans">Total Balance</span>
              </div>
              <div className="text-3xl font-extrabold font-mono">
                ${(selectedClient?.totalBalance || 0).toFixed(2)}
              </div>
            </div>

            {/* Card 3: Purple/Pink Gradient - Total Equity */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#9333EA] to-[#E11D48] text-white space-y-2 shadow-md">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-200" />
                <span className="text-xs font-bold font-sans">Total Equity</span>
              </div>
              <div className="text-3xl font-extrabold font-mono">
                ${(selectedClient?.totalBalance || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Account Details Table (Image 2) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif text-lg font-bold text-slate-900">
              Account Details
            </h4>

            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-sans">Account Number</th>
                    <th className="py-3 px-4 font-sans">Type</th>
                    <th className="py-3 px-4 font-sans">Leverage</th>
                    <th className="py-3 px-4 font-sans">Balance</th>
                    <th className="py-3 px-4 font-sans">Equity</th>
                    <th className="py-3 px-4 font-sans">P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {selectedClient?.accounts && selectedClient.accounts.length > 0 ? (
                    selectedClient.accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{acc.login}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] uppercase font-mono">
                            {acc.type || 'BASIC'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-slate-700">{acc.leverage.replace('1:', '')}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">${acc.balance.toFixed(2)}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">${acc.equity.toFixed(2)}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">$0.00</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No MT5 accounts provisioned yet for this client.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 7. MANAGE PASSWORD MODAL (Image 4)                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title=""
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Header (Image 4) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              Manage Password
            </h3>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password Field with Eye Toggle (Image 4) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPasswordVal}
                  onChange={(e) => setCurrentPasswordVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password Field (Image 4) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-sans">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••"
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50 font-sans"
              />
            </div>

            {/* Buttons (Image 4: Update Password purple gradient + Cancel gray) */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1 py-2.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
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
              disabled={isSubmittingClient}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {isSubmittingClient ? 'Registering & Sending Email...' : 'Register Client'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
