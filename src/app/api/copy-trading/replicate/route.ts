import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { supabaseAdmin } from '@/lib/supabase';
import { validateOrigin } from '@/lib/security';
import { CopySubscription, MasterTrader } from '@/types/crm';

const BUCKET_NAME = 'system-config';
const SUBS_FILE = 'copy_trading_subscriptions.json';
const MASTERS_FILE = 'copy_trading_masters.json';
const REPLICATION_MAP_FILE = 'trade_replication_mappings.json';

interface MirroredPositionRecord {
  masterTicket: string;
  masterLogin: number;
  copierLogin: number;
  copierTicket: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  lots: number;
  openTime: string;
}

async function loadJsonFromStorage<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).download(fileName);
    if (!error && data) {
      const text = await data.text();
      return JSON.parse(text);
    }
  } catch (err: any) {
    console.warn(`[Replication] Failed to load ${fileName}:`, err?.message);
  }
  return fallback;
}

async function saveJsonToStorage<T>(fileName: string, content: T): Promise<void> {
  try {
    const buffer = Buffer.from(JSON.stringify(content, null, 2), 'utf-8');
    await supabaseAdmin.storage.from(BUCKET_NAME).upload(fileName, buffer, {
      contentType: 'application/json',
      upsert: true,
    });
  } catch (err: any) {
    console.warn(`[Replication] Failed to save ${fileName}:`, err?.message);
  }
}

/**
 * GET /api/copy-trading/replicate
 * Returns current replication telemetry and active mirrored positions
 */
