import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';
import { MT5_ACCOUNT_MAPPING, MT5GroupConfig } from '@/config/mt5';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'system-config';
const FILE_NAME = 'account_groups.json';

// In-memory cache for speed
let cachedConfig: Record<string, MT5GroupConfig> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds

export async function getAccountGroups(): Promise<Record<string, MT5GroupConfig>> {
  const now = Date.now();
  if (cachedConfig && (now - lastCacheTime) < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(FILE_NAME);

    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        cachedConfig = parsed;
        lastCacheTime = now;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[API /api/mt5/groups] Error reading remote config, using fallback:', err);
  }

  // Fallback to default in-code mapping
  return MT5_ACCOUNT_MAPPING;
}

export async function GET(req: NextRequest) {
  try {
    const groups = await getAccountGroups();
    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error: any) {
    console.error('[API /api/mt5/groups GET] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message, groups: MT5_ACCOUNT_MAPPING },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized request origin' }, { status: 403 });
    }

    const body = await req.json();
    const { groups } = body;

    if (!groups || typeof groups !== 'object' || Object.keys(groups).length === 0) {
      return NextResponse.json({ success: false, error: 'Valid groups object is required' }, { status: 400 });
    }

    // Clean & validate each group
    const sanitizedGroups: Record<string, MT5GroupConfig> = {};
    for (const [key, raw] of Object.entries(groups as Record<string, any>)) {
      const id = (raw.id || key).toUpperCase();
      sanitizedGroups[id] = {
        id: id as any,
        name: sanitizeString(raw.name || id, 50),
        group: sanitizeString(raw.group || `crmtest\\${id.toLowerCase()}`, 100),
        tag: sanitizeString(raw.tag || 'Trading Account', 100),
        server: sanitizeString(raw.server || 'TheKFMarket-Live', 100),
        deposit: sanitizeString(raw.deposit || '$100', 50),
        minDeposit: Number(raw.minDeposit) || 0,
        maxDeposit: raw.maxDeposit ? Number(raw.maxDeposit) : undefined,
        defaultLeverage: sanitizeString(raw.defaultLeverage || '1:100', 20),
        maxLeverage: sanitizeString(raw.maxLeverage || '1:500', 20),
        description: sanitizeString(raw.description || '', 300),
        features: Array.isArray(raw.features) 
          ? raw.features.map((f: any) => sanitizeString(String(f), 150)).filter(Boolean)
          : [],
        highlightsCount: Number(raw.highlightsCount) || (Array.isArray(raw.features) ? raw.features.length : 5),
      };
    }

    // Save to Supabase Storage
    const buffer = Buffer.from(JSON.stringify(sanitizedGroups, null, 2), 'utf-8');
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(FILE_NAME, buffer, {
        contentType: 'application/json',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Update in-memory cache immediately
    cachedConfig = sanitizedGroups;
    lastCacheTime = Date.now();

    return NextResponse.json({
      success: true,
      message: 'Account groups updated successfully across all client and admin APIs.',
      groups: sanitizedGroups,
    });
  } catch (error: any) {
    console.error('[API /api/mt5/groups POST] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
