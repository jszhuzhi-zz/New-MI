/**
 * Formatting utilities for the Link REIT membership system.
 * Handles dates, currencies (HKD), stamp counts, phone masking, and more.
 */

import type { Locale } from '@link-reit/types';

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/** Predefined date format presets */
export type DateFormatPreset =
  | 'date'           // 2024-03-15
  | 'datetime'       // 2024-03-15 14:30
  | 'dateTimeSec'    // 2024-03-15 14:30:45
  | 'time'           // 14:30
  | 'timeSec'        // 14:30:45
  | 'short'          // 15 Mar 2024
  | 'long'           // 15 March 2024
  | 'relative';      // 3 hours ago

/**
 * Locale-aware date format configuration.
 */
const LOCALE_MAP: Record<Locale, string> = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en-HK',
};

/**
 * Format a date value using Intl.DateTimeFormat.
 *
 * @param value   - Date, ISO string, or timestamp.
 * @param preset  - A named preset or Intl.DateTimeFormatOptions.
 * @param locale  - Target locale (defaults to 'en').
 */
export function formatDate(
  value: Date | string | number,
  preset: DateFormatPreset | Intl.DateTimeFormatOptions = 'datetime',
  locale: Locale = 'en',
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return '--';
  }

  const intlLocale = LOCALE_MAP[locale];

  if (typeof preset === 'object') {
    return new Intl.DateTimeFormat(intlLocale, preset).format(date);
  }

  switch (preset) {
    case 'date':
      return new Intl.DateTimeFormat(intlLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);

    case 'datetime':
      return new Intl.DateTimeFormat(intlLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);

    case 'dateTimeSec':
      return new Intl.DateTimeFormat(intlLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);

    case 'time':
      return new Intl.DateTimeFormat(intlLocale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);

    case 'timeSec':
      return new Intl.DateTimeFormat(intlLocale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);

    case 'short':
      return new Intl.DateTimeFormat(intlLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);

    case 'long':
      return new Intl.DateTimeFormat(intlLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);

    case 'relative':
      return formatRelativeTime(date, locale);

    default:
      return date.toISOString();
  }
}

/**
 * Format a date as a relative time string (e.g. "3 hours ago", "in 2 days").
 */
export function formatRelativeTime(
  value: Date | string | number,
  locale: Locale = 'en',
): string {
  const date = value instanceof Date ? value : new Date(value);
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absDiffMs = Math.abs(diffMs);

  const intlLocale = LOCALE_MAP[locale];

  const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: 'year', ms: 365.25 * 24 * 60 * 60 * 1000 },
    { unit: 'month', ms: 30.44 * 24 * 60 * 60 * 1000 },
    { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
    { unit: 'day', ms: 24 * 60 * 60 * 1000 },
    { unit: 'hour', ms: 60 * 60 * 1000 },
    { unit: 'minute', ms: 60 * 1000 },
    { unit: 'second', ms: 1000 },
  ];

  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });

  for (const { unit, ms } of units) {
    if (absDiffMs >= ms || unit === 'second') {
      const amount = Math.round(diffMs / ms);
      return rtf.format(amount, unit);
    }
  }

  return rtf.format(0, 'second');
}

/**
 * Format a date into ISO 8601 date-only string (YYYY-MM-DD).
 */
