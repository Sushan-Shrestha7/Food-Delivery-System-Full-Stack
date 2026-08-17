import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { Otp } from "./otp.entity";
import { MailService } from "../mail/mail.service";

const SALT_ROUNDS = 10;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    private readonly mailService: MailService,
  ) { }

  private signToken(user: User) {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }

  private async generateAndSendOtp(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.otpRepo.delete({ email });
    await this.otpRepo.save({ email, code, expiresAt });
    console.log(`\n========================================`);
    console.log(`🔑 [AUTH OTP] Code for ${email}: [ ${code} ] (Expires in 5m)`);
    console.log(`========================================\n`);
    await this.mailService.sendOtp(email, code);
  }

  /**
   * SIGNUP
   * Always creates an *unverified* account and sends an OTP.
   * Does NOT accept a code here anymore — verification is a separate
   * step handled exclusively by verifyOtp(). This keeps signup's
   * responsibility single-purpose and avoids frontend flows getting
   * confused about which step they're on.
   */
  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      isVerified: false,
    });

    try {
      await this.generateAndSendOtp(dto.email);
    } catch (err: any) {
      console.error(`[AuthService] Signup OTP dispatch failed for ${dto.email}:`, err?.message || err);
      // Don't leave a stuck, unverified account behind if email failed
      await this.usersService.remove(user.id);
      throw new BadRequestException(
        "We couldn't send the verification email. Please check your email address and try again.",
      );
    }

    return {
      message: `Account created. Verification OTP sent to ${dto.email}.`,
      email: dto.email,
      requiresOtp: true,
    };
  }

  /**
   * VERIFY OTP
   * The single place that consumes an OTP code and marks a user verified.
   * Used both right after signup, and if a user comes back later
   * (via login) still unverified.
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const record = await this.otpRepo.findOne({
      where: { email: dto.email, code: dto.code },
    });
    if (!record) throw new BadRequestException("Invalid OTP code. Please check and try again.");
    if (record.expiresAt < new Date()) {
      throw new BadRequestException("OTP has expired. Please request a new one.");
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException("Account not found");

    await this.otpRepo.delete({ email: dto.email });
    await this.usersService.update(user.id, { isVerified: true } as any);
    await this.mailService.sendWelcomeEmail(user.email, user.name);

    return {
      message: "Account verified successfully",
      token: this.signToken(user),
      user: { ...user, isVerified: true },
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException("No account found with this email");
    }
    if (user.isVerified) {
      throw new BadRequestException("Account is already verified. Please log in.");
    }

    try {
      await this.generateAndSendOtp(dto.email);
    } catch (err: any) {
      console.error(`[AuthService] Resend OTP failed for ${dto.email}:`, err?.message || err);
      throw new BadRequestException(
        "We couldn't send the verification email. Please try again in a moment.",
      );
    }
    return { message: `Verification OTP resent to ${dto.email}`, email: dto.email };
  }

  /**
   * LOGIN
   * If credentials are correct but the account isn't verified yet,
   * we auto-send a fresh OTP and throw a structured error with a
   * `code: "EMAIL_NOT_VERIFIED"` field. The frontend should check
   * THIS field (not the message string) to decide whether to route
   * the user to the OTP screen.
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isVerified) {
      try {
        await this.generateAndSendOtp(user.email);
      } catch (err: any) {
        console.error(`[AuthService] Login OTP auto-dispatch failed for ${user.email}:`, err?.message || err);
      }
      throw new UnauthorizedException({
        message: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    return {
      message: "Login successful",
      token: this.signToken(user),
      user,
    };
  }

}