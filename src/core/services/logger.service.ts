import { Injectable, LoggerService as NestLoggerService, LogLevel } from '@nestjs/common';
import { sanitizeObject } from '../utils/log-sanitizer.util';

export enum LogContext {
  APPLICATION = 'Application',
  HTTP = 'HTTP',
  DATABASE = 'Database',
  AUTH = 'Auth',
  KYC = 'KYC',
  MEDIA = 'Media',
  AUDIT = 'Audit',
  WEBHOOK = 'Webhook',
}

interface LogMetadata {
  context?: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  private logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
  private context: string = 'Application';
  private isDebugMode: boolean;
  private isPrettyMode: boolean;

  constructor() {
    this.isDebugMode = this.determineDebugMode();
    this.isPrettyMode = process.env.LOG_PRETTY === 'true';
    this.autoConfigureLogLevels();
  }

  /**
   * Determine if debug mode should be enabled
   */
  private determineDebugMode(): boolean {
    const nodeEnv = process.env.NODE_ENV;
    const logLevel = process.env.LOG_LEVEL?.toLowerCase();

    // Enable debug in development or when explicitly set
    if (nodeEnv === 'development') return true;
    if (logLevel === 'debug' || logLevel === 'verbose') return true;

    return false;
  }

  /**
   * Set log levels based on environment
   */
  setLogLevels(levels: LogLevel[]): void {
    this.logLevels = levels;
  }

  /**
   * Auto-configure log levels based on environment
   */
  private autoConfigureLogLevels(): void {
    const logLevel = process.env.LOG_LEVEL?.toLowerCase();
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv === 'production' && !logLevel) {
      // Production: only log, warn, error
      this.logLevels = ['log', 'warn', 'error'];
    } else if (logLevel === 'error') {
      this.logLevels = ['error'];
    } else if (logLevel === 'warn') {
      this.logLevels = ['error', 'warn'];
    } else if (logLevel === 'info' || logLevel === 'log') {
      this.logLevels = ['log', 'error', 'warn'];
    } else if (logLevel === 'debug') {
      this.logLevels = ['log', 'error', 'warn', 'debug'];
    } else if (logLevel === 'verbose') {
      this.logLevels = ['log', 'error', 'warn', 'debug', 'verbose'];
    }
  }

  /**
   * Set context for this logger instance
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Format log message with metadata
   */
  private formatMessage(message: string, metadata?: LogMetadata): string {
    if (!this.isPrettyMode && metadata && Object.keys(metadata).length > 0) {
      const sanitized = sanitizeObject(metadata);
      return `${message} ${JSON.stringify(sanitized)}`;
    }
    return message;
  }

  /**
   * Format metadata for pretty printing
   */
  private formatMetadata(metadata?: LogMetadata): string {
    if (!metadata || Object.keys(metadata).length === 0) return '';
    
    const sanitized = sanitizeObject(metadata);
    
    if (this.isPrettyMode) {
      return '\n' + JSON.stringify(sanitized, null, 2);
    }
    
    return '';
  }

  /**
   * Get timestamp string
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Core logging method
   */
  private writeLog(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    trace?: string,
  ): void {
    if (!this.logLevels.includes(level)) return;

    const timestamp = this.getTimestamp();
    const context = metadata?.context || this.context;
    const formattedMessage = this.formatMessage(message, metadata);
    const metadataStr = this.formatMetadata(metadata);

    const logPrefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;
    
    console.log(`${logPrefix} ${formattedMessage}${metadataStr}`);
    
    if (trace && this.isDebugMode) {
      console.log(`Stack Trace:\n${trace}`);
    }
  }

  /**
   * Log a message
   */
  log(message: string, metadata?: LogMetadata): void;
  log(message: string, context?: string): void;
  log(message: string, metadataOrContext?: LogMetadata | string): void {
    const metadata = typeof metadataOrContext === 'string' 
      ? { context: metadataOrContext }
      : metadataOrContext;
    
    this.writeLog('log', message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, trace?: string, metadata?: LogMetadata): void;
  error(message: string, trace?: string, context?: string): void;
  error(message: string, trace?: string, metadataOrContext?: LogMetadata | string): void {
    const metadata = typeof metadataOrContext === 'string'
      ? { context: metadataOrContext }
      : metadataOrContext;
    
    this.writeLog('error', message, metadata, trace);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata): void;
  warn(message: string, context?: string): void;
  warn(message: string, metadataOrContext?: LogMetadata | string): void {
    const metadata = typeof metadataOrContext === 'string'
      ? { context: metadataOrContext }
      : metadataOrContext;
    
    this.writeLog('warn', message, metadata);
  }

  /**
   * Log a debug message (only in debug mode)
   */
  debug(message: string, metadata?: LogMetadata): void;
  debug(message: string, context?: string): void;
  debug(message: string, metadataOrContext?: LogMetadata | string): void {
    if (!this.isDebugMode) return;
    
    const metadata = typeof metadataOrContext === 'string'
      ? { context: metadataOrContext }
      : metadataOrContext;
    
    this.writeLog('debug', message, metadata);
  }

  /**
   * Log a verbose message (only in debug mode)
   */
  verbose(message: string, metadata?: LogMetadata): void;
  verbose(message: string, context?: string): void;
  verbose(message: string, metadataOrContext?: LogMetadata | string): void {
    if (!this.isDebugMode) return;
    
    const metadata = typeof metadataOrContext === 'string'
      ? { context: metadataOrContext }
      : metadataOrContext;
    
    this.writeLog('verbose', message, metadata);
  }

  /**
   * Log HTTP request
   */
  logRequest(method: string, url: string, metadata?: LogMetadata): void {
    this.debug(`→ ${method} ${url}`, {
      ...metadata,
      context: LogContext.HTTP,
    });
  }

  /**
   * Log HTTP response
   */
  logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    metadata?: LogMetadata,
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
    const message = `← ${method} ${url} ${statusCode} ${duration}ms`;
    
    this.writeLog(level, message, {
      ...metadata,
      context: LogContext.HTTP,
      statusCode,
      duration,
    });
  }

  /**
   * Log database query (debug only)
   */
  logQuery(query: string, duration?: number, metadata?: LogMetadata): void {
    this.debug(`DB Query: ${query}`, {
      ...metadata,
      context: LogContext.DATABASE,
      duration,
    });
  }

  /**
   * Log performance metric
   */
  logPerformance(operation: string, duration: number, metadata?: LogMetadata): void {
    const level: LogLevel = duration > 1000 ? 'warn' : 'debug';
    this.writeLog(level, `Performance: ${operation} took ${duration}ms`, {
      ...metadata,
      duration,
    });
  }

  /**
   * Create a child logger with a specific context
   */
  createChildLogger(context: string): CustomLoggerService {
    const child = new CustomLoggerService();
    child.setContext(context);
    return child;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return this.isDebugMode;
  }
}
