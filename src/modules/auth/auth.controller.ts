import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto  } from './dto/auth-registeration.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
@Post('register')
async registerUser(@Body() dto:RegisterAuthDto ){
  return this.authService.register(dto);
}

}
