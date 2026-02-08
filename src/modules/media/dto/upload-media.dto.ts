import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaCategory } from '@prisma/client';

export class UploadMediaDto {
  @ApiProperty({
    enum: MediaCategory,
    description: 'Category of the media file',
    example: MediaCategory.KYC_DOCUMENT,
  })
  @IsEnum(MediaCategory)
  category: MediaCategory;

}
