import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const isProduction = process.env.NODE_ENV === 'production';

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : exception instanceof Error
          ? exception.message
          : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (!isProduction && exception instanceof Error) {
      errorResponse.errors = [
        {
          message: exception.stack || exception.message,
          code: 'INTERNAL_ERROR',
        },
      ];
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}
