/**
 * Cryptographic utilities for the Link REIT membership system.
 * Uses Node.js built-in `crypto` module for hashing and token generation.
 */

import * as crypto from 'crypto';

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

/**
 * Supported hash algorithms.
 */
export type HashAlgorithm = 'sha256' | 'sha384' | 'sha512' | 'md5';

/**
 * Compute a hex-encoded hash of the given data.
 *
 * @param data      - The input string to hash.
 * @param algorithm - Hash algorithm (default: sha256).
 */
export function hash(data: string, algorithm: HashAlgorithm = 'sha256'): string {
  return crypto.createHash(algorithm).update(data, 'utf8').digest('hex');
}

/**
 * Compute a SHA-256 hex digest.
 */
export function sha256(data: string): string {
  return hash(data, 'sha256');
}

/**
 * Compute a SHA-512 hex digest.
 */
export function sha512(data: string): string {
  return hash(data, 'sha512');
}

/**
 * Compute an HMAC-SHA256 hex digest.
 *
 * @param data   - The message to authenticate.
 * @param secret - The secret key.
 */
export function hmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data, 'utf8').digest('hex');
}

/**
 * Compute an HMAC with a configurable algorithm.
 */
export function hmac(
  data: string,
  secret: string,
  algorithm: HashAlgorithm = 'sha256',
): string {
  return crypto.createHmac(algorithm, secret).update(data, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// Password hashing (bcrypt-compatible via scrypt)
// ---------------------------------------------------------------------------

/** Default scrypt parameters */
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 32;

/**
 * Hash a password using scrypt with a random salt.
 * Returns a string in the format `salt:hash` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SCRYPT_SALT_LENGTH);

  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify a password against a previously hashed value.
 *
 * @param password  - The plaintext password to verify.
 * @param hashed    - The stored `salt:hash` string.
 */
export async function verifyPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  const [saltHex, keyHex] = hashed.split(':');
  if (!saltHex || !keyHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(keyHex, 'hex');

  return new Promise<boolean>((resolve, reject) => {
    crypto.scrypt(password, salt, storedKey.length, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(crypto.timingSafeEqual(storedKey, derivedKey));
    });
  });
}

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically secure random token as a hex string.
 *
 * @param byteLength - Number of random bytes (default: 32 -> 64 hex chars).
 */
export function generateToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Generate a URL-safe base64-encoded token.
 *
 * @param byteLength - Number of random bytes (default: 32).
 */
export function generateUrlSafeToken(byteLength = 32): string {
  return crypto
    .randomBytes(byteLength)
    .toString('base64url');
}

/**
 * Generate a numeric OTP (One-Time Password) of the specified length.
 *
 * @param length - Number of digits (default: 6).
 */
export function generateOTP(length = 6): string {
  const max = Math.pow(10, length);
  const randomValue = crypto.randomInt(0, max);
  return randomValue.toString().padStart(length, '0');
}

/**
 * Generate a UUID v4 string.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Encryption helpers (AES-256-GCM)
// ---------------------------------------------------------------------------

/** AES-256-GCM constants */
const AES_ALGORITHM = 'aes-256-gcm';
const AES_IV_LENGTH = 12;
const AES_AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt.
 * @param key       - 32-byte hex-encoded encryption key.
 * @returns Base64-encoded string in the format `iv:authTag:ciphertext`.
 */
export function encrypt(plaintext: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== 32) {
    throw new Error('Encryption key must be exactly 32 bytes (64 hex characters)');
  }

  const iv = crypto.randomBytes(AES_IV_LENGTH);

  const cipher = crypto.createCipheriv(AES_ALGORITHM, keyBuffer, iv, {
    authTagLength: AES_AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + ciphertext and encode as base64
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt a ciphertext string produced by `encrypt`.
 *
 * @param ciphertext - Base64-encoded encrypted payload.
 * @param key        - 32-byte hex-encoded encryption key.
 */
export function decrypt(ciphertext: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== 32) {
    throw new Error('Encryption key must be exactly 32 bytes (64 hex characters)');
  }

  const combined = Buffer.from(ciphertext, 'base64');

  const iv = combined.subarray(0, AES_IV_LENGTH);
  const authTag = combined.subarray(AES_IV_LENGTH, AES_IV_LENGTH + AES_AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(AES_IV_LENGTH + AES_AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(AES_ALGORITHM, keyBuffer, iv, {
    authTagLength: AES_AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

// ---------------------------------------------------------------------------
// Signature helpers
// ---------------------------------------------------------------------------

/**
 * Create a deterministic signature for API request signing.
 * Sorts parameters alphabetically, concatenates them, and computes an HMAC.
 *
 * @param params - Key-value pairs to sign.
 * @param secret - Signing secret.
 */
export function signRequest(
  params: Record<string, string | number | boolean>,
  secret: string,
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join('&');

  return hmacSha256(sorted, secret);
}

/**
 * Verify a request signature.
 */
export function verifySignature(
  params: Record<string, string | number | boolean>,
  secret: string,
  signature: string,
): boolean {
  const expected = signRequest(params, secret);
  // Use constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex'),
  );
}
