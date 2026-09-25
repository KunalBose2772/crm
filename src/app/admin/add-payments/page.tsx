'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { PaymentGatewayConfig } from '@/types/crm';
import { initialPaymentGateways } from '@/services/api/mockData';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { Modal } from '@/components/ui/Modal';
import { 
  CreditCard, 
  Plus, 
  Building2, 
  Wallet, 
  Eye, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Copy, 
  ExternalLink, 
  ArrowRightLeft, 
  Sliders, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  CircleCheck,
  Award,
  PlusCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { clsx } from 'clsx';

// Bitcoin SVG component for authentic crypto styling
const BitcoinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
  </svg>
);

export default function ConfigurationPaymentsPage() {
  const { showToast, clients, addManualPayment } = useCRM();

  // Active Tab: 'methods' | 'rates' | 'adjustments'
  const [activeTab, setActiveTab] = useState<'methods' | 'rates' | 'adjustments'>('methods');

  // Payment Gateways state with localStorage persistence
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_payment_gateways');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return initialPaymentGateways;
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_payment_gateways', JSON.stringify(gateways));
    } catch {
      // ignore
    }
  }, [gateways]);

  // Modals state
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayConfig | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state for Add / Edit
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    paymentType: 'Crypto Wallet' | 'Bank Account' | 'Credit Card' | 'Other';
    status: 'active' | 'inactive';
    walletAddress: string;
    network: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    instructions: string;
  }>({
    name: '',
    paymentType: 'Crypto Wallet',
    status: 'active',
    walletAddress: '',
    network: 'TRC20 (Tron)',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    instructions: '',
  });

  // Copied state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Manual Adjustment Form state
  const [adjClientId, setAdjClientId] = useState(clients[0]?.id || '');
  const [adjAccountLogin, setAdjAccountLogin] = useState<number>(clients[0]?.accounts[0]?.login || 0);
  const [adjType, setAdjType] = useState<'credit_bonus' | 'deposit' | 'debit_correction'>('credit_bonus');
  const [adjAmount, setAdjAmount] = useState<string>('1000');
  const [adjCurrency, setAdjCurrency] = useState('USD');
  const [adjDescription, setAdjDescription] = useState('Promotional 10% Deposit Bonus Match');

  const selectedClient = clients.find(c => c.id === adjClientId);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showToast('info', 'Copied to Clipboard', text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Toggle active/inactive
  const handleToggleStatus = (id: string) => {
    setGateways(prev => prev.map(g => {
      if (g.id === id) {
        const nextStatus = g.status === 'active' ? 'inactive' : 'active';
        showToast('success', 'Status Updated', `${g.name} is now ${nextStatus}.`);
        return { ...g, status: nextStatus };
      }
      return g;
    }));
  };

  // Open View Modal
  const handleOpenView = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setIsViewModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = (presetType: 'Crypto Wallet' | 'Bank Account' | 'Other' = 'Crypto Wallet') => {
    setSelectedGateway(null);
    setFormData({
      name: '',
      paymentType: presetType,
      status: 'active',
      walletAddress: '',
      network: presetType === 'Crypto Wallet' ? 'TRC20 (Tron)' : '',
      bankName: presetType === 'Bank Account' ? 'HDFC Bank' : '',
      accountHolder: presetType === 'Bank Account' ? 'Prime Broker Operations Ltd' : '',
      accountNumber: '',
      iban: '',
      swiftCode: '',
      instructions: '',
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setFormData({
      id: gateway.id,
      name: gateway.name,
      paymentType: gateway.paymentType,
      status: gateway.status,
      walletAddress: gateway.accountDetails.walletAddress || '',
      network: gateway.accountDetails.network || '',
      bankName: gateway.accountDetails.bankName || '',
      accountHolder: gateway.accountDetails.accountHolder || '',
      accountNumber: gateway.accountDetails.accountNumber || '',
      iban: gateway.accountDetails.iban || '',
      swiftCode: gateway.accountDetails.swiftCode || '',
      instructions: gateway.accountDetails.instructions || '',
    });
    setIsEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Name Required', 'Please enter a name for the payment account.');
      return;
    }

    if (selectedGateway) {
      // Update existing
      setGateways(prev => prev.map(g => {
        if (g.id === selectedGateway.id) {
          return {
            ...g,
            name: formData.name,
            paymentType: formData.paymentType,
            status: formData.status,
            accountDetails: {
              ...g.accountDetails,
              walletAddress: formData.walletAddress,
              network: formData.network,
              bankName: formData.bankName,
              accountHolder: formData.accountHolder,
              accountNumber: formData.accountNumber,
              iban: formData.iban,
              swiftCode: formData.swiftCode,
              instructions: formData.instructions,
            },
          };
        }
        return g;
      }));
      showToast('success', 'Method Updated', `Configuration for ${formData.name} saved successfully.`);
    } else {
      // Create new
      const newGateway: PaymentGatewayConfig = {
        id: `pay_${Date.now()}`,
        name: formData.name,
        paymentType: formData.paymentType,
        status: formData.status,
        accountDetails: {
          walletAddress: formData.walletAddress,
          network: formData.network,
          bankName: formData.bankName,
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
          iban: formData.iban,
          swiftCode: formData.swiftCode,
          instructions: formData.instructions,
          qrCodeUrl: formData.walletAddress 
            ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formData.walletAddress)}`
            : undefined,
        },
        createdAt: new Date().toISOString(),
      };
      setGateways(prev => [...prev, newGateway]);
      showToast('success', 'Method Added', `Added ${formData.name} to available payment gateways.`);
    }

    setIsEditModalOpen(false);
  };

  // Delete gateway
  const handleOpenDelete = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedGateway) return;
    setGateways(prev => prev.filter(g => g.id !== selectedGateway.id));
    showToast('warning', 'Method Deleted', `Removed ${selectedGateway.name} from payment methods.`);
    setIsDeleteModalOpen(false);
  };

  // Handle Manual Adjustment submit
  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(adjAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!adjAccountLogin) {
      showToast('error', 'Select Account', 'Please select an active trading account.');
      return;
    }

    addManualPayment({
      clientId: adjClientId,
      accountLogin: adjAccountLogin,
      amount: numAmount,
      type: adjType,
      currency: adjCurrency,
      description: adjDescription,
    });
  };

  // Stats
  const activeCount = gateways.filter(g => g.status === 'active').length;
  const cryptoCount = gateways.filter(g => g.paymentType === 'Crypto Wallet').length;
  const bankCount = gateways.filter(g => g.paymentType === 'Bank Account').length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 select-none pb-12 font-sans">
      {/* 1. Established Royal Purple Welcome Banner */}
      <WelcomeBanner
        title="Configuration Settings"
        subtitle="Manage your payment methods, gateways, and exchange rates."
        badgeText="Payment Gateways"
        onRefresh={() => showToast('success', 'Configuration Synchronized', 'Payment gateways re-fetched from database.')}
      />

      {/* 2. Top 4 Established KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Total Methods
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {gateways.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">accounts</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Active Rails
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <CircleCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {activeCount}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">live gateways</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Crypto Wallets
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BitcoinIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              {cryptoCount}
            </span>
            <span className="text-xs text-amber-500/80 font-medium">addresses</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Bank Accounts
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono">
              {bankCount}
            </span>
            <span className="text-xs text-purple-600/80 font-medium">wire rails</span>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-purple-100/90 shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('methods')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'methods'
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-purple-700 hover:bg-purple-50"
          )}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Methods</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'rates'
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-purple-700 hover:bg-purple-50"
          )}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Exchange Rates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adjustments')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'adjustments'
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-purple-700 hover:bg-purple-50"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Manual Balance Adjustment</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: Payment Methods */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100/90 overflow-hidden">
            {/* Header banner matching user's layout */}
            <div className="bg-gradient-to-r from-[#4c1d95] via-[#581c87] to-[#6b21a8] p-5 sm:p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/15 rounded-xl shadow-inner border border-white/20">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">Payment Methods</h2>
                    <p className="text-purple-200 text-xs sm:text-sm">Manage and configure your company payment gateway accounts</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCreate('Crypto Wallet')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-900 rounded-xl hover:bg-purple-50 transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="h-4 w-4 text-purple-700" />
                  <span>Add Payment Method</span>
                </button>
              </div>
            </div>

            {/* Desktop Table (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-purple-100/90 text-slate-600 font-bold uppercase tracking-wider text-[11px] font-heading">
                    <th className="p-4 pl-6 font-semibold">S.No.</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Payment Type</th>
                    <th className="p-4 font-semibold">Account Details</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 pr-6 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {gateways.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No payment gateways configured. Click "Add Gateway" to set up bank rails or crypto deposit wallets.
                      </td>
                    </tr>
                  ) : (
                    gateways.map((g, idx) => {
                      const isCrypto = g.paymentType === 'Crypto Wallet';
                      const isBank = g.paymentType === 'Bank Account';

                    return (
                      <tr key={g.id} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="p-4 pl-6 font-mono text-sm font-semibold text-slate-700">
                          {idx + 1}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            {isCrypto ? (
                              <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-200">
                                <BitcoinIcon className="h-4 w-4 text-orange-500" />
                              </div>
                            ) : isBank ? (
                              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                                <Building2 className="h-4 w-4 text-blue-500" />
                              </div>
                            ) : (
                              <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200">
                                <Wallet className="h-4 w-4 text-purple-500" />
                              </div>
                            )}
                            <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {g.name}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-xs font-bold inline-block shadow-2xs",
                            isCrypto && "bg-blue-100 text-blue-800",
                            isBank && "bg-emerald-100 text-emerald-800",
                            !isCrypto && !isBank && "bg-purple-100 text-purple-800"
                          )}>
                            {g.paymentType}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleOpenView(g)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-700 hover:bg-purple-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-purple-200"
                          >
                            <Eye className="h-4 w-4 text-purple-600" />
                            <span>View Details</span>
                          </button>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(g.id)}
                              className={clsx(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors",
                                g.status === 'active'
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "bg-white border-slate-300 text-transparent hover:border-purple-400"
                              )}
                              title={g.status === 'active' ? "Click to deactivate" : "Click to activate"}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </button>
                            <span className={clsx(
                              "text-xs font-bold",
                              g.status === 'active' ? "text-green-600" : "text-slate-400"
                            )}>
                              {g.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 pr-6">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(g)}
                              className="p-2 border border-slate-200 rounded-xl hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors cursor-pointer shadow-2xs"
                              title="Edit Configuration"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(g)}
                              className="p-2 border border-slate-200 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
                              title="Delete Method"
                            >
                              <Trash2 className="h-4 w-4" />
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

            {/* Mobile Cards (Matches user's mobile layout) */}
            <div className="block md:hidden space-y-3 p-4 bg-slate-50/50">
              {gateways.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-purple-100 p-4">
                  No payment gateways configured.
                </div>
              ) : (
                gateways.map((g, idx) => (
                  <div key={g.id} className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">
                        #{idx + 1} {g.paymentType}
                      </span>
                      <span className={clsx(
                        "text-xs font-bold px-2 py-0.5 rounded-md",
                        g.status === 'active' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {g.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      {g.paymentType === 'Crypto Wallet' ? (
                        <BitcoinIcon className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-blue-500" />
                      )}
                      <span>{g.name}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenView(g)}
                        className="text-purple-700 text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 border border-purple-100 rounded-lg hover:bg-purple-50 text-slate-700 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(g)}
                          className="p-1.5 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Quick Add Bar */}
            <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-purple-100/90">
              <div className="flex items-center gap-3 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenCreate('Bank Account')}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl hover:bg-white hover:border-purple-300 hover:text-purple-700 transition-colors text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                >
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Add Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCreate('Crypto Wallet')}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl hover:bg-white hover:border-orange-300 hover:text-orange-700 transition-colors text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                >
                  <BitcoinIcon className="h-4 w-4 text-orange-500" />
                  <span>Add Crypto</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCreate('Other')}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl hover:bg-white hover:border-purple-300 hover:text-purple-700 transition-colors text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                >
                  <Wallet className="h-4 w-4 text-purple-600" />
                  <span>Add Other</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: Exchange Rates */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-3xl border border-purple-100/90 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-purple-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Internal Currency Exchange Matrices</h3>
              <p className="text-xs text-slate-500">Live operational rates applied during multi-currency deposits and trading ledger conversions.</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('success', 'Rates Refreshed', 'Fetched latest ECB and Binance market feeds.')}
              className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
            >
              Refresh Rates
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { pair: 'EUR / USD', rate: '1.0845', change: '+0.15%', type: 'fiat' },
              { pair: 'GBP / USD', rate: '1.2710', change: '-0.08%', type: 'fiat' },
              { pair: 'USD / INR', rate: '83.45', change: '+0.02%', type: 'fiat' },
              { pair: 'BTC / USD', rate: '64,280.00', change: '+2.41%', type: 'crypto' },
              { pair: 'ETH / USD', rate: '3,485.50', change: '+1.80%', type: 'crypto' },
              { pair: 'USDT / USD', rate: '1.0000', change: '0.00%', type: 'crypto' },
            ].map((item) => (
              <div key={item.pair} className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 font-heading">{item.pair}</span>
                  <div className="text-lg font-mono font-extrabold text-purple-950 mt-1">{item.rate}</div>
                </div>
                <span className={clsx(
                  "text-xs font-bold px-2 py-0.5 rounded-md",
                  item.change.startsWith('+') ? "bg-emerald-100 text-emerald-700" : item.change.startsWith('-') ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                )}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: Manual Adjustments */}
      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-3xl border border-purple-100/90 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Manual Balance &amp; Credit Bonus Adjustments</h3>
            <p className="text-xs text-slate-500">Issue direct trading credit bonuses or execute administrative corrections to MetaTrader accounts.</p>
          </div>

          <form onSubmit={handleAdjSubmit} className="space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Client Profile *</label>
                <select
                  value={adjClientId}
                  onChange={e => {
                    setAdjClientId(e.target.value);
                    const client = clients.find(c => c.id === e.target.value);
                    if (client && client.accounts.length > 0) {
                      setAdjAccountLogin(client.accounts[0].login);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-purple-600 shadow-2xs"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Trading Account Login *</label>
                {selectedClient && selectedClient.accounts.length > 0 ? (
                  <select
                    value={adjAccountLogin}
                    onChange={e => setAdjAccountLogin(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm text-purple-900 font-mono font-bold focus:outline-none focus:border-purple-600 shadow-2xs"
                  >
                    {selectedClient.accounts.map(acc => (
                      <option key={acc.id} value={acc.login}>
                        #{acc.login} • {acc.platform} (${acc.balance.toLocaleString()} {acc.currency})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No trading accounts found.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'credit_bonus', label: 'Trading Bonus', desc: 'Non-withdrawable equity booster' },
                { id: 'deposit', label: 'Wire Deposit', desc: 'Direct cash balance credit' },
                { id: 'debit_correction', label: 'Debit Correction', desc: 'Deduct incorrect administrative credit' },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setAdjType(opt.id as any)}
                  className={clsx(
                    "p-3.5 rounded-2xl border cursor-pointer transition-all",
                    adjType === opt.id
                      ? "bg-purple-50 border-purple-600 shadow-2xs"
                      : "bg-white border-slate-200 hover:border-purple-200"
                  )}
                >
                  <span className="text-xs font-bold text-slate-900 block">{opt.label}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{opt.desc}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Adjustment Amount *</label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={e => setAdjAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency</label>
                <select
                  value={adjCurrency}
                  onChange={e => setAdjCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Audit Note / Description</label>
              <input
                type="text"
                value={adjDescription}
                onChange={e => setAdjDescription(e.target.value)}
                placeholder="Reason for adjustment..."
                className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Execute Account Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. VIEW DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedGateway ? `Payment Account: ${selectedGateway.name}` : 'Account Details'}
        subtitle={selectedGateway ? `${selectedGateway.paymentType} • Status: ${selectedGateway.status.toUpperCase()}` : ''}
        maxWidth="lg"
      >
        {selectedGateway && (
          <div className="space-y-5">
            {/* Crypto Account Details */}
            {selectedGateway.paymentType === 'Crypto Wallet' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Crypto Rail</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold text-xs">
                      {selectedGateway.accountDetails.network || 'TRC20 (Tron)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Deposit Wallet Address:</span>
                    <div className="p-3 rounded-xl bg-white border border-purple-100 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-900 break-all select-all font-semibold">
                        {selectedGateway.accountDetails.walletAddress || 'TYDzsYUEpvnYmQk4zGP9s263VSt59b74bK'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedGateway.accountDetails.walletAddress || '')}
                        className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-600 cursor-pointer shrink-0"
                        title="Copy Address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code preview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-purple-600" />
                    <span>Trader QR Scan Code</span>
                  </span>
                  <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedGateway.accountDetails.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedGateway.accountDetails.walletAddress || '')}`}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">Scan with Tron / Trust / Binance App</span>
                </div>

                {selectedGateway.accountDetails.instructions && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Deposit Notice:</span>
                    {selectedGateway.accountDetails.instructions}
                  </div>
                )}
              </div>
            ) : (
              /* Bank Account Details */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-purple-100/60">
                    <span className="text-slate-500 font-medium">Bank Name</span>
                    <span className="font-bold text-slate-900">{selectedGateway.accountDetails.bankName || 'HDFC Bank'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-purple-100/60">
                    <span className="text-slate-500 font-medium">Beneficiary / Holder</span>
                    <span className="font-bold text-slate-900">{selectedGateway.accountDetails.accountHolder || 'Prime Brokerage Operations Ltd'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-purple-100/60">
                    <span className="text-slate-500 font-medium">Account Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-purple-700">{selectedGateway.accountDetails.accountNumber || '982347102934'}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedGateway.accountDetails.accountNumber || '')}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between py-1 border-b border-purple-100/60">
                    <span className="text-slate-500 font-medium">SWIFT / IFSC</span>
                    <span className="font-mono font-bold text-slate-800">{selectedGateway.accountDetails.swiftCode || 'HDFCINBB'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Branch Location</span>
                    <span className="font-medium text-slate-700">{selectedGateway.accountDetails.branch || 'Corporate District'}</span>
                  </div>
                </div>

                {selectedGateway.accountDetails.instructions && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <span className="font-bold block mb-0.5">Wire Transfer Instructions:</span>
                    {selectedGateway.accountDetails.instructions}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { setIsViewModalOpen(false); handleOpenEdit(selectedGateway); }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Edit Configuration
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 8. ADD / EDIT CONFIGURATION MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedGateway ? `Edit Method: ${selectedGateway.name}` : 'Add Payment Method'}
        subtitle="Configure payment receptor account parameters for trader deposit routing"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveGateway} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Label / Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. USDT, Primary Wire Account"
                className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Type</label>
              <select
                value={formData.paymentType}
                onChange={e => setFormData({ ...formData, paymentType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
              >
                <option value="Crypto Wallet">Crypto Wallet</option>
                <option value="Bank Account">Bank Account</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Other">Other Gateway</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.status === 'active'}
                  onChange={() => setFormData({ ...formData, status: 'active' })}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-green-700">Active</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={formData.status === 'inactive'}
                  onChange={() => setFormData({ ...formData, status: 'inactive' })}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-slate-500">Inactive</span>
              </label>
            </div>
          </div>

          {/* Conditional fields based on type */}
          {formData.paymentType === 'Crypto Wallet' ? (
            <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crypto Network</label>
                <input
                  type="text"
                  value={formData.network}
                  onChange={e => setFormData({ ...formData, network: e.target.value })}
                  placeholder="e.g. TRC20 (Tron), ERC20, BTC"
                  className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deposit Wallet Address *</label>
                <input
                  type="text"
                  required
                  value={formData.walletAddress}
                  onChange={e => setFormData({ ...formData, walletAddress: e.target.value })}
                  placeholder="e.g. TYDzsYUEpvnYmQk4zGP9s263VSt59b74bK"
                  className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank, Barclays"
                    className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                    placeholder="e.g. Prime Brokerage Ltd"
                    className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Number / IBAN</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. 982347102934"
                    className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SWIFT / BIC / IFSC</label>
                  <input
                    type="text"
                    value={formData.swiftCode}
                    onChange={e => setFormData({ ...formData, swiftCode: e.target.value })}
                    placeholder="e.g. HDFCINBB"
                    className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trader Instructions / Reference Note</label>
            <textarea
              rows={2}
              value={formData.instructions}
              onChange={e => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="e.g. Please include your MT5 login in the wire reference note..."
              className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95"
            >
              {selectedGateway ? 'Save Changes' : 'Create Gateway'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 9. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Payment Method"
        subtitle="This action will permanently remove this gateway from client deposit options."
        maxWidth="md"
      >
        {selectedGateway && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">{selectedGateway.name}</strong> ({selectedGateway.paymentType})? Traders will no longer be able to submit deposits through this rail.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
