import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';


@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          statusCode,
          message: this.getDefaultMessage(statusCode),
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Operation successful';
      case 201:
        return 'Resource created successfully';
      case 204:
        return 'Resource deleted successfully';
      default:
        return 'Success';
    }
  }
}
