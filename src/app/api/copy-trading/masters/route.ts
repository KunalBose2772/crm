import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_MASTER_TRADERS } from '@/data/mockCopyTrading';
import { MasterTrader } from '@/types/crm';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = 'system-config';
const MASTERS_FILE = 'copy_trading_masters.json';

// In-memory cache for ultra-fast response
let cachedMasters: MasterTrader[] = [...INITIAL_MASTER_TRADERS];

async function loadMastersFromStorage(): Promise<MasterTrader[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(MASTERS_FILE);

    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedMasters = parsed;
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn('[API /api/copy-trading/masters] Supabase load warning:', err.message);
  }
  return cachedMasters;
}

async function saveMastersToStorage(mastersList: MasterTrader[]) {
  try {
    const buffer = Buffer.from(JSON.stringify(mastersList, null, 2), 'utf-8');
    await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(MASTERS_FILE, buffer, {
        contentType: 'application/json',
        upsert: true,
      });
  } catch (err: any) {
    console.warn('[API /api/copy-trading/masters] Supabase save warning:', err.message);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const sortBy = searchParams.get('sortBy') || 'overallGain';
    const risk = searchParams.get('risk');

    const allMasters = await loadMastersFromStorage();

    let filtered = allMasters.filter(m => {
      if (search && !m.name.toLowerCase().includes(search) && !m.strategyName.toLowerCase().includes(search)) {
        return false;
      }
      if (risk && risk !== 'all' && m.riskScore !== parseInt(risk, 10)) {
        return false;
      }
      return true;
    });

    if (sortBy === 'overallGain') {
      filtered.sort((a, b) => b.overallGain - a.overallGain);
    } else if (sortBy === 'copiers') {
      filtered.sort((a, b) => b.totalCopiers - a.totalCopiers);
    } else if (sortBy === 'winRate') {
      filtered.sort((a, b) => b.winRate - a.winRate);
    } else if (sortBy === 'riskScore') {
      filtered.sort((a, b) => a.riskScore - b.riskScore);
    }

    return NextResponse.json({
      success: true,
      masters: filtered,
      total: filtered.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch master traders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, login, strategyName, description, totalProfitShare, minInvestment, riskScore } = body;

    if (!name || !login || !strategyName) {
      return NextResponse.json(
        { success: false, error: 'Name, MT5 Login, and Strategy Name are required' },
        { status: 400 }
      );
    }

    const newMaster: MasterTrader = {
      id: `master_${login}`,
      name,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      country: 'Global',
      countryCode: 'UN',
      verified: true,
      login: parseInt(login, 10),
      strategyName,
      description: description || 'Professional algorithmic trading strategy on MT5.',
      joinedDate: new Date().toISOString().split('T')[0],
      totalCopiers: 1,
      activeCopiers: 1,
      totalProfitShare: totalProfitShare ? parseFloat(totalProfitShare) : 20,
      minInvestment: minInvestment ? parseFloat(minInvestment) : 50,
      riskScore: riskScore ? parseInt(riskScore, 10) : 2,
      overallGain: 18.5,
      gain3m: 18.5,
      gain6m: 18.5,
      gain1y: 18.5,
      floatingProfit: 120.0,
      equity: 5000.0,
      balance: 4880.0,
      winRate: 80.0,
      maxDrawdown: 5.2,
      profitFactor: 2.6,
      totalTrades: 35,
      avgHoldingTime: '4 hours',
      sparklineData: [100, 104, 108, 112, 115, 118.5],
      favoritePairs: [{ symbol: 'XAUUSD', percentage: 70 }, { symbol: 'EURUSD', percentage: 30 }],
    };

    const allMasters = await loadMastersFromStorage();
    const updatedMasters = [newMaster, ...allMasters.filter(m => m.id !== newMaster.id)];
    cachedMasters = updatedMasters;
    await saveMastersToStorage(updatedMasters);

    return NextResponse.json({
      success: true,
      master: newMaster,
      message: 'Master Trader registered successfully and published to Supabase!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register master trader' },
      { status: 500 }
    );
  }
}
