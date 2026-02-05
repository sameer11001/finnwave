import {
  IsEnum,
  IsString,
  IsNotEmpty,
  ValidateIf,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewKycDto {
  @ApiProperty({
    enum: ReviewAction,
    example: ReviewAction.APPROVE,
    description: 'Review action',
  })
  @IsEnum(ReviewAction)
  @IsNotEmpty()
  action: ReviewAction;

  @ApiPropertyOptional({
    example: 'Document quality is poor, please resubmit',
    description: 'Rejection reason (required if action is REJECT)',
    minLength: 10,
  })
  @ValidateIf((o) => o.action === ReviewAction.REJECT)
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  rejectionReason?: string;
}
