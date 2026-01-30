import { Injectable, ConflictException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResponseBuilder } from '../../common/utils/response-builder.util';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService, private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

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
  async login(body_request: LoginUserDto) {
    const LogUser = await this.userService.findByEmail(body_request.email);
    if (!LogUser) {
      throw new UnauthorizedException('invalid username');
    }
    const isPasswordValid = await bcrypt.compare(body_request.password, LogUser.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('invalid password');
    }
  const payload: JWTPayloadType = {email: LogUser.email, sub: LogUser.id};
  const token = await this.jwtService.sign(payload);

  const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_JWT_EXPIRES_IN'),

    } as JwtSignOptions,);
  return ResponseBuilder.success(
      { access_token: token, refresh_token: refreshToken },
      'login successful',
      HttpStatus.OK,
    );

}}