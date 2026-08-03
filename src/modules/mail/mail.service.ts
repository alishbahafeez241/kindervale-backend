import { BrevoClient } from "@getbrevo/brevo";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import generateOtpEmail from "templates/otpEmail";
import generateOtpText from "templates/otpText";

export type EmailType = "reset" | "verify";

export interface EmailTemplate {
  title: string;
  message: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private client?: BrevoClient;
  private senderEmail = "";
  private senderName = "Kindervale";

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("BREVO_API_KEY");
    const senderEmail = this.configService.get<string>("BREVO_SENDER_EMAIL");
    const senderName = this.configService.get<string>("BREVO_SENDER_NAME");

    if (!apiKey || !senderEmail || !senderName) {
      this.logger.warn("Brevo email config is missing; email sending is disabled for this environment");
      return;
    }

    this.client = new BrevoClient({ apiKey });
    this.senderEmail = senderEmail;
    this.senderName = senderName;
  }

  private async sendEmail(to: string, subject: string, textContent: string, htmlContent: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`Skipped email to ${to}: Brevo email config is missing`);
      return;
    }

    try {
      await this.client.transactionalEmails.sendTransacEmail({
        sender: {
          email: this.senderEmail,
          name: this.senderName
        },
        to: [{ email: to }],
        subject,
        textContent,
        htmlContent
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error("Error sending email:", {
        error: errorMessage,
        recipient: to,
        subject: subject
      });

      const err = new Error(`Failed to send email: ${errorMessage}`);
      Object.assign(err, { cause: error });
      throw err;
    }
  }

  async sendVerificationEmail(to: string, name: string, otp: string): Promise<void> {
    const textContent = generateOtpText({ type: "verify", name, otp, senderName: this.senderName });
    const htmlContent = generateOtpEmail({ type: "verify", name, otp, senderName: this.senderName });

    await this.sendEmail(to, "Verify Your Email", textContent, htmlContent);
  }

  async sendResetEmail(to: string, name: string, otp: string): Promise<void> {
    const textContent = generateOtpText({ type: "reset", name, otp, senderName: this.senderName });
    const htmlContent = generateOtpEmail({ type: "reset", name, otp, senderName: this.senderName });

    await this.sendEmail(to, "Reset Your Password", textContent, htmlContent);
  }
}
