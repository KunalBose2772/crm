import { NextRequest, NextResponse } from 'next/server';
import { mt5Client } from '@/services/mt5/mt5Client';
import { MT5_ACCOUNT_MAPPING } from '@/config/mt5';
import { getAccountGroups } from '@/app/api/mt5/groups/route';
import { validateOrigin, checkRateLimit, getClientIP, sanitizeString } from '@/lib/security';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, emailTemplates } from '@/lib/mail';
import { getBrokerSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    // 1. Origin verification to prevent CSRF
    if (!validateOrigin(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized request origin' },
        { status: 403 }
      );
    }

    // 2. Rate limiting (max 10 account creations per minute per IP)
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`${clientIP}:create_account`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Input parsing and sanitization
    const body = await req.json();
    const rawName = sanitizeString(body.clientName || 'CRM Client', 50);
    const rawEmail = sanitizeString(body.email || '', 100);
    const accountType = (body.accountType || 'STANDARD').toUpperCase();
    const rawLeverage = sanitizeString(body.leverage || '1:300', 10);

    // Dynamic account group resolution from admin settings
    const activeGroups = await getAccountGroups();
    const mapping = activeGroups[accountType] || activeGroups['STANDARD'] || MT5_ACCOUNT_MAPPING.STANDARD;

    const createdAccount = await mt5Client.createAccount({
      name: rawName,
      email: rawEmail || `${rawName.toLowerCase().replace(/\s+/g, '')}@testcrm.co.in`,
      group: mapping.group,
      leverage: rawLeverage || mapping.defaultLeverage,
    });

    // 4. Persist to live Supabase PostgreSQL database & storage
    try {
      const clientEmail = rawEmail || `${rawName.toLowerCase().replace(/\s+/g, '')}@testcrm.co.in`;
      let clientId = body.clientId;

      // Check if client already exists by email or provided clientId
      if (!clientId && clientEmail) {
        const { data: existingClient } = await supabaseAdmin
          .from('clients')
          .select('id')
          .ilike('email', clientEmail)
          .maybeSingle();

        if (existingClient?.id) {
          clientId = existingClient.id;
        }
      }

      if (!clientId) {
        clientId = `cli_${Date.now()}`;
      }

      // Upsert client
      await supabaseAdmin.from('clients').upsert({
        id: clientId,
        name: rawName,
        email: clientEmail,
        status: 'activated',
        email_verified: true,
        kyc_verified: false,
      }, { onConflict: 'email' });

      // Insert trading account
      const accountId = `acc_${createdAccount.login}`;
      await supabaseAdmin.from('trading_accounts').upsert({
        id: accountId,
        client_id: clientId,
        login: createdAccount.login,
        account_type: mapping.id,
        mt5_group: mapping.group,
        server: mapping.server,
        currency: 'USD',
        leverage: rawLeverage || mapping.defaultLeverage,
        balance: 0.00,
        equity: 0.00,
        status: 'active',
      });
    } catch (dbErr: any) {
      console.error('[API /api/mt5/accounts/create] Supabase Persistence Warning:', dbErr.message);
    }

    const loginNumber = parseInt(String(createdAccount.login), 10) || 0;
    const accountLeverage = rawLeverage || mapping.defaultLeverage;

    // 5. Send automated confirmation email to CLIENT with credentials
    if (rawEmail) {
      sendEmail({
        to: rawEmail,
        ...emailTemplates.welcomeAccountCreated(
          rawName,
          loginNumber,
          createdAccount.mainPassword || 'Provided in dashboard',
          mapping.server
        ),
      }).catch(err => console.warn('[API /api/mt5/accounts/create] Client welcome mail warning:', err.message));
    }

    // 6. Send notification email to ADMIN WITHOUT password
    const brokerSettings = await getBrokerSettings();
    if (brokerSettings.adminNotificationEmail) {
      sendEmail({
        to: brokerSettings.adminNotificationEmail,
        ...emailTemplates.adminAccountOpenedNotification(
          rawName,
          rawEmail || 'client@tradingdesk.com',
          loginNumber,
          mapping.id,
          mapping.server,
          accountLeverage
        ),
      }).catch(err => console.warn('[API /api/mt5/accounts/create] Admin notification mail warning:', err.message));
    }

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
    console.error('[API /api/mt5/accounts/create] Security Handled Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to provision account at this time. Please try again shortly.',
      },
      { status: 500 }
    );
  }
}
