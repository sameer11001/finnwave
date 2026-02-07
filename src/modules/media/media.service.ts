import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaRepository } from './media.repository';
import { IStorageService } from '../../infrastructure/storage/storage.interface';
import { AuditService } from '../../core/services/audit.service';
import {
  Media,
  MediaType,
} from '@prisma/client';
import { UploadMediaDto } from './dto/upload-media.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { MediaResponseDto, MediaListResponseDto } from './dto/media-response.dto';
import { Request } from 'express';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  constructor(
    private readonly mediaRepository: MediaRepository,
    @Inject('STORAGE_SERVICE')
    private readonly storageService: IStorageService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize =
      this.configService.get<number>('MEDIA_MAX_FILE_SIZE') || 10485760; // 10MB default
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadMediaDto: UploadMediaDto,
    userId: string,
    req: Request,
  ): Promise<MediaResponseDto> {
    // Validate file
    this.validateFile(file);

    // Determine media type from MIME type
    const type = this.getMimeTypeCategory(file.mimetype);

    try {
      // Upload to storage
      const storageResult = await this.storageService.uploadFile(
        file,
        uploadMediaDto.category,
        userId,
      );

      // Create media record
      const media = await this.mediaRepository.create({
        uploader: { connect: { id: userId } },
        category: uploadMediaDto.category,
        type,
        originalFileName: file.originalname,
        fileSize: storageResult.fileSize,
        mimeType: storageResult.mimeType,
        encryptedPath: storageResult.encryptedPath,
        fileHash: storageResult.fileHash,
        metadata: {
          ...uploadMediaDto.metadata,
          iv: storageResult.iv,
          tag: storageResult.tag,
        },
      });

      // Audit log
      await this.auditService.log(
        'MEDIA_UPLOAD',
        'MEDIA',
        userId,
        media.id,
        userId,
        {
          category: uploadMediaDto.category,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
        req,
      );

      this.logger.log(`Media uploaded: ${media.id} by user ${userId}`);

      return this.toResponseDto(media);
    } catch (error) {
      this.logger.error(`Failed to upload media: ${error.message}`, error.stack);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async getMedia(id: string, userId: string, isAdmin: boolean): Promise<Media> {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check access permissions
    if (!isAdmin && media.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have access to this media');
    }

    return media;
  }

  async downloadMedia(
    id: string,
    userId: string,
    isAdmin: boolean,
    req: Request,
  ): Promise<{ buffer: Buffer; media: Media }> {
    const media = await this.getMedia(id, userId, isAdmin);

    try {
      // Extract IV and tag from metadata
      const iv = (media.metadata as any)?.iv;
      const tag = (media.metadata as any)?.tag;

      if (!iv || !tag) {
        throw new Error('Missing encryption metadata');
      }

      // Get file from storage
      const buffer = await (this.storageService as any).getFileWithMetadata(
        media.encryptedPath,
        iv,
        tag,
      );

      // Audit log
      await this.auditService.log(
        'MEDIA_ACCESS',
        'MEDIA',
        media.uploadedBy,
        media.id,
        userId,
        {
          category: media.category,
          fileName: media.originalFileName,
        },
        req,
      );

      return { buffer, media };
    } catch (error) {
      this.logger.error(`Failed to download media: ${error.message}`, error.stack);
      throw new BadRequestException(`File download failed: ${error.message}`);
    }
  }

  async listUserMedia(
    userId: string,
    listMediaDto: ListMediaDto,
  ): Promise<MediaListResponseDto> {
    const skip = ((listMediaDto.page || 1) - 1) * (listMediaDto.limit || 10);

    const { data, total } = await this.mediaRepository.findByUser(userId, {
      category: listMediaDto.category,
      type: listMediaDto.type,
      skip,
      take: listMediaDto.limit,
    });

    return {
      data: data.map((media) => this.toResponseDto(media)),
      total,
      page: listMediaDto.page || 1,
      limit: listMediaDto.limit || 10,
    };
  }

  async deleteMedia(
    id: string,
    userId: string,
    isAdmin: boolean,
    req: Request,
  ): Promise<void> {
    const media = await this.getMedia(id, userId, isAdmin);

    // Soft delete (archive)
    await this.mediaRepository.delete(id);

    // Audit log
    await this.auditService.log(
      'MEDIA_DELETE',
      'MEDIA',
      media.uploadedBy,
      media.id,
      userId,
      {
        category: media.category,
        fileName: media.originalFileName,
      },
      req,
    );

    this.logger.log(`Media archived: ${id} by user ${userId}`);
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize} bytes`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private getMimeTypeCategory(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType === 'application/pdf') return MediaType.PDF;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  }

  private toResponseDto(media: Media): MediaResponseDto {
    return {
      id: media.id,
      category: media.category,
      type: media.type,
      originalFileName: media.originalFileName,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      uploadedAt: media.uploadedAt,
      verifiedAt: media.verifiedAt ?? undefined,
      verifiedBy: media.verifiedBy ?? undefined,
      rejectionReason: media.rejectionReason ?? undefined,
      metadata: media.metadata as Record<string, any>,
      uploadedBy: media.uploadedBy,
    };
  }
}
