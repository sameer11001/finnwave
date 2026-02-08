import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLoggerService } from '../services/logger.service';
import { sanitizeHeaders, sanitizeRequestBody, sanitizeResponseBody } from '../utils/log-sanitizer.util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: CustomLoggerService;
  private readonly logRequests: boolean;

  constructor() {
    this.logger = new CustomLoggerService();
    this.logger.setContext('HTTP');
    this.logRequests = process.env.LOG_REQUESTS !== 'false'; // Default to true
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.logRequests) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const { method, url, headers, body, ip } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const startTime = Date.now();
    
    // Generate or extract request ID
    const requestId = headers['x-request-id'] as string || this.generateRequestId();
    
    // Log incoming request
    this.logger.logRequest(method, url, {
      requestId,
      ip,
      userAgent,
      headers: this.logger.isDebugEnabled() ? sanitizeHeaders(headers) : undefined,
      body: this.logger.isDebugEnabled() ? sanitizeRequestBody(body) : undefined,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          
          // Log successful response
          this.logger.logResponse(method, url, statusCode, duration, {
            requestId,
            responseBody: this.logger.isDebugEnabled() ? sanitizeResponseBody(data) : undefined,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          // Log error response
          this.logger.logResponse(method, url, statusCode, duration, {
            requestId,
            error: error.message,
            stack: this.logger.isDebugEnabled() ? error.stack : undefined,
          });
        },
      }),
    );
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
