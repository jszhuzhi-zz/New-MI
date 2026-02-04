import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * Authentication service.
 * Handles JWT token generation, password hashing, SMS OTP verification,
 * and Microsoft 365 SSO integration.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Login ──────────────────────────────────────────────────────────────────

  /**
   * Authenticate user with email/phone and password.
   */
  async login(identifier: string, password: string, portalType: string) {
    // TODO: Look up user by email or phone from database
    // const user = await this.prisma.user.findFirst({
    //   where: {
    //     OR: [{ email: identifier }, { phone: identifier }],
    //     status: 'active',
    //   },
    //   include: { roles: true, organization: true },
    // });

    // if (!user) {
    //   throw new UnauthorizedException('Invalid credentials.');
    // }

    // TODO: Check account lockout
    // if (user.lockedUntil && user.lockedUntil > new Date()) {
    //   throw new UnauthorizedException('Account is temporarily locked due to too many failed login attempts.');
    // }

    // TODO: Verify password
    // const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    // if (!isPasswordValid) {
    //   await this.incrementFailedAttempts(user.id);
    //   throw new UnauthorizedException('Invalid credentials.');
    // }

    // TODO: Reset failed login attempts on successful login
    // await this.resetFailedAttempts(user.id);

    // TODO: Generate tokens with real user data
    const payload: JwtPayload = {
      sub: 'user-id-placeholder',
      email: identifier,
      roles: ['customer'],
      portalType,
    };

    return this.generateTokens(payload);
  }

  // ─── Token Management ──────────────────────────────────────────────────────

  /**
   * Generate access and refresh token pair.
   */
  async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('jwt.expiresIn', '1h'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      }),
    ]);

    // TODO: Store refresh token hash in database/redis for revocation support
    // await this.redis.set(`refresh:${payload.sub}`, hashRefreshToken, 'EX', 7 * 24 * 3600);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('jwt.expiresIn', '1h'),
      tokenType: 'Bearer',
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        },
      );

      // TODO: Verify refresh token exists in database/redis (not revoked)
      // const storedHash = await this.redis.get(`refresh:${payload.sub}`);
      // if (!storedHash || !this.verifyRefreshTokenHash(refreshToken, storedHash)) {
      //   throw new UnauthorizedException('Refresh token has been revoked.');
      // }

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        phone: payload.phone,
        roles: payload.roles,
        portalType: payload.portalType,
        organizationId: payload.organizationId,
        projectId: payload.projectId,
      };

      return this.generateTokens(newPayload);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  /**
   * Logout - invalidate tokens.
   */
  async logout(userId: string) {
    // TODO: Remove refresh token from database/redis
    // await this.redis.del(`refresh:${userId}`);

    // TODO: Add access token to blacklist until expiry
    // await this.redis.set(`blacklist:${accessToken}`, '1', 'EX', 3600);

    this.logger.log(`User ${userId} logged out`);
    return { message: 'Logged out successfully' };
  }

  // ─── SMS OTP ────────────────────────────────────────────────────────────────

  /**
   * Send SMS OTP code to the specified phone number.
   */
  async sendSmsCode(phone: string) {
    // TODO: Check rate limiting
    // const dailyCount = await this.redis.get(`sms:daily:${phone}`);
    // const dailyLimit = this.configService.get<number>('sms.dailyLimit', 10);
    // if (parseInt(dailyCount || '0') >= dailyLimit) {
    //   throw new BadRequestException('SMS daily limit exceeded. Please try again tomorrow.');
    // }

    // Generate OTP
    const otpLength = this.configService.get<number>('sms.otpLength', 6);
    const otp = this.generateOtp(otpLength);
    const expiryMinutes = this.configService.get<number>('sms.otpExpiryMinutes', 5);

    // TODO: Store OTP in Redis with expiry
    // await this.redis.set(`otp:${phone}`, otp, 'EX', expiryMinutes * 60);

    // TODO: Send SMS via provider (Twilio, etc.)
    // await this.smsProvider.send(phone, `Your verification code is: ${otp}. Valid for ${expiryMinutes} minutes.`);

    // TODO: Increment daily counter
    // await this.redis.incr(`sms:daily:${phone}`);
    // await this.redis.expire(`sms:daily:${phone}`, 86400);

    this.logger.log(`SMS OTP sent to ${phone.substring(0, 4)}****`);

    return { message: 'Verification code sent', expiresInMinutes: expiryMinutes };
  }

  /**
   * Verify SMS OTP code and authenticate user.
   */
  async verifySmsCode(phone: string, code: string, portalType: string) {
    // TODO: Retrieve stored OTP from Redis
    // const storedOtp = await this.redis.get(`otp:${phone}`);
    // if (!storedOtp) {
    //   throw new BadRequestException('Verification code has expired. Please request a new one.');
    // }
    // if (storedOtp !== code) {
    //   throw new BadRequestException('Invalid verification code.');
    // }

    // TODO: Delete used OTP
    // await this.redis.del(`otp:${phone}`);

    // TODO: Find or create user by phone number
    // let user = await this.prisma.user.findFirst({ where: { phone } });
    // if (!user) {
    //   user = await this.prisma.user.create({ data: { phone, status: 'active', roles: ['customer'] } });
    // }

    const payload: JwtPayload = {
      sub: 'user-id-placeholder',
      email: '',
      phone,
      roles: ['customer'],
      portalType,
    };

    return this.generateTokens(payload);
  }

  // ─── M365 SSO ───────────────────────────────────────────────────────────────

  /**
   * Handle Microsoft 365 SSO callback.
   * Used by mall and group portal staff for internal authentication.
   */
  async handleM365Callback(authCode: string, portalType: string) {
    // TODO: Exchange auth code for M365 tokens
    // const m365Config = this.configService.get('m365');
    // const tokenResponse = await this.m365Client.acquireTokenByCode({
    //   code: authCode,
    //   scopes: m365Config.scopes,
    //   redirectUri: m365Config.redirectUri,
    // });

    // TODO: Extract user info from M365 token
    // const m365User = await this.m365Client.getUserProfile(tokenResponse.accessToken);

    // TODO: Find corresponding internal user
    // const user = await this.prisma.user.findFirst({
    //   where: { email: m365User.mail, status: 'active' },
    //   include: { roles: true },
    // });
    // if (!user) {
    //   throw new UnauthorizedException('No matching account found for this M365 user.');
    // }

    const payload: JwtPayload = {
      sub: 'user-id-placeholder',
      email: 'user@linkreit.com',
      roles: ['mall_admin'],
      portalType,
    };

    return this.generateTokens(payload);
  }

  // ─── Password Management ───────────────────────────────────────────────────

  /**
   * Change user password.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // TODO: Fetch user from database
    // const user = await this.prisma.user.findUnique({ where: { id: userId } });
    // if (!user) {
    //   throw new UnauthorizedException('User not found.');
    // }

    // TODO: Verify current password
    // const isValid = await this.comparePassword(currentPassword, user.passwordHash);
    // if (!isValid) {
    //   throw new BadRequestException('Current password is incorrect.');
    // }

    // Validate new password strength
    this.validatePasswordStrength(newPassword);

    // TODO: Hash and update password
    // const newHash = await this.hashPassword(newPassword);
    // await this.prisma.user.update({
    //   where: { id: userId },
    //   data: { passwordHash: newHash, updatedAt: new Date() },
    // });

    this.logger.log(`Password changed for user ${userId}`);
    return { message: 'Password changed successfully' };
  }

  /**
   * Get current user profile.
   */
  async getCurrentUser(userId: string) {
    // TODO: Fetch user profile from database
    // const user = await this.prisma.user.findUnique({
    //   where: { id: userId },
    //   include: {
    //     roles: true,
    //     organization: true,
    //     memberProfile: true,
    //   },
    // });
    // if (!user) {
    //   throw new UnauthorizedException('User not found.');
    // }

    // Placeholder response
    return {
      id: userId,
      email: '',
      phone: '',
      name: '',
      roles: [],
      organizationId: null,
      projectId: null,
    };
  }

  // ─── Utility Methods ───────────────────────────────────────────────────────

  /**
   * Hash a password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>(
      'security.bcryptSaltRounds',
      12,
    );
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain-text password with a bcrypt hash.
   */
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a random numeric OTP.
   */
  private generateOtp(length: number): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  /**
   * Validate password meets minimum strength requirements.
   */
  private validatePasswordStrength(password: string): void {
    const minLength = this.configService.get<number>(
      'security.passwordMinLength',
      8,
    );

    if (password.length < minLength) {
      throw new BadRequestException(
        `Password must be at least ${minLength} characters long.`,
      );
    }

    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter.',
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one lowercase letter.',
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one digit.',
      );
    }
  }
}
