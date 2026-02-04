import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT token payload interface.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  phone?: string;
  roles: string[];
  portalType: string;
  organizationId?: string;
  projectId?: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Passport Strategy.
 * Validates JWT tokens extracted from the Authorization header.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
      issuer: 'link-reit-membership',
    });
  }

  /**
   * Validates the JWT payload and returns the user object
   * that will be attached to the request.
   */
  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload.');
    }

    // TODO: Optionally verify user still exists and is active in database
    // const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    // if (!user || user.status !== 'active') {
    //   throw new UnauthorizedException('User account is inactive or deleted.');
    // }

    return {
      id: payload.sub,
      email: payload.email,
      phone: payload.phone,
      roles: payload.roles,
      portalType: payload.portalType,
      organizationId: payload.organizationId,
      projectId: payload.projectId,
    };
  }
}
