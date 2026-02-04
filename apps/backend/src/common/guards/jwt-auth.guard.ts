import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';

/**
 * JWT Authentication Guard.
 * Validates JWT tokens on all protected routes.
 * Routes decorated with @Public() bypass this guard.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      this.logger.warn(
        `Authentication failed: ${info?.message || err?.message || 'Unknown error'}`,
      );
      throw (
        err ||
        new UnauthorizedException(
          info?.message === 'jwt expired'
            ? 'Token has expired. Please login again.'
            : 'Invalid or missing authentication token.',
        )
      );
    }
    return user;
  }
}
