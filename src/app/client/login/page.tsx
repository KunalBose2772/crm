import React from 'react';
import { IsolatedClientLoginScreen } from '@/components/auth/IsolatedClientLoginScreen';

export const metadata = {
  title: 'Client Login | Trading Desk Portal',
  description: 'Secure client login to access MetaTrader 5 trading accounts and dashboard.',
};

export default function ClientLoginPage() {
  return <IsolatedClientLoginScreen />;
}
