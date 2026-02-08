import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../services/logger.service';

/**
 * Middleware to add request context and tracking
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger: CustomLoggerService;

  constructor() {
    this.logger = new CustomLoggerService();
    this.logger.setContext('Middleware');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Generate request ID if not present
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = this.generateRequestId();
    }

    // Add request ID to response headers
    res.setHeader('X-Request-ID', req.headers['x-request-id'] as string);

    // Log request start in debug mode
    if (this.logger.isDebugEnabled()) {
      this.logger.debug(`Request started: ${req.method} ${req.url}`, {
        requestId: req.headers['x-request-id'] as string,
        ip: req.ip,
      });
    }

    next();
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
