/**
 * Common validation utilities for the Link REIT membership system.
 * Includes HK-specific validators for phone numbers, HKID, and general validators.
 */

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// ---------------------------------------------------------------------------
// Hong Kong phone number validation
// ---------------------------------------------------------------------------

/** Country code for Hong Kong */
const HK_COUNTRY_CODE = '852';

/**
 * Valid HK mobile prefixes: numbers starting with 4, 5, 6, 7, 8, or 9.
 * Fixed-line numbers starting with 2 or 3 are also accepted.
 */
const HK_PHONE_REGEX = /^[2-9]\d{7}$/;

/**
 * Normalise a phone string by stripping spaces, dashes, and an optional
 * leading "+852" / "852" prefix.
 */
export function normaliseHKPhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith(`+${HK_COUNTRY_CODE}`)) {
    cleaned = cleaned.slice(HK_COUNTRY_CODE.length + 1);
  } else if (cleaned.startsWith(HK_COUNTRY_CODE)) {
    cleaned = cleaned.slice(HK_COUNTRY_CODE.length);
  }
  return cleaned;
}

/**
 * Validate a Hong Kong phone number.
 * Accepts formats: "91234567", "+852 9123 4567", "852-91234567", etc.
 */
export function validateHKPhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: 'Phone number is required' };
  }

  const normalised = normaliseHKPhone(phone);

  if (!HK_PHONE_REGEX.test(normalised)) {
    return {
      valid: false,
      message: 'Invalid HK phone number. Must be 8 digits starting with 2-9',
    };
  }

  return { valid: true };
}

/**
 * Validate a phone number with an explicit country code.
 * For +852 numbers the HK-specific rules apply; other codes only check length.
 */
export function validatePhone(phone: string, countryCode: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: 'Phone number is required' };
  }

  if (countryCode === HK_COUNTRY_CODE || countryCode === `+${HK_COUNTRY_CODE}`) {
    return validateHKPhone(phone);
  }

  // Generic international phone validation: 4-15 digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4 || digits.length > 15) {
    return { valid: false, message: 'Phone number must be between 4 and 15 digits' };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// HKID validation
// ---------------------------------------------------------------------------

/**
 * Weights used in the HKID check-digit algorithm.
 * For a standard HKID of the form X999999(C):
 *   position weights are 8, 7, 6, 5, 4, 3, 2 for the 7 body characters,
 *   plus 9 for the leading letter and 1 for the check digit.
 * A two-letter prefix uses weights 9, 8, 7 ... 2, 1.
 */
function charValue(ch: string): number {
  return ch.charCodeAt(0) - 55; // A=10, B=11 ... Z=35
}

/**
 * Validate a Hong Kong Identity Card number.
 *
 * Acceptable formats:
 *   - Single-letter prefix:  A123456(7)  or  A1234567
 *   - Double-letter prefix:  AB123456(7) or  AB1234567
 *
 * The check digit can be 0-9 or A (representing 10).
 */
export function validateHKID(hkid: string): ValidationResult {
  if (!hkid || hkid.trim().length === 0) {
    return { valid: false, message: 'HKID is required' };
  }

  // Normalise: uppercase, remove spaces, brackets
  const cleaned = hkid.toUpperCase().replace(/[() ]/g, '');

  // Match pattern: 1-2 uppercase letters + 6 digits + 1 check character (digit or A)
  const match = cleaned.match(/^([A-Z]{1,2})(\d{6})(\d|A)$/);
  if (!match) {
    return {
      valid: false,
      message: 'Invalid HKID format. Expected e.g. A123456(7) or AB123456(7)',
    };
  }

  const [, prefix, digits, checkChar] = match;

  // Build the weighted sum
  let sum = 0;

  if (prefix.length === 2) {
    // Two-letter prefix
    sum += charValue(prefix[0]) * 9;
    sum += charValue(prefix[1]) * 8;
    for (let i = 0; i < 6; i++) {
      sum += parseInt(digits[i], 10) * (7 - i);
    }
  } else {
    // Single-letter prefix (space = 36 weight at position 9)
    sum += 36 * 9;
    sum += charValue(prefix[0]) * 8;
    for (let i = 0; i < 6; i++) {
      sum += parseInt(digits[i], 10) * (7 - i);
    }
  }

  const checkValue = checkChar === 'A' ? 10 : parseInt(checkChar, 10);
  sum += checkValue;

  if (sum % 11 !== 0) {
    return { valid: false, message: 'Invalid HKID check digit' };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------

/**
 * RFC 5322 simplified email regex. Covers the vast majority of real-world
 * email addresses without being overly permissive.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate an email address.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email is required' };
  }

  if (email.length > 254) {
    return { valid: false, message: 'Email address is too long' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Invalid email address format' };
  }

  // Check that the domain part contains at least one dot
  const domainPart = email.split('@')[1];
  if (!domainPart || !domainPart.includes('.')) {
    return { valid: false, message: 'Email domain must contain at least one dot' };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Member card number validation
// ---------------------------------------------------------------------------

/**
 * Validate a member card number based on the generation rule.
 *
 * @param cardNo   - The card number to validate.
 * @param prefix   - Expected prefix (e.g. "LR").
 * @param length   - Expected total length of the card number.
 */
export function validateMemberCardNo(
  cardNo: string,
  prefix: string,
  length: number,
): ValidationResult {
  if (!cardNo || cardNo.trim().length === 0) {
    return { valid: false, message: 'Card number is required' };
  }

  if (cardNo.length !== length) {
    return {
      valid: false,
      message: `Card number must be exactly ${length} characters`,
    };
  }

  if (!cardNo.startsWith(prefix)) {
    return {
      valid: false,
      message: `Card number must start with "${prefix}"`,
    };
  }

  // The remaining portion after the prefix must be numeric
  const body = cardNo.slice(prefix.length);
  if (!/^\d+$/.test(body)) {
    return {
      valid: false,
      message: 'Card number body must contain only digits',
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Luhn algorithm (payment / generic card validation)
// ---------------------------------------------------------------------------

/**
 * Validate a numeric string using the Luhn algorithm.
 * Useful for payment card numbers or any check-digit-protected identifier.
 */
export function validateLuhn(input: string): ValidationResult {
  if (!input || input.trim().length === 0) {
    return { valid: false, message: 'Card number is required' };
  }

  const digits = input.replace(/\s/g, '');

  if (!/^\d+$/.test(digits)) {
    return { valid: false, message: 'Card number must contain only digits' };
  }

  if (digits.length < 13 || digits.length > 19) {
    return { valid: false, message: 'Card number must be between 13 and 19 digits' };
  }

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }
    sum += n;
    alternate = !alternate;
  }

  if (sum % 10 !== 0) {
    return { valid: false, message: 'Invalid card number (Luhn check failed)' };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

/**
 * Check that a string value is non-empty after trimming.
 */
export function isNonEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a string is within a min/max length range.
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName = 'Value',
): ValidationResult {
  if (!value || value.length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  }
  if (value.length > max) {
    return { valid: false, message: `${fieldName} must be at most ${max} characters` };
  }
  return { valid: true };
}

/**
 * Compose multiple validation functions. Returns the first failing result
 * or a passing result if all succeed.
 */
export function composeValidations(
  ...validators: (() => ValidationResult)[]
): ValidationResult {
  for (const validate of validators) {
    const result = validate();
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
