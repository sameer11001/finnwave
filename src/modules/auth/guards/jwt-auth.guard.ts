import { Injectable,CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorators';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {
    super();
  }
  canActivate(context: ExecutionContext): boolean {
      const roles = this.reflector.get(Roles, context.getHandler());
      if (!roles||roles.length===0) {
        return false;
      }
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if(!user||!user.role){
        throw new ForbiddenException('Access denied: No user role found');
      }
      if (!roles.includes(user.role)) {
        throw new ForbiddenException('User role not authorized');
      }

    return true;
  }
}