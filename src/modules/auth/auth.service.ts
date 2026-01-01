import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/auth-registeration.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

  constructor(private readonly userService: UsersService) {}

  async register(dto : RegisterAuthDto ){
     const exit = awai 
  }
}
