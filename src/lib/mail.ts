import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const secure = process.env.SMTP_SECURE === 'true' || port === 465;
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const fromName = process.env.SMTP_FROM_NAME || 'ND1 CRM';
const fromEmail = process.env.SMTP_FROM_EMAIL || '';
const BRAND_NAME = 'ND1';

export const mailTransporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 1,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 2, // Limit to 2 messages per second to stay well within Hostinger limits
  host,
  port,
  secure, // true for 465, false for 587
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendMailOptions) {
  try {
    const info = await mailTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[Mail Service] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Base email layout for consistent branding & responsive delivery
 */
function createBaseEmail(headerTitle: string, contentHtml: string, actionButton?: { text: string; url: string }) {
  const buttonHtml = actionButton
    ? `
      <div style="margin: 28px 0; text-align: center;">
        <a href="${actionButton.url}" target="_blank" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
          ${actionButton.text}
        </a>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background-color: #f1f5f9; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${BRAND_NAME} <span style="color: #38bdf8;">MARKETS</span></h1>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; background: rgba(255, 255, 255, 0.1); padding: 4px 10px; border-radius: 20px;">Institutional CRM</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 700;">${headerTitle}</h2>
              ${contentHtml}
              ${buttonHtml}
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
                This is an automated communication from ${BRAND_NAME} Trading System. If you did not make this request or have questions, please reach out to our institutional support desk immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ${BRAND_NAME} Markets. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Complete set of all 22 System Email Templates
 */
export const emailTemplates = {
  // 1. Register user verification mail
  registerVerification: (name: string, verifyUrl: string, brandName = BRAND_NAME) => ({
    subject: `Verify your email & activate your ${brandName} account`,
    html: createBaseEmail(
      `Welcome to ${brandName}!`,
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Please verify your email to start trading with us. Click below to confirm your account.</p>
      `,
      { text: 'Verify Email & Activate Account', url: verifyUrl }
    ),
  }),

  // 2. After verify login credentials send to user
  afterVerifyCredentials: (name: string, email: string, tempPass: string, loginUrl: string, brandName = BRAND_NAME) => ({
    subject: `Your ${brandName} login credentials`,
    html: createBaseEmail(
      'Your account is ready',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Use the credentials below to log in and start exploring your dashboard.</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Email / User:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Password:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-size: 15px; font-weight: bold;">${tempPass}</td>
            </tr>
          </table>
        </div>
      `,
      { text: 'Login to Portal', url: loginUrl }
    ),
  }),

  // 3. When client login that time for login alert mail
  loginAlert: (name: string, ip: string, device: string, time: string, brandName = BRAND_NAME) => ({
    subject: `Login Alert – ${brandName}`,
    html: createBaseEmail(
      'We noticed a login to your account',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">We noticed a new login to your ${brandName} account with the following details:</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">IP Address:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${ip}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Device / Browser:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${device}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Timestamp:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${time}</td>
            </tr>
          </table>
        </div>
        <p style="color: #ef4444; font-size: 14px; font-weight: 600;">If this was not you, secure your account immediately.</p>
      `
    ),
  }),

  // 4. Open live account mail
  openLiveAccount: (name: string, accountId: string | number, server: string, mainPassword?: string, brandName = BRAND_NAME) => ({
    subject: 'Live trading account opened successfully',
    html: createBaseEmail(
      'Your live account is ready',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Start trading with Account ID: <strong>${accountId}</strong>.</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Platform Server:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${server}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Account Login:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${accountId}</td>
            </tr>
            ${mainPassword ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Master Password:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace; font-size: 14px;">${mainPassword}</td>
            </tr>
            ` : ''}
          </table>
        </div>
      `
    ),
  }),

  // 5. KYC upload mail
  kycUpload: (name: string, documentType: string) => ({
    subject: 'KYC submission received',
    html: createBaseEmail(
      'Documents under review',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your <strong>${documentType}</strong> documents have been received. We’ll notify you once our compliance team approves them.</p>
      `
    ),
  }),

  // Admin notification for KYC review
  adminKycNotification: (clientName: string, clientEmail: string, documentType: string, docNumber: string, frontUrl: string, backUrl?: string, downloadUrl?: string) => ({
    subject: `[KYC Submission] Action Required: ${clientName} (${documentType})`,
    html: createBaseEmail(
      'New KYC Document Submitted',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">A trader has submitted their identity verification documents for review:</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Client Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Client Email:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${clientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Document Type:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${documentType}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Document Number:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-family: monospace;">${docNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Front Document:</td>
              <td style="padding: 6px 0; font-size: 14px;"><a href="${frontUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">View Front Scan</a></td>
            </tr>
            ${backUrl ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Back Document:</td>
              <td style="padding: 6px 0; font-size: 14px;"><a href="${backUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">View Back Scan</a></td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${downloadUrl ? `
        <div style="margin: 22px 0 10px 0; text-align: center;">
          <a href="${downloadUrl}" target="_blank" style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; text-decoration: none; display: inline-block;">
            📥 Download Complete Document Dossier (Single Page PDF)
          </a>
        </div>
        ` : ''}
      `,
      { text: 'Review in Admin Panel', url: 'http://localhost:3000/admin/kyc-verification' }
    ),
  }),

  // 6. Once admin approve kyc then email
  kycApproved: (name: string, comment?: string) => ({
    subject: 'Your KYC is approved 🎉',
    html: createBaseEmail(
      'Verification successful',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Congratulations! Your identity documents have been verified. You now have full access to deposits, live trading accounts, and withdrawals.</p>
        ${comment ? `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
          <p style="color: #166534; font-size: 13px; font-weight: bold; margin: 0 0 4px 0;">Compliance Note:</p>
          <p style="color: #15803d; font-size: 14px; margin: 0; line-height: 1.5;">${comment}</p>
        </div>
        ` : ''}
      `
    ),
  }),

  // 7. Deposit request submit mail
  depositRequestSubmitted: (name: string, amount: number | string, currency = 'USD', method = 'Crypto / Gateway') => ({
    subject: 'Deposit request received',
    html: createBaseEmail(
      'We got your request',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">We have received your deposit request of <strong>${amount} ${currency}</strong> via ${method}. We’ll process your deposit and notify you when approved.</p>
      `
    ),
  }),

  // 8. Admin approve deposit at that time mail
  depositApproved: (name: string, amount: number | string, currency = 'USD') => ({
    subject: `Deposit approved – ${amount} ${currency} added`,
    html: createBaseEmail(
      'Funds credited',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your deposit of <strong>${amount} ${currency}</strong> has been approved. Your wallet balance is updated. Happy trading!</p>
      `
    ),
  }),

  // 9. OTP for submit withdrawal
  otpWithdrawal: (name: string, otpCode: string, otpExpiry = '10 minutes') => ({
    subject: 'Confirm withdrawal with OTP',
    html: createBaseEmail(
      'Secure your withdrawal',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Enter OTP <strong>${otpCode}</strong> (valid ${otpExpiry}).</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 28px; border-radius: 8px; border: 2px dashed #93c5fd; font-family: monospace;">
            ${otpCode}
          </span>
        </div>
      `
    ),
  }),

  // 10. Withdrawal request submit mail
  withdrawalRequestSubmitted: (name: string, amount: number | string, currency = 'USD') => ({
    subject: 'Withdrawal request received',
    html: createBaseEmail(
      'We’re processing your withdrawal',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">We have received your withdrawal request for <strong>${amount} ${currency}</strong>. Funds will be released once approved.</p>
      `
    ),
  }),

  // 11. Admin approve withdrawal at that time mail
  withdrawalApproved: (name: string, amount: number | string, currency = 'USD') => ({
    subject: `Withdrawal approved – ${amount} ${currency}`,
    html: createBaseEmail(
      'Funds released',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your withdrawal of <strong>${amount} ${currency}</strong> is successfully processed.</p>
      `
    ),
  }),

  // 12. IB commission withdrawal mail and otp same as withdrawal
  ibCommissionWithdrawal: (name: string, amount: number | string, currency = 'USD') => ({
    subject: 'IB commission withdrawal request',
    html: createBaseEmail(
      'Commission withdrawal submitted',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your IB commission withdrawal request for <strong>${amount} ${currency}</strong> has been received. Use OTP to confirm and track status in your dashboard.</p>
      `
    ),
  }),

  // 13. When client register in our referral link or referral code then mail
  referralRegistration: (parentName: string, childName: string) => ({
    subject: 'New referral joined via your link',
    html: createBaseEmail(
      'Congrats!',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${parentName}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;"><strong>${childName}</strong> joined under your referral code.</p>
      `
    ),
  }),

  // 14. When user open trade email
  tradeOpen: (name: string, tradeSymbol: string, tradeSide: 'BUY' | 'SELL' | string, tradeVolume: number | string, price: number | string) => ({
    subject: `Trade opened: ${tradeSymbol}`,
    html: createBaseEmail(
      'New trade placed',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">${tradeSide} ${tradeVolume} lots at ${price}.</p>
      `
    ),
  }),

  // 15. When user close trade email
  tradeClose: (name: string, tradeSymbol: string, orderId: string | number, amount: number | string, currency = 'USD') => ({
    subject: `Trade closed: ${tradeSymbol}`,
    html: createBaseEmail(
      'Your trade has closed',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Order ${orderId} closed with ${amount} ${currency} P/L.</p>
      `
    ),
  }),

  // 16. Trade summary mail for last 24hrs activities
  dailyTradeSummary: (name: string, tradesCount: number | string, amount: number | string, currency = 'USD') => ({
    subject: 'Your 24h trading summary',
    html: createBaseEmail(
      'Summary of your trading activity',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Trades: ${tradesCount}, Net P/L: ${amount} ${currency}.</p>
      `
    ),
  }),

  // 17. Password reset / Forgot password mail
  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset your password',
    html: createBaseEmail(
      'Password reset requested',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Click the button below to reset your password.</p>
      `,
      { text: 'Reset Password', url: resetUrl }
    ),
  }),

  // 18. Password changed successfully mail
  passwordChanged: (name: string) => ({
    subject: 'Your password has been changed',
    html: createBaseEmail(
      'Password updated',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your portal account password has been changed successfully. If this wasn’t you, secure your account immediately.</p>
      `
    ),
  }),

  // 18b. MT5 Trading/Investor password changed mail
  mt5PasswordChanged: (name: string, login: number | string, type: 'main' | 'investor', brandName = BRAND_NAME) => ({
    subject: `Security Alert: MT5 ${type === 'investor' ? 'Investor (Read-Only)' : 'Master Trading'} Password Changed for Account #${login}`,
    html: createBaseEmail(
      `MT5 Password Updated`,
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">The <strong>${type === 'investor' ? 'Investor (Read-Only)' : 'Master Trading'}</strong> password for your MetaTrader 5 account has been updated successfully.</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">MT5 Account Login:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px; font-family: monospace;">#${login}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Password Type:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${type === 'investor' ? 'Investor (Read-Only)' : 'Master Trading (Execution)'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Timestamp:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${new Date().toUTCString()}</td>
            </tr>
          </table>
        </div>
        <p style="color: #ef4444; font-size: 14px; font-weight: 600;">If you did not authorize this change, please contact support or reset your credentials immediately.</p>
      `
    ),
  }),

  // 19. Email / phone number updated mail
  emailPhoneUpdated: (name: string) => ({
    subject: 'Profile updated successfully',
    html: createBaseEmail(
      'Contact details updated',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">We’ve updated your profile information.</p>
      `
    ),
  }),

  // 20. Deposit failed / declined mail
  depositDeclined: (name: string, amount: number | string, currency = 'USD', reason = 'Verification failure or bank decline') => ({
    subject: `Deposit declined – ${amount} ${currency}`,
    html: createBaseEmail(
      'Deposit unsuccessful',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your deposit of ${amount} ${currency} could not be processed.</p>
        <p style="color: #ef4444; font-size: 14px; font-weight: 600;">Reason: ${reason}.</p>
      `
    ),
  }),

  // 21. Withdrawal rejected mail (with reason)
  withdrawalRejected: (name: string, reason = 'Compliance check or insufficient free margin') => ({
    subject: 'Withdrawal request declined',
    html: createBaseEmail(
      'Withdrawal unsuccessful',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your withdrawal request was declined.</p>
        <p style="color: #ef4444; font-size: 14px; font-weight: 600;">Reason: ${reason}.</p>
      `
    ),
  }),

  // 22. Monthly account statement / wallet statement mail
  monthlyStatement: (name: string, statementPeriod: string, downloadUrl: string) => ({
    subject: `Your monthly statement (${statementPeriod})`,
    html: createBaseEmail(
      'Monthly report ready',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Click below to view and download your detailed statement.</p>
      `,
      { text: 'View & Download Statement', url: downloadUrl }
    ),
  }),

  // Admin notification when a trading account is opened
  adminAccountOpenedNotification: (clientName: string, clientEmail: string, login: number | string, accountType: string, server: string, leverage: string) => ({
    subject: `[New Account] Live MT5 Account #${login} Created for ${clientName}`,
    html: createBaseEmail(
      'New Live Trading Account Created',
      `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">A live trading account has been provisioned on the MetaTrader 5 server:</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Client Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Client Email:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${clientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Account Login:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px; font-family: monospace;">#${login}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Account Tier / Type:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${accountType}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Platform Server:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${server}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Leverage:</td>
              <td style="padding: 6px 0; color: #0f172a; font-size: 14px;">${leverage}</td>
            </tr>
          </table>
        </div>
        <p style="color: #64748b; font-size: 13px;"><em>Note: Passwords are not sent to admin for security compliance. Live credentials and balances are viewable directly within the broker admin desk.</em></p>
      `,
      { text: 'View Accounts in Admin Desk', url: 'http://localhost:3000/admin/account-types' }
    ),
  }),

  // Backward compatibility alias for earlier helper calls
  welcomeAccountCreated: (name: string, login: number, pass: string, server: string) =>
    emailTemplates.openLiveAccount(name, login, server, pass),

  transactionReceipt: (name: string, type: 'Deposit' | 'Withdrawal', amount: number, currency: string, ticketOrRef: string) =>
    type === 'Deposit'
      ? emailTemplates.depositApproved(name, amount, currency)
      : emailTemplates.withdrawalApproved(name, amount, currency),
};
