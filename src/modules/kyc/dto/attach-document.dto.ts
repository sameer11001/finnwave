import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycDocumentType } from '../../../generated/client/client';

export class AttachDocumentDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Media ID of the uploaded file',
  })
  @IsUUID()
  @IsNotEmpty()
  mediaId: string;

  @ApiProperty({
    enum: KycDocumentType,
    example: KycDocumentType.PASSPORT,
    description: 'Type of KYC document',
  })
  @IsEnum(KycDocumentType)
  @IsNotEmpty()
  documentType: KycDocumentType;

  @ApiPropertyOptional({
    example: 'P1234567',
    description: 'Document number (e.g., passport number, ID number)',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  documentNumber?: string;

  @ApiPropertyOptional({
    example: '2030-12-31',
    description: 'Document expiry date',
  })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({
    example: 'US',
    description: 'Issuing country (ISO 3166-1 alpha-2)',
    maxLength: 2,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2)
  issuingCountry?: string;
}
