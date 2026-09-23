'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ImpersonationBanner: React.FC = () => {
  const { impersonation, stopImpersonation } = useCRM();

  if (!impersonation.isActive || !impersonation.client) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-md sticky top-16 z-20">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 animate-bounce shrink-0" />
        <span>
          <strong>Impersonation Active:</strong> You are viewing account context for{' '}
          <span className="underline font-bold">{impersonation.client.name}</span> ({impersonation.client.email} | #{impersonation.client.id})
        </span>
      </div>
      <button
        onClick={stopImpersonation}
        className="px-2.5 py-1 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
      >
        <XCircle className="w-3.5 h-3.5" />
        Stop Impersonation
      </button>
    </div>
  );
};
