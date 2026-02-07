import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageService, StorageResult } from './storage.interface';
import {
  encryptFile,
  decryptFile,
  encryptPath,
  decryptPath,
  hashFile,
} from '../../core/utils/encryption.util';
import { MediaCategory } from '@prisma/client';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly storagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath =
      this.configService.get<string>('MEDIA_STORAGE_PATH') ||
      '/var/finnwave/media';
  }

  /**
   * Upload file to local storage with encryption
   */
  async uploadFile(
    file: Express.Multer.File,
    category: MediaCategory,
    userId: string,
  ): Promise<StorageResult> {
    try {
      // Generate unique file ID
      const fileId = this.generateFileId();

      // Create category and user directories
      const categoryPath = this.getCategoryPath(category);
      const userPath = path.join(categoryPath, userId);
      await this.ensureDirectoryExists(userPath);

      // Encrypt file
      const { encrypted, iv, tag } = encryptFile(file.buffer);

      // Generate file hash before encryption
      const fileHash = hashFile(file.buffer);

      // Save encrypted file
      const fileName = `${fileId}.enc`;
      const filePath = path.join(userPath, fileName);
      await fs.writeFile(filePath, encrypted);

      // Encrypt path for database storage
      const encryptedPath = encryptPath(filePath);

      this.logger.log(
        `File uploaded successfully: ${file.originalname} (${fileHash})`,
      );

      return {
        encryptedPath,
        fileHash,
        fileSize: file.size,
        mimeType: file.mimetype,
        iv,
        tag,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Get file from storage and decrypt
   */
  async getFile(encryptedPath: string): Promise<Buffer> {
    try {
      // Decrypt path
      const filePath = decryptPath(encryptedPath);

      // Read encrypted file
      const encrypted = await fs.readFile(filePath);

      // Extract IV and tag from metadata (stored separately in DB)
      // For now, we'll need to get these from the Media record
      // This is a simplified version - in practice, pass iv and tag as parameters
      throw new Error(
        'getFile needs iv and tag parameters - update interface',
      );
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get file with IV and tag for decryption
   */
  async getFileWithMetadata(
    encryptedPath: string,
    iv: string,
    tag: string,
  ): Promise<Buffer> {
    try {
      // Decrypt path
      const filePath = decryptPath(encryptedPath);

      // Read encrypted file
      const encrypted = await fs.readFile(filePath);

      // Decrypt file
      const decrypted = decryptFile(encrypted, iv, tag);

      return decrypted;
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(encryptedPath: string): Promise<void> {
    try {
      // Decrypt path
      const filePath = decryptPath(encryptedPath);

      // Delete file
      await fs.unlink(filePath);

      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file URL (for local storage, returns the encrypted path)
   * In cloud storage implementation, this would return a signed URL
   */
  async getFileUrl(
    encryptedPath: string,
    expiresIn?: number,
  ): Promise<string> {
    // For local storage, we don't generate URLs
    // Files are served through the API with proper authentication
    return encryptedPath;
  }

  /**
   * Get category-based path
   */
  private getCategoryPath(category: MediaCategory): string {
    const categoryFolder = category.toLowerCase().replace(/_/g, '-');
    return path.join(this.storagePath, categoryFolder);
  }

  /**
   * Ensure directory exists, create if not
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
