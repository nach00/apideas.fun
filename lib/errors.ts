/**
 * Error handling utilities for consistent error management across the application
 */

import { AppError } from '@/types';

export class ApplicationError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Ensures proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Predefined error codes
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation errors  
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Business logic errors
  INSUFFICIENT_COINS: 'INSUFFICIENT_COINS',
  CARD_GENERATION_FAILED: 'CARD_GENERATION_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CARD_NOT_FOUND: 'CARD_NOT_FOUND',

  // External service errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  PAYMENT_PROCESSING_ERROR: 'PAYMENT_PROCESSING_ERROR',

  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// Error factory functions
export const createAuthError = (message = 'Authentication required') =>
  new ApplicationError(ErrorCodes.UNAUTHORIZED, message);

export const createValidationError = (message: string, details?: Record<string, unknown>) =>
  new ApplicationError(ErrorCodes.VALIDATION_ERROR, message, details);

export const createInsufficientCoinsError = (required: number, current: number) =>
  new ApplicationError(
    ErrorCodes.INSUFFICIENT_COINS,
    `Insufficient coins. Required: ${required}, Current: ${current}`,
    { required, current }
  );

export const createNotFoundError = (resource: string, id?: string) =>
  new ApplicationError(
    ErrorCodes.USER_NOT_FOUND,
    `${resource} not found${id ? ` with id: ${id}` : ''}`,
    { resource, id }
  );

// Error response helper for API routes
export const createErrorResponse = (error: ApplicationError | Error) => {
  if (error instanceof ApplicationError) {
    return {
      success: false,
      error: error.toJSON(),
      message: error.message,
    };
  }

  // Handle unknown errors
  return {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
    message: 'An unexpected error occurred',
  };
};

// Type guard
export const isApplicationError = (error: unknown): error is ApplicationError =>
  error instanceof ApplicationError;

// Safe error logging
export const logError = (error: unknown, context?: string) => {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '';
  
  if (isApplicationError(error)) {
    console.error(`${timestamp} ${prefix} ApplicationError:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack,
    });
  } else if (error instanceof Error) {
    console.error(`${timestamp} ${prefix} Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`${timestamp} ${prefix} Unknown error:`, error);
  }
};

// Error boundary helper
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<[T | null, ApplicationError | null]> => {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    logError(error, context);
    
    if (isApplicationError(error)) {
      return [null, error];
    }
    
    // Convert unknown errors to ApplicationError
    const appError = new ApplicationError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    
    return [null, appError];
  }
};