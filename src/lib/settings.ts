import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = 'system-config';
const SETTINGS_FILE = 'broker_settings.json';

export interface BrokerSettings {
  adminNotificationEmail: string;
  supportEmail: string;
  brandName: string;
  defaultLeverage: string;
  baseCurrency: string;
  usdtAddress: string;
  bankIban: string;
  bankName: string;
  bankBeneficiary: string;
  mt5Host: string;
  bypassPaymentGateway: boolean;
}

export const DEFAULT_BROKER_SETTINGS: BrokerSettings = {
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'kunalbose2570@gmail.com',
  supportEmail: 'support@testcrm.co.in',
  brandName: 'ND1 Capital',
  defaultLeverage: '1:100',
  baseCurrency: 'USD',
  usdtAddress: 'TX9aB2cD4eF6gH8jK1mN3pQ5rS7tU9vW2x',
  bankIban: 'GB82BARC20000012345678',
  bankName: 'Standard Chartered Bank',
  bankBeneficiary: 'Ocean Markets Global Ltd.',
  mt5Host: 'access.tgshost.org:26043',
  bypassPaymentGateway: true, // Manual / Direct proof mode bypass active
};

// Cached settings for ultra-fast server-side lookup
let cachedSettings: BrokerSettings | null = null;
let lastCacheFetch = 0;
const CACHE_TTL = 5000; // 5 seconds

export async function getBrokerSettings(): Promise<BrokerSettings> {
  const now = Date.now();
  if (cachedSettings && now - lastCacheFetch < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(SETTINGS_FILE);

    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        const merged: BrokerSettings = { ...DEFAULT_BROKER_SETTINGS, ...parsed };
        cachedSettings = merged;
        lastCacheFetch = now;
        return merged;
      }
    }
  } catch (err) {
    console.warn('[BrokerSettings] Error reading remote settings, using default:', err);
  }

  return DEFAULT_BROKER_SETTINGS;
}

export async function saveBrokerSettings(newSettings: Partial<BrokerSettings>): Promise<BrokerSettings> {
  const current = await getBrokerSettings();
  const merged: BrokerSettings = {
    ...current,
    ...newSettings,
  };

  const buffer = Buffer.from(JSON.stringify(merged, null, 2), 'utf-8');
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(SETTINGS_FILE, buffer, {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) {
    console.error('[BrokerSettings] Failed to save settings to storage:', error.message);
    throw error;
  }

  cachedSettings = merged;
  lastCacheFetch = Date.now();
  return merged;
}
