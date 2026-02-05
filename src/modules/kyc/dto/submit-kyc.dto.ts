import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsISO31661Alpha2,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmitKycDto {
  @ApiProperty({ example: 'John', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiPropertyOptional({ example: 'Michael', minLength: 2, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  middleName?: string;

  @ApiProperty({ example: 'Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Date of birth (must be 18+ years old)',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    example: 'US',
    description: 'ISO 3166-1 alpha-2 country code',
  })
  @IsString()
  @IsNotEmpty()
  @IsISO31661Alpha2()
  nationality: string;

  @ApiProperty({ example: '123 Main Street', minLength: 5, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apt 4B', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  addressLine2?: string;

  @ApiProperty({ example: 'New York', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: 'NY', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ example: '10001', minLength: 3, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({
    example: 'US',
    description: 'ISO 3166-1 alpha-2 country code',
  })
  @IsString()
  @IsNotEmpty()
  @IsISO31661Alpha2()
  country: string;
}
