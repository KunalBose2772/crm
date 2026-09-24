'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ImpersonationBanner: React.FC = () => {
  const { impersonation, stopImpersonation } = useCRM();

  if (!impersonation.isActive || !impersonation.client) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-3 sm:px-4 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs font-medium shadow-md sticky top-16 z-20 w-full max-w-full">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Eye className="w-4 h-4 animate-bounce shrink-0" />
        <span className="truncate">
          <strong>Impersonation Active:</strong>{' '}
          <span className="underline font-bold">{impersonation.client.name}</span> ({impersonation.client.email} | #{impersonation.client.id})
        </span>
      </div>
      <button
        onClick={stopImpersonation}
        className="px-2.5 py-1 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shrink-0"
      >
        <XCircle className="w-3.5 h-3.5" />
        Stop Impersonation
      </button>
    </div>
  );
};
