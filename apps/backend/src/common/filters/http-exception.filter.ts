import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * i18n error message mappings.
 * Maps HTTP status codes to localized error messages.
 */
const ERROR_MESSAGES: Record<number, Record<string, string>> = {
  [HttpStatus.BAD_REQUEST]: {
    'zh-HK': '請求參數錯誤',
    'zh-CN': '请求参数错误',
    en: 'Bad request',
  },
  [HttpStatus.UNAUTHORIZED]: {
    'zh-HK': '未經授權，請重新登入',
    'zh-CN': '未经授权，请重新登录',
    en: 'Unauthorized. Please login again.',
  },
  [HttpStatus.FORBIDDEN]: {
    'zh-HK': '沒有權限執行此操作',
    'zh-CN': '没有权限执行此操作',
    en: 'You do not have permission to perform this action.',
  },
  [HttpStatus.NOT_FOUND]: {
    'zh-HK': '請求的資源不存在',
    'zh-CN': '请求的资源不存在',
    en: 'The requested resource was not found.',
  },
  [HttpStatus.CONFLICT]: {
    'zh-HK': '資源衝突',
    'zh-CN': '资源冲突',
    en: 'Resource conflict.',
  },
  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    'zh-HK': '無法處理的請求',
    'zh-CN': '无法处理的请求',
    en: 'Unprocessable entity.',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    'zh-HK': '請求過於頻繁，請稍後再試',
    'zh-CN': '请求过于频繁，请稍后再试',
    en: 'Too many requests. Please try again later.',
  },
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    'zh-HK': '伺服器內部錯誤',
    'zh-CN': '服务器内部错误',
    en: 'Internal server error.',
  },
};

/**
 * Global HTTP Exception Filter.
 * Catches all exceptions and returns a standardized error response
 * with i18n support based on the request locale.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const locale = (request as any).locale || 'zh-HK';

    let status: number;
    let message: string;
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        details = resp.errors || resp.details || null;

        // Handle class-validator errors (array of messages)
        if (Array.isArray(message)) {
          details = message;
          message = this.getLocalizedMessage(status, locale);
        }
      } else {
        message = exception.message;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.getLocalizedMessage(status, locale);

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${(exception as Error)?.message || 'Unknown'}`,
        (exception as Error)?.stack,
      );
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Get localized error message for a given HTTP status code and locale.
   */
  private getLocalizedMessage(status: number, locale: string): string {
    const messages = ERROR_MESSAGES[status];
    if (!messages) {
      return ERROR_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR][locale] || 'An error occurred.';
    }
    return messages[locale] || messages['en'] || 'An error occurred.';
  }
}
