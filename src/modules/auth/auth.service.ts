import {
  Injectable,
  ConflictException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResponseBuilder } from '../../common/schemas/response-builder.util';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { RevocationReason, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/postgres/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(body_request: RegisterUserDto) {
    const existingUser = await this.userService.findByEmail(body_request.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const existingUserByPhone = await this.userService.findByPhone(
      body_request.phoneNumber,
    );
    if (existingUserByPhone) {
      throw new ConflictException('User with this phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(body_request.password, 10);

    const userData = {
      email: body_request.email,
      passwordHash: hashedPassword,
      fullName: body_request.fullName,
      phone: body_request.phoneNumber,
    };

    const user = await this.userService.create(userData);

    const { passwordHash, ...userWithoutPassword } = user;

    return ResponseBuilder.success(
      userWithoutPassword,
      'User registered successfully',
      HttpStatus.CREATED,
    );
  }

  async login(
    body_request: LoginUserDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // 1. Validate credentials
    const user = await this.userService.findByEmail(body_request.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      body_request.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }

    // 2. Create session
    const session = await this.sessionService.createSession({
      userId: user.id,
      ipAddress,
      userAgent,
    });

    // 3. Generate refresh token
    const refreshToken = this.tokenService.generateRefreshToken();
    const tokenHash = await this.tokenService.hashRefreshToken(refreshToken);

    // 4. Store refresh token
    const tokenFamily = crypto.randomUUID(); // New token family for this login
    await this.prisma.refreshToken.create({
      data: {
        sessionId: session.id,
        tokenHash,
        tokenFamily,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // 5. Generate access token
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      sid: session.id,
      role: user.role?.name,
  });

    return ResponseBuilder.success(
      {
        accessToken,
        refreshToken,
      },
      'Login successful',
      HttpStatus.OK,
    );
  }

  async refresh(refreshToken: string) {
    try {
      const result = await this.tokenService.rotateRefreshToken(refreshToken);

      return ResponseBuilder.success(
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        'Token refreshed successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid refresh token');
    }
  }

  async logout(sessionId: string) {
    await this.sessionService.revokeSession(
      sessionId,
      RevocationReason.USER_LOGOUT,
    );

    return ResponseBuilder.success(null, 'Logout successful', HttpStatus.OK);
  }

  async changePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Revoke all sessions for security
    await this.sessionService.revokeAllUserSessions(
      userId,
      RevocationReason.PASSWORD_CHANGE,
    );

    return ResponseBuilder.success(
      null,
      'Password changed successfully. Please login again.',
      HttpStatus.OK,
    );
  }

}