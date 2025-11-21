import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config/env';

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// COMMON ERROR TYPES
// ============================================================================

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
    isOperational = true;
  }

  // Database errors
  if (err.name === 'PostgresError' || (err as any).code?.startsWith('23')) {
    statusCode = 400;
    isOperational = true;

    // Unique constraint violation
    if ((err as any).code === '23505') {
      message = 'Duplicate entry: Resource already exists';
    }

    // Foreign key violation
    if ((err as any).code === '23503') {
      message = 'Referenced resource does not exist';
    }

    // Not null violation
    if ((err as any).code === '23502') {
      message = 'Required field missing';
    }
  }

  // Log error
  if (!isOperational || statusCode >= 500) {
    logger.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      user: (req as any).user?.id,
    });
  } else {
    logger.warn('Operational error:', {
      message: err.message,
      statusCode,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      details: err.message,
    }),
  });
};

// ============================================================================
// NOT FOUND HANDLER
// ============================================================================

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// ============================================================================
// ASYNC HANDLER WRAPPER
// ============================================================================

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
