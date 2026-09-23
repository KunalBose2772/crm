'use client';

import React from 'react';
import { CRMProvider } from '@/context/CRMContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner';
import { ToastContainer } from '@/components/ui/Toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <CRMProvider>
      <div className="min-h-screen bg-[#f8f9fc] text-slate-900 flex flex-row">
        {/* Persistent Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <ImpersonationBanner />

          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>

        {/* Global Toast Container */}
        <ToastContainer />
      </div>
    </CRMProvider>
  );
}
