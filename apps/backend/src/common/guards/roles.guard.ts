import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';

/**
 * Role-based access control guard.
 * Checks if the authenticated user has at least one of the required roles.
 * Used in conjunction with the @Roles() decorator.
 *
 * Supported roles: super_admin, group_admin, mall_admin, mall_operator,
 * merchant_admin, merchant_staff, customer
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated.');
    }

    const userRoles: string[] = user.roles || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      this.logger.warn(
        `Access denied for user ${user.id}. Required: [${requiredRoles.join(', ')}], Has: [${userRoles.join(', ')}]`,
      );
      throw new ForbiddenException(
        'You do not have the required permissions to access this resource.',
      );
    }

    return true;
  }
}
