import type { EmailType } from "modules/mail/mail.service";

interface Props {
  type: EmailType;
  name: string;
  otp: string;
  senderName: string;
}

export default function generateOtpText({ type, name, otp, senderName }: Props): string {
  const title = type === "verify" ? "Verify Your Email" : "Reset Your Password";
  const message =
    type === "verify" ? "Use the following OTP to verify your email." : "Use the following OTP to reset your password.";

  return `
      ${"=".repeat(60)}
      ${title}
      ${"=".repeat(60)}

      Hi ${name},

      ${message}

      ${"-".repeat(60)}
      YOUR OTP CODE
      ${"-".repeat(60)}

        ${otp}

      ${"-".repeat(60)}

      This OTP will expire in 10 minutes.

      If you did not request this, please ignore this email.

      ${"=".repeat(60)}
      This is an automated message from ${senderName}.
      Please do not reply to this email.
      ${"=".repeat(60)}
    `.trim();
}
