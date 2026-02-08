/**
 * Utility functions for sanitizing sensitive data from logs
 */

const SENSITIVE_FIELDS = [
  'password',
  'passwordConfirm',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'apiKey',
  'secret',
  'creditCard',
  'cvv',
  'ssn',
  'pin',
];

/**
 * Masks sensitive string values
 */
export function maskSensitiveValue(value: string): string {
  if (!value || value.length === 0) return '[EMPTY]';
  if (value.length <= 4) return '***';
  
  // Show first 2 and last 2 characters
  const firstTwo = value.substring(0, 2);
  const lastTwo = value.substring(value.length - 2);
  return `${firstTwo}***${lastTwo}`;
}

/**
 * Recursively sanitizes an object by masking sensitive fields
 */
export function sanitizeObject(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) return '[MAX_DEPTH]';
  
  if (obj === null || obj === undefined) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Check if this is a sensitive field
      const isSensitive = SENSITIVE_FIELDS.some(field => 
        lowerKey.includes(field.toLowerCase())
      );
      
      if (isSensitive && typeof value === 'string') {
        sanitized[key] = maskSensitiveValue(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitizes HTTP headers by masking authorization and sensitive headers
 */
export function sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey === 'authorization' || lowerKey === 'cookie') {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitizes request body for logging
 */
export function sanitizeRequestBody(body: any): any {
  if (!body) return body;
  return sanitizeObject(body);
}

/**
 * Sanitizes response body for logging
 */
export function sanitizeResponseBody(body: any): any {
  if (!body) return body;
  return sanitizeObject(body);
}

/**
 * Masks email addresses (shows first 2 chars and domain)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? `${local.substring(0, 2)}***` 
    : '***';
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Masks phone numbers (shows last 4 digits)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return '***';
  
  const lastFour = phone.substring(phone.length - 4);
  return `***-***-${lastFour}`;
}
