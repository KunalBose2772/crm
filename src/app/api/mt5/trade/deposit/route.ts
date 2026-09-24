import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, amount, comment = 'CRM Deposit' } = body;

    if (!login || !amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid login and positive amount are required' },
        { status: 400 }
      );
    }

    const result = await mt5Client.balanceOperation(login, amount, comment);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/mt5/trade/deposit] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to deposit balance to MT5 account',
      },
      { status: 500 }
    );
  }
}
