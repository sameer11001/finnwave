import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorators';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const canActivate = super.canActivate(context);

    if (canActivate instanceof Promise || canActivate instanceof Observable) {
      return canActivate;
    }

    if (canActivate) {
      const roles = this.reflector.get(Roles, context.getHandler());

      if (!roles || roles.length === 0) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user || !user.role) {
        throw new ForbiddenException('Access denied: No user role found');
      }

      if (!roles.includes(user.role)) {
        throw new ForbiddenException('User role not authorized');
      }
    }

    return canActivate;
  }
}
