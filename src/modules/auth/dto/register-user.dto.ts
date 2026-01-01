import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  minLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
    minLength: 8,
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  @IsPhoneNumber()
  phoneNumber: string;
}
