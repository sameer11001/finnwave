import { HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationMeta,
} from '../interfaces/api-response.interface';


export class ResponseBuilder {
  /**
   * Build a success response
   * @param data - The response data
   * @param message - Success message
   * @param statusCode - HTTP status code (default: 200)
   */
  static success<T>(
    data: T,
    message = 'Operation successful',
    statusCode = HttpStatus.OK,
  ): ApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Build an error response
   * @param message - Error message
   * @param errors - Array of detailed errors
   * @param statusCode - HTTP status code (default: 400)
   * @param path - Request path
   */
  static error(
    message: string,
    errors?: Array<{ field?: string; message: string; code?: string }>,
    statusCode = HttpStatus.BAD_REQUEST,
    path?: string,
  ): ApiErrorResponse {
    return {
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Build a paginated response
   * @param data - Array of items
   * @param meta - Pagination metadata
   * @param message - Success message
   */
  static paginated<T>(
    data: T[],
    meta: PaginationMeta,
    message = 'Data retrieved successfully',
  ): PaginatedResponse<T> {
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate pagination metadata
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   */
  static calculatePaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
