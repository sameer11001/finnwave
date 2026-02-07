import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../schemas/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let errors:
      | Array<{ field?: string; message: string; code?: string }>
      | undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;

      if (responseObj.message) {
        if (Array.isArray(responseObj.message)) {
          // class-validator returns an array of error messages
          errors = responseObj.message.map((msg: string) => {
            // Parse field name from message if possible
            const fieldMatch = msg.match(/^(\w+)\s/);
            return {
              message: msg,
              field: fieldMatch ? fieldMatch[1] : undefined,
            };
          });
          message = responseObj.error || 'Validation failed';
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message;
        }
      }

      // Handle custom error format
      if (responseObj.errors && Array.isArray(responseObj.errors)) {
        errors = responseObj.errors;
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
