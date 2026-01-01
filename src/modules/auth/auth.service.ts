import { Injectable, ConflictException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResponseBuilder } from '../../common/utils/response-builder.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

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
}
