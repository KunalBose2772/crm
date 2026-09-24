import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    const { login } = await params;

    if (!login) {
      return NextResponse.json({ success: false, error: 'Login is required' }, { status: 400 });
    }

    const account = await mt5Client.getAccount(login);

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error: any) {
    console.error(`[API /api/mt5/accounts/${error}] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch account from MT5',
      },
      { status: 500 }
    );
  }
}
