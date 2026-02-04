import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PORTAL_KEY } from '../decorators';

/**
 * Portal type guard.
 * Restricts endpoints to specific portal types based on the X-Portal-Type header.
 * Used with the @Portal() decorator to limit access to customer, mall, group,
 * or merchant portal contexts.
 */
export type PortalType = 'customer' | 'mall' | 'group' | 'merchant';

@Injectable()
export class PortalGuard implements CanActivate {
  private readonly logger = new Logger(PortalGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedPortals = this.reflector.getAllAndOverride<PortalType[]>(
      PORTAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no portal restriction, allow access
    if (!allowedPortals || allowedPortals.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const portalType = (
      request.headers['x-portal-type'] || ''
    ).toLowerCase() as PortalType;

    if (!portalType) {
      throw new ForbiddenException(
        'X-Portal-Type header is required. Must be one of: customer, mall, group, merchant.',
      );
    }

    if (!allowedPortals.includes(portalType)) {
      this.logger.warn(
        `Portal access denied. Required: [${allowedPortals.join(', ')}], Received: ${portalType}`,
      );
      throw new ForbiddenException(
        `This endpoint is not available for the "${portalType}" portal.`,
      );
    }

    // Attach portal type to request for downstream use
    request.portalType = portalType;

    return true;
  }
}
