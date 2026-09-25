'use client';

import React from 'react';
import { CRMProvider } from '@/context/CRMContext';
import { ToastContainer } from '@/components/ui/Toast';
import { SecurityGuard } from '@/components/security/SecurityGuard';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CRMProvider>
      <SecurityGuard />
      {children}
      <ToastContainer />
    </CRMProvider>
  );
};

