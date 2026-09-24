'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCRM();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-5 z-50 flex flex-col items-center sm:items-end gap-2 w-[calc(100%-2rem)] max-w-sm sm:w-auto pointer-events-none">
      {toasts.map(toast => {
        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto w-full p-3.5 sm:p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-xl transition-all duration-200 animate-in slide-in-from-bottom-3',
              toast.type === 'success' && 'bg-slate-900/95 border-emerald-500/30 text-emerald-400',
              toast.type === 'warning' && 'bg-slate-900/95 border-amber-500/30 text-amber-400',
              toast.type === 'error' && 'bg-slate-900/95 border-rose-500/30 text-rose-400',
              toast.type === 'info' && 'bg-slate-900/95 border-blue-500/30 text-blue-400'
            )}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
