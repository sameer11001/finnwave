import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'User registered successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
          },
        },
        timestamp: { type: 'string', example: '2026-01-01T19:23:30.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'email' },
              message: { type: 'string', example: 'email must be an email' },
            },
          },
        },
        timestamp: { type: 'string', example: '2026-01-01T19:23:30.000Z' },
        path: { type: 'string', example: '/auth/register' },
      },
    },
  })
  async registerUser(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }
}
