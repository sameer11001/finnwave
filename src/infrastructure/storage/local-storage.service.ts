import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageService, StorageResult } from './storage.interface';
import { hashFile } from '../../core/utils/encryption.util';
import { MediaCategory } from '@prisma/client';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly storagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath = './uploads/temp'; // For local storage, we use a temp folder. In production, this should be configurable.
  }

  /**
   * Upload file to local storage (simplified - no encryption)
   */
  async uploadFile(
    file: Express.Multer.File,
    category: MediaCategory,
    userId: string,
  ): Promise<StorageResult> {
    try {
      this.logger.log(
        `Upload request - UserId: ${userId}, File: ${file.originalname}`,
      );

      // Generate unique file ID
      const fileId = this.generateFileId();

      // Create category and user directories
      const categoryPath = this.getCategoryPath(category);
      const userPath = path.join(categoryPath, userId);
      await this.ensureDirectoryExists(userPath);

      // Save file directly (no encryption)
      const fileName = `${fileId}${path.extname(file.originalname)}`;
      const filePath = path.join(userPath, fileName);

      await fs.writeFile(filePath, file.buffer);

      // Generate file hash for integrity
      const fileHash = hashFile(file.buffer);

      this.logger.log(
        `File uploaded successfully: ${file.originalname} to ${filePath}`,
      );

      return {
        encryptedPath: filePath, // Not encrypted anymore, just the path
        fileHash,
        fileSize: file.size,
        mimeType: file.mimetype,
        iv: '', // Not used anymore
        tag: '', // Not used anymore
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Get file from storage (simplified - no decryption)
   */
  async getFile(filePath: string): Promise<Buffer> {
    try {
      // Read file directly
      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer;
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get file with IV and tag for decryption (simplified - no decryption)
   */
  async getFileWithMetadata(
    filePath: string,
    iv: string,
    tag: string,
  ): Promise<Buffer> {
    try {
      // Read file directly (no decryption)
      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer;
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new Error(`File retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete file from storage (simplified)
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
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
  async getFileUrl(encryptedPath: string, expiresIn?: number): Promise<string> {
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
