import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';

// ─── Request DTOs ────────────────────────────────────────────────────────────

class LoginDto {
  /** Email address or phone number */
  identifier: string;
  /** User password */
  password: string;
  /** Portal type: customer | mall | group | merchant */
  portalType: string;
}

class RefreshTokenDto {
  /** Refresh token obtained from login */
  refreshToken: string;
}

class SendSmsCodeDto {
  /** Phone number with country code (e.g., +852XXXXXXXX) */
  phone: string;
}

class VerifySmsDto {
  /** Phone number with country code */
  phone: string;
  /** 6-digit OTP code */
  code: string;
  /** Portal type */
  portalType: string;
}

class M365CallbackDto {
  /** Authorization code from Microsoft 365 */
  authCode: string;
  /** Portal type */
  portalType: string;
}

class ChangePasswordDto {
  /** Current password */
  currentPassword: string;
  /** New password (min 8 chars, must contain uppercase, lowercase, digit) */
  newPassword: string;
}

// ─── Controller ──────────────────────────────────────────────────────────────

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate with email/phone and password. Returns JWT access and refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful. Returns token pair.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 423, description: 'Account locked due to too many failed attempts.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.identifier, dto.password, dto.portalType);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate the current session and revoke tokens.',
  })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Exchange a valid refresh token for a new access/refresh token pair.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New token pair generated.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Post('sms-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send SMS verification code',
    description:
      'Send a one-time verification code to the specified phone number. Rate limited.',
  })
  @ApiBody({ type: SendSmsCodeDto })
  @ApiResponse({ status: 200, description: 'SMS code sent successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid phone number or rate limit exceeded.' })
  async sendSmsCode(@Body() dto: SendSmsCodeDto) {
    return this.authService.sendSmsCode(dto.phone);
  }

  @Public()
  @Post('verify-sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify SMS code and login',
    description:
      'Verify the SMS OTP code and authenticate the user. Returns JWT tokens on success.',
  })
  @ApiBody({ type: VerifySmsDto })
  @ApiResponse({ status: 200, description: 'Verification successful. Returns token pair.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code.' })
  async verifySms(@Body() dto: VerifySmsDto) {
    return this.authService.verifySmsCode(dto.phone, dto.code, dto.portalType);
  }

  @Public()
  @Post('m365-callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Microsoft 365 SSO callback',
    description:
      'Handle M365 SSO callback for internal staff authentication (mall and group portals).',
  })
  @ApiBody({ type: M365CallbackDto })
  @ApiResponse({ status: 200, description: 'M365 authentication successful. Returns token pair.' })
  @ApiResponse({ status: 401, description: 'No matching account found for this M365 user.' })
  async m365Callback(@Body() dto: M365CallbackDto) {
    return this.authService.handleM365Callback(dto.authCode, dto.portalType);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Return the profile of the currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getCurrentUser(userId);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change password',
    description:
      'Change the current user password. Requires current password for verification.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Current password incorrect or new password too weak.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
