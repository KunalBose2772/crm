import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { MT5_ACCOUNT_MAPPING, MT5AccountType } from '@/config/mt5';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      clientName = 'CRM Client', 
      email = '', 
      accountType = 'STANDARD', 
      leverage = '1:300',
      password,
      investorPassword 
    } = body;

    const mapping = MT5_ACCOUNT_MAPPING[accountType as 'BASIC' | 'STANDARD' | 'VVIP'] || MT5_ACCOUNT_MAPPING.STANDARD;

    const createdAccount = await mt5Client.createAccount({
      name: clientName,
      email: email || `${clientName.toLowerCase().replace(/\s+/g, '')}@testcrm.co.in`,
      group: mapping.group,
      leverage: leverage || mapping.defaultLeverage,
      mainPassword: password,
      investorPassword: investorPassword,
    });

    return NextResponse.json({
      success: true,
      account: {
        ...createdAccount,
        accountType: mapping.id,
        tag: mapping.tag,
        server: mapping.server,
      },
    });
  } catch (error: any) {
    console.error('[API /api/mt5/accounts/create] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create trading account on MT5',
      },
      { status: 500 }
    );
  }
}
