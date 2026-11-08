import nodemailer from 'nodemailer'

interface VerificationEmailParams {
  toEmail: string
  recipientName: string
  verificationToken: string
  verificationCode: string
  appUrl?: string
}

function getBaseUrl(appUrl?: string): string {
  if (appUrl && appUrl.startsWith('http')) {
    return appUrl.replace(/\/$/, '')
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.NEXTAUTH_URL) {
    const raw = process.env.NEXTAUTH_URL.replace(/\/$/, '')
    // Sanitize stale or mistyped vercel domain
    if (raw.includes('smart-discover-etplatform.vercel.app')) {
      return 'https://helloet.devvoltz.com'
    }
    return raw
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://helloet.devvoltz.com'
  }
  return 'http://localhost:3000'
}

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  const user = process.env.SMTP_USER || 'devvoltztech@gmail.com'
  const pass = process.env.SMTP_PASS

  if (!pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendVerificationEmail({
  toEmail,
  recipientName,
  verificationToken,
  verificationCode,
  appUrl,
}: VerificationEmailParams): Promise<{ success: boolean; simulated?: boolean; message?: string }> {
  const baseUrl = getBaseUrl(appUrl)
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(toEmail)}`
  const senderEmail = process.env.SMTP_USER || 'devvoltztech@gmail.com'
  const senderName = process.env.SMTP_FROM || `DevVoltz Technology <${senderEmail}>`

  console.log('------------------------------------------------------------')
  console.log('📧 [DevVoltz Technology] Verification Email Generated:')
  console.log(`   To: ${recipientName} <${toEmail}>`)
  console.log(`   Verification Code: ${verificationCode}`)
  console.log(`   Verification Link: ${verificationUrl}`)
  console.log('------------------------------------------------------------')

  const transporter = createTransporter()

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your HelloET Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #16A34A 0%, #15803D 100%); padding: 32px 30px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 10px; line-height: 44px; font-weight: bold; font-size: 24px; color: #ffffff; margin-bottom: 10px;">
                H
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                HelloET Platform
              </h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #DCFCE7; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                Powered by DevVoltz Technology
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 14px; font-size: 20px; font-weight: 700; color: #111827;">
                Verify your email address
              </h2>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #4b5563;">
                Hello <strong>${recipientName || 'there'}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4b5563;">
                Thank you for joining <strong>HelloET</strong>. To activate your account and verify that <strong>${toEmail}</strong> belongs to you, please click the button below:
              </p>

              <!-- Verification Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #16A34A; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.35);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Verification Code Alternative -->
              <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; font-weight: 500;">
                  Or enter this 6-digit verification code on the verification page:
                </p>
                <div style="font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #16A34A;">
                  ${verificationCode}
                </div>
              </div>

              <p style="margin: 20px 0 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                This link and verification code are valid for <strong>24 hours</strong>. If you did not create an account on HelloET, please disregard this email.
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
                  Button not working? Copy and paste this URL into your browser:<br>
                  <a href="${verificationUrl}" style="color: #16A34A; text-decoration: underline;">${verificationUrl}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 22px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #374151;">
                DevVoltz Technology
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Addis Ababa, Ethiopia • Support: <a href="mailto:devvoltztech@gmail.com" style="color: #16A34A; text-decoration: none;">devvoltztech@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  if (!transporter) {
    console.log(
      'ℹ️ [DevVoltz Technology] SMTP_PASS is not configured in .env. Verification email link simulated in console output above.'
    )
    return {
      success: true,
      simulated: true,
      message: 'SMTP credentials not provided in .env; verification details logged in server console.',
    }
  }

  try {
    await transporter.sendMail({
      from: senderName,
      to: toEmail,
      subject: 'Verify your HelloET account - DevVoltz Technology',
      html: htmlContent,
      text: `Hello ${recipientName},\n\nPlease verify your HelloET account by visiting:\n${verificationUrl}\n\nOr use verification code: ${verificationCode}\n\n- DevVoltz Technology`,
    })

    console.log(`✅ [DevVoltz Technology] Verification email sent successfully to ${toEmail}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ [DevVoltz Technology] Failed to send email via SMTP:', error.message)
    // Return simulated success so registration is not blocked for developers
    return {
      success: true,
      simulated: true,
      message: `SMTP error: ${error.message}. Verification link logged in console.`,
    }
  }
}
