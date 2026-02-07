import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment variable
 * In production, use a proper key management service (AWS KMS, Azure Key Vault, etc.)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.MEDIA_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('MEDIA_ENCRYPTION_KEY environment variable is not set');
  }
  
  // Convert hex string to buffer
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt file buffer using AES-256-GCM
 * @param buffer File buffer to encrypt
 * @returns Encrypted buffer with IV and auth tag
 */
export function encryptFile(buffer: Buffer): {
  encrypted: Buffer;
  iv: string;
  tag: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final(),
  ]);
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt file buffer using AES-256-GCM
 * @param encrypted Encrypted buffer
 * @param iv Initialization vector (hex string)
 * @param tag Authentication tag (hex string)
 * @returns Decrypted buffer
 */
export function decryptFile(
  encrypted: Buffer,
  iv: string,
  tag: string,
): Buffer {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, 'hex');
  const tagBuffer = Buffer.from(tag, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(tagBuffer);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  return decrypted;
}

/**
 * Encrypt a file path for database storage
 * @param path File path to encrypt
 * @returns Encrypted path (hex string)
 */
export function encryptPath(path: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(path, 'utf8')),
    cipher.final(),
  ]);
  
  const tag = cipher.getAuthTag();
  
  // Combine IV + encrypted + tag and convert to hex
  const combined = Buffer.concat([iv, encrypted, tag]);
  return combined.toString('hex');
}

/**
 * Decrypt a file path from database
 * @param encryptedPath Encrypted path (hex string)
 * @returns Decrypted path
 */
export function decryptPath(encryptedPath: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedPath, 'hex');
  
  // Extract IV, encrypted data, and tag
  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(combined.length - TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  return decrypted.toString('utf8');
}

/**
 * Generate SHA-256 hash of file for integrity verification
 * @param buffer File buffer
 * @returns SHA-256 hash (hex string)
 */
export function hashFile(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Generate a random encryption key (for initial setup)
 * Run this once and store the result in your .env file
 * @returns 32-byte hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