export async function GET(req: NextRequest) {
  try {
    const mirroredPositions = await loadJsonFromStorage<MirroredPositionRecord[]>(REPLICATION_MAP_FILE, []);
    return NextResponse.json({
      success: true,
      activeMirrors: mirroredPositions.length,
      mirroredPositions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/copy-trading/replicate
 * Executes a full scan cycle of Master positions and mirrors them proportionally to Copiers
 */
export async function POST(req: NextRequest) {
  try {
    const [allSubs, allMasters, existingMirrors] = await Promise.all([
      loadJsonFromStorage<CopySubscription[]>(SUBS_FILE, []),
      loadJsonFromStorage<MasterTrader[]>(MASTERS_FILE, []),
      loadJsonFromStorage<MirroredPositionRecord[]>(REPLICATION_MAP_FILE, []),
    ]);

    const activeSubs = allSubs.filter(s => s.status === 'active');
    if (activeSubs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active copy subscriptions currently configured.',
        replicatedCount: 0,
        closedCount: 0,
      });
    }

    const masterMap = new Map<string, MasterTrader>();
    allMasters.forEach(m => masterMap.set(m.id, m));

    let updatedMirrors = [...existingMirrors];
    const actionsTaken: string[] = [];
    let replicatedCount = 0;
    let closedCount = 0;

    // 1. Group active subscriptions by masterId
    const subsByMaster = new Map<string, CopySubscription[]>();
    for (const sub of activeSubs) {
      const list = subsByMaster.get(sub.masterId) || [];
      list.push(sub);
      subsByMaster.set(sub.masterId, list);
    }

    // 2. Process each Master with active copiers
    for (const [masterId, copiers] of subsByMaster.entries()) {
      const master = masterMap.get(masterId);
      if (!master || !master.login) continue;

      // Query Master live positions from MT5
      const [masterAcc, masterPositions] = await Promise.all([
        mt5Client.getAccount(master.login).catch(() => null),
        mt5Client.getPositions(master.login).catch(() => []),
      ]);

      const masterEquity = masterAcc?.equity || master.equity || 10000;
      const currentMasterTickets = new Set(
        masterPositions.map((p: any) => String(p.Position || p.ExpertPositionID || ''))
      );

      // A. Check for Positions Closed by Master -> Close mirrored positions on copiers
      const openMirrorsForMaster = updatedMirrors.filter(m => m.masterLogin === Number(master.login));
      for (const mirror of openMirrorsForMaster) {
        if (!currentMasterTickets.has(mirror.masterTicket)) {
          // Master closed this position! Close on copier
          try {
            await mt5Client.positionClose({
              login: mirror.copierLogin,
              ticket: mirror.copierTicket,
              symbol: mirror.symbol,
              volume: mirror.lots,
              action: mirror.action,
            });
            actionsTaken.push(`Closed mirrored #${mirror.copierTicket} on Copier #${mirror.copierLogin} (Master closed #${mirror.masterTicket})`);
            closedCount++;
          } catch (closeErr: any) {
            console.warn(`[Replication] Failed to close copier ticket #${mirror.copierTicket}:`, closeErr?.message);
          }
          // Remove from active mirrors
          updatedMirrors = updatedMirrors.filter(
            m => !(m.masterTicket === mirror.masterTicket && m.copierLogin === mirror.copierLogin)
          );
        }
      }

      // B. Check for New Positions Opened by Master -> Mirror to copiers
      for (const pos of masterPositions) {
        const masterTicket = String(pos.Position || pos.ExpertPositionID || '');
        if (!masterTicket) continue;

        const rawAction = String(pos.Action || '0');
        const posType: 'BUY' | 'SELL' = rawAction === '1' ? 'SELL' : 'BUY';
        const symbol = String(pos.Symbol || 'FOREX');
        const masterVolUnits = parseFloat(pos.Volume || '100');
        const masterLots = parseFloat((masterVolUnits / 100).toFixed(2)) || 0.01;
        const openPrice = parseFloat(pos.PriceOpen || '0');
        const sl = parseFloat(pos.PriceSL || '0');
        const tp = parseFloat(pos.PriceTP || '0');

        for (const copierSub of copiers) {
          if (!copierSub.copierAccountLogin) continue;

          // Check if this position is already mirrored to this copier
          const alreadyMirrored = updatedMirrors.some(
            m => m.masterTicket === masterTicket && m.copierLogin === Number(copierSub.copierAccountLogin)
          );
          if (alreadyMirrored) continue;

          // Calculate Proportional Lot Sizing
          // Copier Lot = Master Lot * (Copier Allocated Capital / Master Equity)
          const ratio = (copierSub.allocatedAmount || 1000) / (masterEquity || 10000);
          const scaledLots = Math.max(0.01, parseFloat((masterLots * ratio).toFixed(2)));

          try {
            const openRes = await mt5Client.orderOpen({
              login: copierSub.copierAccountLogin,
              symbol,
              action: posType,
              volume: scaledLots,
              price: openPrice > 0 ? openPrice : undefined,
              sl: sl > 0 ? sl : undefined,
              tp: tp > 0 ? tp : undefined,
              comment: `Copy ${master.name.slice(0, 15)} #${masterTicket}`,
            });

            if (openRes.ticket) {
              updatedMirrors.push({
                masterTicket,
                masterLogin: Number(master.login),
                copierLogin: Number(copierSub.copierAccountLogin),
                copierTicket: openRes.ticket,
                symbol,
                action: posType,
                lots: scaledLots,
                openTime: new Date().toISOString(),
              });
              actionsTaken.push(`Mirrored ${posType} ${scaledLots} lots ${symbol} to Copier #${copierSub.copierAccountLogin} (Ticket #${openRes.ticket})`);
              replicatedCount++;
            }
          } catch (openErr: any) {
            console.warn(`[Replication] Failed to open mirror on copier #${copierSub.copierAccountLogin}:`, openErr?.message);
          }
        }
      }
    }

    // Save updated mirror mappings if changes occurred
    if (replicatedCount > 0 || closedCount > 0) {
      await saveJsonToStorage(REPLICATION_MAP_FILE, updatedMirrors);
    }

    return NextResponse.json({
      success: true,
      replicatedCount,
      closedCount,
      activeMirrors: updatedMirrors.length,
      actionsTaken,
    });
  } catch (error: any) {
    console.error('[API /api/copy-trading/replicate] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
