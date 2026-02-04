import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Locale Interceptor.
 * Extracts the locale from the Accept-Language header and injects it
 * into the request object for downstream handlers.
 *
 * Supported locales: zh-HK (Traditional Chinese), zh-CN (Simplified Chinese), en (English)
 * Default: zh-HK
 */
@Injectable()
export class LocaleInterceptor implements NestInterceptor {
  private readonly supportedLocales = ['zh-HK', 'zh-CN', 'en'];
  private readonly defaultLocale = 'zh-HK';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const acceptLanguage = request.headers['accept-language'] || '';

    request.locale = this.resolveLocale(acceptLanguage);

    return next.handle();
  }

  /**
   * Parses the Accept-Language header and resolves to the best matching
   * supported locale.
   *
   * Handles formats like:
   * - "zh-HK"
   * - "zh-CN,zh;q=0.9,en;q=0.8"
   * - "en-US,en;q=0.5"
   */
  private resolveLocale(acceptLanguage: string): string {
    if (!acceptLanguage) {
      return this.defaultLocale;
    }

    // Parse Accept-Language header into weighted entries
    const entries = acceptLanguage
      .split(',')
      .map((entry) => {
        const parts = entry.trim().split(';');
        const locale = parts[0].trim();
        const quality = parts[1]
          ? parseFloat(parts[1].replace('q=', ''))
          : 1.0;
        return { locale, quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // Try to match exact locale or language prefix
    for (const entry of entries) {
      // Exact match
      const exactMatch = this.supportedLocales.find(
        (supported) =>
          supported.toLowerCase() === entry.locale.toLowerCase(),
      );
      if (exactMatch) {
        return exactMatch;
      }

      // Language prefix match (e.g., "zh" -> "zh-HK", "en" -> "en")
      const lang = entry.locale.split('-')[0].toLowerCase();
      const prefixMatch = this.supportedLocales.find(
        (supported) => supported.toLowerCase().startsWith(lang),
      );
      if (prefixMatch) {
        return prefixMatch;
      }
    }

    return this.defaultLocale;
  }
}
