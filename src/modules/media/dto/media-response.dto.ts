import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MediaCategory,
  MediaStatus,
  MediaType,
} from '@prisma/client';

export class MediaResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ enum: MediaCategory, example: MediaCategory.KYC_DOCUMENT })
  category: MediaCategory;

  @ApiProperty({ enum: MediaType, example: MediaType.PDF })
  type: MediaType;

  @ApiProperty({ enum: MediaStatus, example: MediaStatus.PENDING })
  status: MediaStatus;

  @ApiProperty({ example: 'passport.pdf' })
  originalFileName: string;

  @ApiProperty({ example: 1024000 })
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: '2024-02-05T15:30:00Z' })
  uploadedAt: Date;

  @ApiPropertyOptional({ example: '2024-02-05T16:00:00Z' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  verifiedBy?: string;

  @ApiPropertyOptional({ example: 'Document is blurry' })
  rejectionReason?: string;

  @ApiPropertyOptional({ example: { description: 'Passport front page' } })
  metadata?: Record<string, any>;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  uploadedBy: string;
}

export class MediaListResponseDto {
  @ApiProperty({ type: [MediaResponseDto] })
  data: MediaResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
