import type { EmailType } from "modules/mail/mail.service";

interface Props {
  type: EmailType;
  name: string;
  otp: string;
  senderName: string;
}

const colors = {
  primary: "#141F2D",
  primaryDark: "#0D1622",
  primaryMuted: "#1E2C40",
  secondary: "#D97A3E",
  secondaryTint: "#F5D5BF",
  textPrimary: "#F5F7FB",
  textSecondary: "#C9D3E6"
} as const;

export default function generateOtpEmail({ type, name, otp, senderName }: Props): string {
  const title = type === "verify" ? "Verify Your Email" : "Reset Your Password";
  const message =
    type === "verify" ? "Use the following OTP to verify your email." : "Use the following OTP to reset your password.";

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${colors.primaryDark}; background-image: linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 60%, ${colors.primaryMuted} 100%); font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: ${colors.primary}; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 25px 60px rgba(8, 12, 20, 0.65); overflow: hidden;">
                <tr>
                  <td style="height: 6px; background: linear-gradient(90deg, ${colors.secondary} 0%, ${colors.secondaryTint} 100%);"></td>
                </tr>
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 48px 40px 24px 40px; background-image: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 60%);">
                    <p style="margin: 0 0 12px 0; color: ${colors.secondaryTint}; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase;">
                      Boose Vacation Health
                    </p>
                    <h1 style="margin: 0; color: ${colors.textPrimary}; font-size: 30px; font-weight: 600; line-height: 1.3;">
                      ${title}
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <p style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: 16px; line-height: 1.7;">
                      Hi ${name},
                    </p>
                    <p style="margin: 0 0 30px 0; color: ${colors.textSecondary}; font-size: 16px; line-height: 1.7;">
                      ${message}
                    </p>

                    <!-- OTP Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                      <tr>
                        <td align="center" style="padding: 0;">
                          <div style="display: inline-block; padding: 22px 48px; background-color: ${colors.secondary}; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 12px 30px rgba(217, 122, 62, 0.35);">
                            <div style="font-size: 34px; font-weight: 700; color: #FFFFFF; letter-spacing: 10px; font-family: 'Courier New', monospace; line-height: 1.2;">
                              ${otp}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 18px 0; color: ${colors.textPrimary}; font-size: 14px; line-height: 1.6; text-align: center;">
                      This OTP will expire in 10 minutes. Please do not share it with anyone.
                    </p>

                    <p style="margin: 0; color: ${colors.textSecondary}; font-size: 14px; line-height: 1.6; text-align: center;">
                      If you did not request this, simply ignore this message.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 24px; background-color: ${colors.primaryDark}; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="margin: 0; color: ${colors.textSecondary}; font-size: 12px; line-height: 1.5; text-align: center;">
                      This is an automated message from ${senderName}. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `.trim();
}
