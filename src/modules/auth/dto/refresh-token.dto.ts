import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: '7Kj9mP3xQ8rT2vW5yZ1aB4cD6eF8gH0iJ',
    description: 'The refresh token received from login',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
