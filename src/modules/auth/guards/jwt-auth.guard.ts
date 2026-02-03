import { Injectable,CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorators';
import { JwtService } from '@nestjs/jwt';
import { session } from 'passport';
import { DateHelper } from 'src/common/utils/date_helper';

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
    async function verifyToken(token: string): Promise<any> {
      const hashedToken = this.hashedToken(token);
      const dbrefreshToken = this.prisma.refreshToken.findUnique({
        where: { tokenHash: hashedToken },
        include: { session: true },
        },
    );
    if(!dbrefreshToken){
      throw new ForbiddenException('Access denied: Invalid token');
    }
    if(dbrefreshToken.expiryDate < DateHelper.localToUTC()){
      throw new ForbiddenException('Access denied: Token expired');     
    }
    if(dbrefreshToken.usedAt){
      throw new ForbiddenException('Access denied: Token already used');}
    return dbrefreshToken;
  }
      if (!roles.includes(user.role)) {
        throw new ForbiddenException('User role not authorized');
      }

    return true;
  }
}