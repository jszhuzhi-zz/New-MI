import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { PortalType } from '../guards/portal.guard';

// ─── Public Route Decorator ───────────────────────────────────────────────────

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public, bypassing JWT authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ─── Roles Decorator ─────────────────────────────────────────────────────────

export const ROLES_KEY = 'roles';

/**
 * Sets required roles for a route.
 * The user must have at least one of the specified roles.
 *
 * @example
 * @Roles('group_admin', 'mall_admin')
 * @Get('admin-only')
 * getAdminData() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ─── Portal Decorator ────────────────────────────────────────────────────────

export const PORTAL_KEY = 'portal';

/**
 * Restricts an endpoint to specific portal types.
 * Requires the X-Portal-Type header to match one of the allowed values.
 *
 * @example
 * @Portal('mall', 'group')
 * @Get('management-only')
 * getManagementData() { ... }
 */
export const Portal = (...portals: PortalType[]) =>
  SetMetadata(PORTAL_KEY, portals);

// ─── Current User Decorator ──────────────────────────────────────────────────

/**
 * Extracts the current authenticated user from the request.
 * Optionally extracts a specific property from the user object.
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserPayload) { ... }
 *
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

// ─── Locale Decorator ────────────────────────────────────────────────────────

/**
 * Extracts the resolved locale from the request.
 * The locale is set by the LocaleInterceptor from the Accept-Language header.
 *
 * @example
 * @Get('content')
 * getContent(@Locale() locale: string) { ... }
 */
export const Locale = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.locale || 'zh-HK';
  },
);

// ─── Portal Type Decorator ───────────────────────────────────────────────────

/**
 * Extracts the portal type from the request (set by PortalGuard).
 *
 * @example
 * @Get('data')
 * getData(@CurrentPortal() portal: PortalType) { ... }
 */
export const CurrentPortal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PortalType | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.portalType;
  },
);