export function toISODateString(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

/** Default currency for the Link REIT system */
const DEFAULT_CURRENCY = 'HKD';

/**
 * Format a monetary value.
 *
 * @param amount   - Numeric amount.
 * @param currency - ISO 4217 currency code (default: HKD).
 * @param locale   - Target locale.
 *
 * @example
 * formatCurrency(1234.5)               // "HK$1,234.50"
 * formatCurrency(1234.5, 'HKD', 'zh-CN') // "HK$1,234.50"
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: Locale = 'en',
): string {
  const intlLocale = LOCALE_MAP[locale];

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a monetary value in compact notation for dashboards.
 *
 * @example
 * formatCurrencyCompact(1_500_000) // "HK$1.5M"
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: Locale = 'en',
): string {
  const intlLocale = LOCALE_MAP[locale];

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Stamp count formatting
// ---------------------------------------------------------------------------

/**
 * Format a stamp count for display.
 * Large counts are abbreviated (e.g. 12,500 -> "12.5K").
 *
 * @param count       - Number of stamps.
 * @param compact     - Use compact notation for large numbers.
 * @param locale      - Target locale.
 */
export function formatStampCount(
  count: number,
  compact = false,
  locale: Locale = 'en',
): string {
  const intlLocale = LOCALE_MAP[locale];

  if (compact && Math.abs(count) >= 1000) {
    return new Intl.NumberFormat(intlLocale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(count);
  }

  return new Intl.NumberFormat(intlLocale).format(count);
}

/**
 * Format a stamp balance with a sign prefix.
 *
 * @example
 * formatStampDelta(50)   // "+50"
 * formatStampDelta(-20)  // "-20"
 */
export function formatStampDelta(delta: number, locale: Locale = 'en'): string {
  const intlLocale = LOCALE_MAP[locale];

  return new Intl.NumberFormat(intlLocale, {
    signDisplay: 'always',
  }).format(delta);
}

// ---------------------------------------------------------------------------
// Phone masking
// ---------------------------------------------------------------------------

/**
 * Mask a phone number for display, showing only the last 4 digits.
 *
 * @param phone        - Full phone number.
 * @param countryCode  - Optional country code to prepend.
 * @param visibleDigits - Number of trailing digits to show (default 4).
 *
 * @example
 * maskPhone('91234567')              // "****4567"
 * maskPhone('91234567', '852')       // "+852 ****4567"
 * maskPhone('91234567', '852', 3)    // "+852 *****567"
 */
export function maskPhone(
  phone: string,
  countryCode?: string,
  visibleDigits = 4,
): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length <= visibleDigits) {
    return countryCode ? `+${countryCode} ${digits}` : digits;
  }

  const masked =
    '*'.repeat(digits.length - visibleDigits) +
    digits.slice(-visibleDigits);

  return countryCode ? `+${countryCode} ${masked}` : masked;
}

/**
 * Mask an email address for display.
 *
 * @example
 * maskEmail('john.doe@example.com') // "jo****oe@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }

  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.slice(-2);
  return `${visibleStart}${'*'.repeat(Math.max(local.length - 4, 2))}${visibleEnd}@${domain}`;
}

/**
 * Mask an HKID for display, showing only the prefix and check digit.
 *
 * @example
 * maskHKID('A1234567') // "A***456(7)"
 */
export function maskHKID(hkid: string): string {
  const cleaned = hkid.toUpperCase().replace(/[() ]/g, '');

  const match = cleaned.match(/^([A-Z]{1,2})(\d{6})(\d|A)$/);
  if (!match) return hkid;

  const [, prefix, digits, check] = match;
  return `${prefix}***${digits.slice(3)}(${check})`;
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

/**
 * Format a number as a percentage.
 *
 * @example
 * formatPercentage(0.8532)    // "85.32%"
 * formatPercentage(0.8532, 0) // "85%"
 */
export function formatPercentage(
  value: number,
  fractionDigits = 2,
  locale: Locale = 'en',
): string {
  const intlLocale = LOCALE_MAP[locale];

  return new Intl.NumberFormat(intlLocale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Format a large number with compact notation.
 *
 * @example
 * formatCompactNumber(12500) // "12.5K"
 */
export function formatCompactNumber(
  value: number,
  locale: Locale = 'en',
): string {
  const intlLocale = LOCALE_MAP[locale];

  return new Intl.NumberFormat(intlLocale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Name formatting
// ---------------------------------------------------------------------------

/**
 * Format a member name for display depending on locale.
 * Chinese locales: lastName + firstName (no space).
 * English locale: firstName + lastName.
 */
export function formatMemberName(
  firstName: string,
  lastName: string,
  locale: Locale = 'en',
): string {
  if (locale === 'zh-CN' || locale === 'zh-TW') {
    return `${lastName}${firstName}`;
  }
  return `${firstName} ${lastName}`;
}

/**
 * Get initials from a name (up to 2 characters).
 */
export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}`.trim();
}
