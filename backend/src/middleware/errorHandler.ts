import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

class ErrorLogger {
  static async logError(error: AppError, req: Request) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      timestamp: new Date()
    };

    console.error('Application Error:', errorData);

    // Store critical errors in database
    if (!error.isOperational || (error.statusCode && error.statusCode >= 500)) {
      try {
        await prisma.errorLog.create({ 
          data: {
            message: error.message,
            stack: error.stack || '',
            level: 'ERROR',
            context: errorData
          }
        });
      } catch (dbError) {
        console.error('Failed to log error to database:', dbError);
      }
    }
  }
}

export const errorHandler = async (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  await ErrorLogger.logError(err, req);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    error: true,
    message: err.isOperational ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && {
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: true,
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  isOperational = true;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}