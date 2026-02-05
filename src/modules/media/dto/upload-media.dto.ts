import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaCategory } from '../../../generated/client/client';

export class UploadMediaDto {
  @ApiProperty({
    enum: MediaCategory,
    description: 'Category of the media file',
    example: MediaCategory.KYC_DOCUMENT,
  })
  @IsEnum(MediaCategory)
  category: MediaCategory;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON',
    example: { description: 'Passport front page' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
