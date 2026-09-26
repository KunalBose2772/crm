import { NextRequest, NextResponse } from 'next/server';
import { CopySubscription } from '@/types/crm';
import { supabaseAdmin } from '@/lib/supabase';
import { mt5Client } from '@/services/mt5/mt5Client';

const BUCKET_NAME = 'system-config';
const SUBS_FILE = 'copy_trading_subscriptions.json';

// Initial seed
const INITIAL_SUBS: CopySubscription[] = [
  {
    id: 'sub_101',
    clientId: 'cli_1790321523932',
    masterId: 'master_27264289',
    masterName: 'Apex Alpha Yield',
    masterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    copierAccountLogin: 10001,
    allocatedAmount: 1000,
    currentEquity: 1148.50,
    unrealizedPnL: 48.50,
    realizedPnL: 100.00,
    copyMode: 'proportional',
    riskStopPercent: 20,
    status: 'active',
    startDate: '2026-09-01',
  },
];

let cachedSubscriptions: CopySubscription[] = [...INITIAL_SUBS];

async function loadSubscriptionsFromStorage(): Promise<CopySubscription[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(SUBS_FILE);

    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        cachedSubscriptions = parsed;
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn('[API /api/copy-trading/subscriptions] Supabase load warning:', err.message);
  }
  return cachedSubscriptions;
}

async function saveSubscriptionsToStorage(subsList: CopySubscription[]) {
  try {
    const buffer = Buffer.from(JSON.stringify(subsList, null, 2), 'utf-8');
    await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(SUBS_FILE, buffer, {
        contentType: 'application/json',
        upsert: true,
      });
  } catch (err: any) {
    console.warn('[API /api/copy-trading/subscriptions] Supabase save warning:', err.message);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const allSubs = await loadSubscriptionsFromStorage();

    const targetSubs = clientId
      ? allSubs.filter(s => s.clientId === clientId)
      : allSubs;

    // Dynamically query live MT5 account equity and PnL for each copier account
    const enrichedSubs = await Promise.all(
      targetSubs.map(async (sub) => {
        try {
          if (!sub.copierAccountLogin) return sub;
          const [mt5Acc, positions] = await Promise.all([
            mt5Client.getAccount(sub.copierAccountLogin).catch(() => null),
            mt5Client.getPositions(sub.copierAccountLogin).catch(() => []),
          ]);

          if (mt5Acc) {
            const floating = positions.reduce((sum: number, p: any) => sum + (parseFloat(p.Profit) || 0), 0);
            const liveEquity = mt5Acc.equity;
            const diff = liveEquity - (sub.allocatedAmount || 1000);
            return {
              ...sub,
              currentEquity: liveEquity > 0 ? liveEquity : sub.currentEquity,
              unrealizedPnL: parseFloat(floating.toFixed(2)),
              realizedPnL: diff > floating ? parseFloat((diff - floating).toFixed(2)) : sub.realizedPnL,
            };
          }
          return sub;
        } catch {
          return sub;
        }
      })
    );

    return NextResponse.json({
      success: true,
      subscriptions: enrichedSubs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId,
      masterId,
      masterName,
      masterAvatar,
      copierAccountLogin,
      allocatedAmount,
      copyMode,
      riskStopPercent,
    } = body;

    if (!clientId || !masterId || !copierAccountLogin || !allocatedAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters to copy trader' },
        { status: 400 }
      );
    }

    const newSub: CopySubscription = {
      id: `sub_${Date.now()}`,
      clientId,
      masterId,
      masterName: masterName || 'Master Strategy',
      masterAvatar,
      copierAccountLogin: parseInt(copierAccountLogin, 10),
      allocatedAmount: parseFloat(allocatedAmount),
      currentEquity: parseFloat(allocatedAmount),
      unrealizedPnL: 0,
      realizedPnL: 0,
      copyMode: copyMode || 'proportional',
      riskStopPercent: riskStopPercent ? parseFloat(riskStopPercent) : 20,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
    };

    const allSubs = await loadSubscriptionsFromStorage();
    const updatedSubs = [newSub, ...allSubs.filter(s => s.id !== newSub.id)];
    cachedSubscriptions = updatedSubs;
    await saveSubscriptionsToStorage(updatedSubs);

    return NextResponse.json({
      success: true,
      subscription: newSub,
      message: `Successfully connected to ${masterName}! Live trade copying is active.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start copying' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId, action } = body; // action: 'pause' | 'resume' | 'stop'

    const allSubs = await loadSubscriptionsFromStorage();
    const sub = allSubs.find(s => s.id === subscriptionId);
    if (!sub) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (action === 'pause') {
      sub.status = 'paused';
    } else if (action === 'resume') {
      sub.status = 'active';
    } else if (action === 'stop') {
      sub.status = 'stopped';
    }

    cachedSubscriptions = allSubs;
    await saveSubscriptionsToStorage(allSubs);

    return NextResponse.json({
      success: true,
      subscription: sub,
      message: `Subscription status updated to ${sub.status}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
