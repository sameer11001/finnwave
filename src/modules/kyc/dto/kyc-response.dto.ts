import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  KycStatus,
  KycDocumentType,
  MediaStatus,
} from '@prisma/client';

export class KycDocumentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ enum: KycDocumentType, example: KycDocumentType.PASSPORT })
  documentType: KycDocumentType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  mediaId: string;

  @ApiPropertyOptional({ example: 'P1234567' })
  documentNumber?: string;

  @ApiPropertyOptional({ example: '2030-12-31T00:00:00Z' })
  expiryDate?: Date;

  @ApiPropertyOptional({ example: 'US' })
  issuingCountry?: string;

  @ApiProperty({ example: '2024-02-05T15:30:00Z' })
  createdAt: Date;

  // Media information
  @ApiProperty({ example: 'passport.pdf' })
  fileName: string;

  @ApiProperty({ example: 1024000 })
  fileSize: number;

  @ApiProperty({ enum: MediaStatus, example: MediaStatus.PENDING })
  status: MediaStatus;
}

export class KycSubmissionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  userId: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Michael' })
  middleName?: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '1990-01-15T00:00:00Z' })
  dateOfBirth: Date;

  @ApiProperty({ example: 'US' })
  nationality: string;

  @ApiProperty({ example: '123 Main Street' })
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  addressLine2?: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiPropertyOptional({ example: 'NY' })
  state?: string;

  @ApiProperty({ example: '10001' })
  postalCode: string;

  @ApiProperty({ example: 'US' })
  country: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.PENDING })
  status: KycStatus;

  @ApiProperty({ example: '2024-02-05T15:30:00Z' })
  submittedAt: Date;

  @ApiPropertyOptional({ example: '2024-02-05T16:00:00Z' })
  reviewedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174003' })
  reviewedBy?: string;

  @ApiPropertyOptional({ example: 'Document quality is poor' })
  rejectionReason?: string;

  @ApiProperty({ type: [KycDocumentResponseDto] })
  documents: KycDocumentResponseDto[];
}

export class KycStatusResponseDto {
  @ApiProperty({ enum: KycStatus, example: KycStatus.PENDING })
  status: KycStatus;

  @ApiProperty({ example: true })
  hasSubmission: boolean;

  @ApiPropertyOptional({ example: '2024-02-05T15:30:00Z' })
  submittedAt?: Date;

  @ApiPropertyOptional({ example: '2024-02-05T16:00:00Z' })
  reviewedAt?: Date;

  @ApiPropertyOptional({ example: 'Document quality is poor' })
  rejectionReason?: string;

  @ApiProperty({ example: 2 })
  documentsCount: number;
}

export class KycListResponseDto {
  @ApiProperty({ type: [KycSubmissionResponseDto] })
  data: KycSubmissionResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
