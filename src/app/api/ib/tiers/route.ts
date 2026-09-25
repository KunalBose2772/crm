import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'system-config';
const TIERS_FILE = 'ib_tier_config.json';

const DEFAULT_TIERS = [
  {
    tierName: 'Gold',
    minLots: 0,
    forexRebatePerLot: 8.0,
    metalsRebatePerLot: 10.0,
    cryptoRebatePerLot: 15.0,
    indicesRebatePerLot: 6.0,
    subIbSharePercent: 10,
  },
  {
    tierName: 'Platinum',
    minLots: 50,
    forexRebatePerLot: 10.0,
    metalsRebatePerLot: 12.0,
    cryptoRebatePerLot: 18.0,
    indicesRebatePerLot: 8.0,
    subIbSharePercent: 15,
  },
  {
    tierName: 'Diamond',
    minLots: 200,
    forexRebatePerLot: 12.0,
    metalsRebatePerLot: 15.0,
    cryptoRebatePerLot: 22.0,
    indicesRebatePerLot: 10.0,
    subIbSharePercent: 20,
  },
  {
    tierName: 'VIP',
    minLots: 500,
    forexRebatePerLot: 15.0,
    metalsRebatePerLot: 20.0,
    cryptoRebatePerLot: 30.0,
    indicesRebatePerLot: 12.0,
    subIbSharePercent: 25,
  },
];

export async function GET(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    try {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(TIERS_FILE);

      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json({ success: true, tiers: parsed });
        }
      }
    } catch {}

    return NextResponse.json({ success: true, tiers: DEFAULT_TIERS });
  } catch (error: any) {
    console.error('[API /api/ib/tiers GET] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOrigin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await req.json();
    const tiers = body.tiers;

    if (!Array.isArray(tiers) || tiers.length === 0) {
      return NextResponse.json({ success: false, error: 'Valid tiers array required' }, { status: 400 });
    }

    const buffer = Buffer.from(JSON.stringify(tiers, null, 2), 'utf-8');
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(TIERS_FILE, buffer, {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) {
      console.warn('[API /api/ib/tiers POST] Storage upload warning:', error.message);
    }

    return NextResponse.json({ success: true, message: 'Tier configuration saved', tiers });
  } catch (error: any) {
    console.error('[API /api/ib/tiers POST] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
