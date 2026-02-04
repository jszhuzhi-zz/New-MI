import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Audit Log Interceptor.
 * Automatically logs all write operations (POST, PUT, PATCH, DELETE) for audit purposes.
 * Captures the operator, action, resource, timestamp, IP address, and portal type.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  private readonly writeMethods = new Set([
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ]);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    // Only log write operations
    if (!this.writeMethods.has(method)) {
      return next.handle();
    }

    const startTime = Date.now();
    const auditEntry = {
      timestamp: new Date().toISOString(),
      method,
      path: request.url,
      userId: request.user?.id || 'anonymous',
      userName: request.user?.name || 'anonymous',
      roles: request.user?.roles || [],
      portalType: request.headers['x-portal-type'] || 'unknown',
      ip: request.ip || request.headers['x-forwarded-for'] || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
      controller: context.getClass().name,
      handler: context.getHandler().name,
      // Omit sensitive fields from body logging
      bodyKeys: request.body ? Object.keys(request.body) : [],
    };

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[AUDIT] ${auditEntry.method} ${auditEntry.path} | User: ${auditEntry.userId} | Portal: ${auditEntry.portalType} | Duration: ${duration}ms | Status: SUCCESS`,
          );

          // TODO: Persist audit log entry to database
          // await this.prisma.auditLog.create({ data: { ...auditEntry, status: 'SUCCESS', duration } });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            `[AUDIT] ${auditEntry.method} ${auditEntry.path} | User: ${auditEntry.userId} | Portal: ${auditEntry.portalType} | Duration: ${duration}ms | Status: FAILED | Error: ${error.message}`,
          );

          // TODO: Persist failed audit log entry to database
          // await this.prisma.auditLog.create({ data: { ...auditEntry, status: 'FAILED', duration, errorMessage: error.message } });
        },
      }),
    );
  }
}
