import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resendApiKey: string;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    this.resendApiKey =
      this.configService.get<string>("RESEND_API_KEY") ||
      process.env.RESEND_API_KEY ||
      "";

    // Use Resend's shared testing domain until you verify your own domain.
    // Once you verify a domain in Resend, switch this to e.g. "noreply@yourdomain.com"
    this.fromAddress =
      this.configService.get<string>("MAIL_FROM") ||
      process.env.MAIL_FROM ||
      "Ugrachandi Food Delivery <onboarding@resend.dev>";

    if (!this.resendApiKey) {
      this.logger.warn(
        "RESEND_API_KEY is not set — email sending will fail until it's configured in .env"
      );
    }
  }

  private isMailerDisabled(): boolean {
    return (
      this.configService.get<string>("MAILER_DISABLED") === "true" ||
      process.env.MAILER_DISABLED === "true"
    );
  }

  private async sendViaResend(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Resend API error (${response.status}): ${errorBody}`
      );
    }
  }

  async sendOtp(toEmail: string, otp: string): Promise<void> {
    if (this.isMailerDisabled()) {
      this.logger.warn(
        `MAILER_DISABLED is set — skipping sendOtp to ${toEmail}, OTP code=${otp}`
      );
      return;
    }

    const subject = "Your Verification Code - Ugrachandi";
    const text = `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.\nIf you did not request this, please ignore this email.`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6347; margin: 0; font-size: 26px; font-weight: 700;">Ugrachandi Food Delivery</h2>
          <p style="color: #666; font-size: 14px; margin-top: 4px;">Account Verification</p>
        </div>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <p style="color: #333333; font-size: 15px; margin: 0 0 12px 0;">Use the following 6-digit code to complete your verification:</p>
          <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ff6347; background: #ffffff; padding: 12px 24px; border-radius: 8px; border: 2px dashed #ff6347;">
            ${otp}
          </div>
          <p style="color: #888888; font-size: 13px; margin: 12px 0 0 0;">⏱ Valid for <b>5 minutes</b>.</p>
        </div>

        <p style="color: #666; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
          If you did not request this verification code, someone may have entered your email address by mistake. You can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />

        <div style="text-align: center; color: #999999; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Ugrachandi Food Delivery. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      this.logger.log(`Sending OTP email to ${toEmail}...`);
      await this.sendViaResend({ to: toEmail, subject, html, text });
      this.logger.log(`OTP successfully sent to ${toEmail}`);
    } catch (err: any) {
      this.logger.error(`Failed to send OTP to ${toEmail}: ${err?.message || err}`, err?.stack);
      throw err;
    }
  }

  async sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
    if (this.isMailerDisabled()) {
      this.logger.warn(`MAILER_DISABLED is set — skipping welcome email to ${toEmail}`);
      return;
    }

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff6347; margin: 0; font-size: 26px; font-weight: 700;">Welcome to Ugrachandi!</h2>
        </div>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          Dear <b>${name}</b>,<br><br>
          Thank you for registering with us! Your account has been successfully verified.<br><br>
          Your login ID is <b>${toEmail}</b>.<br><br>
          You are now ready to order your favorite dishes from top restaurants.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="http://localhost:5173" style="background-color: #ff6347; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Start Ordering Now
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #999999; font-size: 12px; text-align: center;">
          Need help? Contact support at <a href="mailto:support@ugrachandi.com" style="color: #ff6347;">support@ugrachandi.com</a>.
        </p>
      </div>
    `;

    try {
      this.logger.log(`Sending welcome email to ${toEmail}...`);
      await this.sendViaResend({
        to: toEmail,
        subject: "Welcome to Ugrachandi Food Delivery!",
        html,
      });
      this.logger.log(`Welcome email successfully sent to ${toEmail}`);
    } catch (err: any) {
      this.logger.error(`Failed to send welcome email to ${toEmail}: ${err?.message || err}`);
    }
  }
}