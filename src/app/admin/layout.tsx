'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '@/context/CRMContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner';
import { Loader2, TrendingUp } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useCRM();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Loading skeleton while reading session state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20 animate-pulse">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Verifying Broker Admin Session...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, prevent flash while redirect takes effect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 flex flex-row">
      {/* Persistent Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <ImpersonationBanner />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
