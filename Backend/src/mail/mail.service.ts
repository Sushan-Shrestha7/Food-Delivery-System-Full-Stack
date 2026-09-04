import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const smtpUser =
      this.configService.get<string>("SMTP_USER") ||
      process.env.SMTP_USER ||
      "";

    const defaultFrom = smtpUser
      ? `"Ugrachandi Food Delivery" <${smtpUser}>`
      : "Ugrachandi Food Delivery <noreply@ugrachandi.com>";

    this.fromAddress =
      this.configService.get<string>("MAIL_FROM") ||
      process.env.MAIL_FROM ||
      defaultFrom;

    this.initTransporter();
  }

  async onModuleInit() {
    if (!this.isMailerDisabled() && this.transporter) {
      try {
        await this.transporter.verify();
        this.logger.log("✅ SMTP Transporter verified and ready to send emails.");
      } catch (err: any) {
        this.logger.warn(
          `⚠️ SMTP Transporter verification failed: ${err?.message || err}. Email sending may fail if credentials or network settings are incorrect.`
        );
      }}}

  private initTransporter(): void {
    const host =
      this.configService.get<string>("SMTP_HOST") ||
      process.env.SMTP_HOST ||
      "smtp.gmail.com";
    const port = Number(
      this.configService.get<number>("SMTP_PORT") ||
      process.env.SMTP_PORT ||
      587
    );
    const user =
      this.configService.get<string>("SMTP_USER") ||
      process.env.SMTP_USER ||
      "";
    const pass =
      this.configService.get<string>("SMTP_PASSWORD") ||
      process.env.SMTP_PASSWORD ||
      this.configService.get<string>("SMTP_PASS") ||
      process.env.SMTP_PASS ||
      "";

    const secure =
      this.configService.get<string>("SMTP_SECURE") === "true" ||
      process.env.SMTP_SECURE === "true" ||
      port === 465;

    if (!user || !pass) {
      this.logger.warn(
        "SMTP_USER or SMTP_PASSWORD is not configured in .env. Email sending will fail until provided."
      );
    }

    const options: SMTPTransport.Options & { family?: number } = {
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      family: 4,
    };

    this.transporter = nodemailer.createTransport(options as SMTPTransport.Options);
  }

  private isMailerDisabled(): boolean {
    return (
      this.configService.get<string>("MAILER_DISABLED") === "true" ||
      process.env.MAILER_DISABLED === "true"
    );
  }

  async sendMail(options: SendMailOptions): Promise<SMTPTransport.SentMessageInfo | null> {
    if (this.isMailerDisabled()) {
      this.logger.warn(
        `MAILER_DISABLED is enabled — skipping email to ${options.to} (Subject: "${options.subject}")`
      );
      return null;
    }

    if (!this.transporter) {
      this.initTransporter();
    }

    try {
      this.logger.log(`Sending email to ${options.to} (Subject: "${options.subject}")...`);
      const info = await this.transporter!.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email successfully delivered to ${options.to} (Message ID: ${info.messageId})`);
      return info;
    } catch (err: any) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${err?.message || err}`,
        err?.stack
      );
      throw err;
    }}

  async sendOtp(toEmail: string, otp: string): Promise<void> {
    const subject = "Your Verification Code - Ugrachandi Food Delivery";
    const text = `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.\nIf you did not request this, please ignore this email.`;
    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="color: #ff6347; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Ugrachandi Food Delivery</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Account Verification</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0; font-weight: 500;">
            Use the following 6-digit verification code to complete your request:
          </p>
          <div style="display: inline-block; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #ff6347; background: #ffffff; padding: 14px 28px; border-radius: 10px; border: 2px dashed #ff6347; box-shadow: 0 2px 8px rgba(255, 99, 71, 0.1);">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 14px 0 0 0;">
            ⏱ Valid for <strong style="color: #475569;">5 minutes</strong>
          </p>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
          If you did not request this verification code, please ignore this email. Do not share this OTP with anyone for your account security.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <div style="text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Ugrachandi Food Delivery. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.sendMail({
      to: toEmail,
      subject,
      text,
      html,
    });
  }


  async sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
    const subject = "Welcome to Ugrachandi Food Delivery! 🍕🍔";
    const text = `Welcome ${name}!\n\nThank you for joining Ugrachandi Food Delivery. Your account has been successfully verified.\nYour login ID is: ${toEmail}\n\nStart ordering now!`;
    const html = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="color: #ff6347; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to Ugrachandi! 🍕</h2>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Dear <strong>${name}</strong>,<br><br>
          Thank you for registering with us! Your account has been successfully verified.<br><br>
          Your login ID is <strong style="color: #0f172a;">${toEmail}</strong>.<br><br>
          You can now explore our curated menu and order delicious food from top restaurants.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173" style="background-color: #ff6347; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(255, 99, 71, 0.25);">
            Start Ordering Now
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5; margin: 0;">
          Need help? Contact support at <a href="mailto:support@ugrachandi.com" style="color: #ff6347; text-decoration: none;">support@ugrachandi.com</a>.
        </p>
      </div>
    `;

    try {
      await this.sendMail({
        to: toEmail,
        subject,
        text,
        html,
      });
    } catch (err: any) {
      this.logger.warn(`Could not deliver welcome email to ${toEmail}: ${err?.message || err}`);
    }}}
