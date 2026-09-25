'use client';

import React from 'react';
import { KYCVerificationModal } from '@/components/modals/KYCVerificationModal';

export default function ClientKYCPage() {
  return (
    <div className="py-2 animate-in fade-in select-none">
      <KYCVerificationModal isOpen={true} isInline={true} />
    </div>
  );
}
