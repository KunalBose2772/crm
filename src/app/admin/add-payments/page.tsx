'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlusCircle, DollarSign, Award, MinusCircle, CheckCircle2, History } from 'lucide-react';

export default function AddPaymentsPage() {
  const { clients, addManualPayment, transactions } = useCRM();

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedAccountLogin, setSelectedAccountLogin] = useState<number>(
    clients[0]?.accounts[0]?.login || 0
  );
  const [operationType, setOperationType] = useState<'credit_bonus' | 'deposit' | 'debit_correction'>('credit_bonus');
  const [amount, setAmount] = useState<string>('1000');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('Promotional 10% Deposit Bonus Match');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client && client.accounts.length > 0) {
      setSelectedAccountLogin(client.accounts[0].login);
    } else {
      setSelectedAccountLogin(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!selectedAccountLogin) {
      alert('Please select an active trading account.');
      return;
    }

    setIsSubmitting(true);
    addManualPayment({
      clientId: selectedClientId,
      accountLogin: selectedAccountLogin,
      amount: numAmount,
      type: operationType,
      currency,
      description,
    });

    setIsSubmitting(false);
  };

  // Filter transactions for manual actions
  const manualAuditLogs = transactions.filter(
    tx => tx.method === 'Admin Manual Action' || tx.type === 'credit_bonus' || tx.type === 'debit_correction'
  );

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Manual Payments & Bonus Adjustments</h2>
        <p className="text-xs text-slate-500 mt-1">
          Issue trading credit bonuses, execute manual wire balance credits, or process administrative account corrections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adjustment Form */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Create Balance / Credit Adjustment"
            subtitle="Changes will instantly reflect in the trader's MetaTrader account"
            icon={<PlusCircle className="w-5 h-5 text-purple-600" />}
          />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Client Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Client Profile *</label>
                  <select
                    value={selectedClientId}
                    onChange={e => handleClientChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:border-purple-600 shadow-2xs"
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
                      value={selectedAccountLogin}
                      onChange={e => setSelectedAccountLogin(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-purple-900 font-mono font-bold focus:outline-none focus:border-purple-600 shadow-2xs"
                    >
                      {selectedClient.accounts.map(acc => (
                        <option key={acc.id} value={acc.login}>
                          #{acc.login} • {acc.platform} {acc.type} (${acc.balance.toLocaleString()} {acc.currency})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      No trading accounts found for this client.
                    </div>
                  )}
                </div>
              </div>

              {/* Adjustment Type Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Operation Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setOperationType('credit_bonus')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      operationType === 'credit_bonus'
                        ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-900">Trading Bonus</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Non-withdrawable equity booster</p>
                  </div>

                  <div
                    onClick={() => setOperationType('deposit')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      operationType === 'deposit'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Manual Deposit</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Credits real cash balance</p>
                  </div>

                  <div
                    onClick={() => setOperationType('debit_correction')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      operationType === 'debit_correction'
                        ? 'bg-rose-50 border-rose-600 text-rose-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MinusCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold text-slate-900">Correction Debit</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Deducts erroneous balance</p>
                  </div>
                </div>
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="1000.00"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold focus:outline-none focus:border-purple-600 shadow-2xs"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              {/* Remarks / Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Audit Note / Reason *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Loyalty tier bonus match / manual wire settlement"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Apply Adjustment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Selected Account Quick Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Target Account Summary"
              subtitle="Real-time trading metrics"
              icon={<DollarSign className="w-5 h-5 text-purple-600" />}
            />
            <CardContent className="space-y-4">
              {selectedClient ? (
                <>
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                    <span className="text-xs text-slate-500 block font-medium">Client Profile</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedClient.name}</span>
                    <span className="text-xs text-slate-500 block">{selectedClient.email}</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Total Client Deposits:</span>
                      <span className="font-bold text-emerald-600">${selectedClient.totalDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Total Client Balance:</span>
                      <span className="font-bold text-purple-900">${selectedClient.totalBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 items-center">
                      <span className="text-slate-500 font-medium">Verification Level:</span>
                      <span className="font-bold text-xs uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {selectedClient.status}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">No client selected.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Action Audit Log */}
      <Card>
        <CardHeader
          title="Manual Adjustment Audit Trail"
          subtitle="Complete historical log of balance credits, promotions, and corrections"
          icon={<History className="w-5 h-5 text-purple-600" />}
        />
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Adjustment Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {manualAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-purple-700 font-bold tabular-nums">{log.referenceId}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">{log.clientName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-purple-900 font-bold tabular-nums">#{log.accountLogin}</td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 font-sans">
                      {log.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                    {log.type === 'debit_correction' ? '-' : '+'}
                    {log.amount.toLocaleString()} {log.currency}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 font-sans">{log.description}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
