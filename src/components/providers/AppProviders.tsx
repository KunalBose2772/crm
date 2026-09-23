'use client';

import React from 'react';
import { CRMProvider } from '@/context/CRMContext';
import { ToastContainer } from '@/components/ui/Toast';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CRMProvider>
      {children}
      <ToastContainer />
    </CRMProvider>
  );
};
