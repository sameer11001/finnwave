import { MediaCategory } from '@prisma/client';

export interface IStorageService {
  /**
   * Upload a file to storage
   * @param file Multer file object
   * @param category Media category for organization
   * @param userId User ID for folder organization
   * @returns Storage result with encrypted path and hash
   */
  uploadFile(
    file: Express.Multer.File,
    category: MediaCategory,
    userId: string,
  ): Promise<StorageResult>;

  /**
   * Get file from storage
   * @param encryptedPath Encrypted file path from database
   * @returns Decrypted file buffer
   */
  getFile(encryptedPath: string): Promise<Buffer>;

  /**
   * Delete file from storage
   * @param encryptedPath Encrypted file path from database
   */
  deleteFile(encryptedPath: string): Promise<void>;

  /**
   * Get temporary URL for file access (for future cloud storage)
   * @param encryptedPath Encrypted file path
   * @param expiresIn Expiration time in seconds
   * @returns Temporary URL or file path
   */
  getFileUrl(encryptedPath: string, expiresIn?: number): Promise<string>;
}

export interface StorageResult {
  /** Encrypted file path for database storage */
  encryptedPath: string;
  
  /** SHA-256 hash of original file for integrity */
  fileHash: string;
  
  /** File size in bytes */
  fileSize: number;
  
  /** MIME type of the file */
  mimeType: string;
  
  /** Initialization vector for decryption */
  iv: string;
  
  /** Authentication tag for decryption */
  tag: string;
}
