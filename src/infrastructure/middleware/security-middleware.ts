import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../config/config';

export const createRateLimiter = () => {
  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      return req.path === '/health' || req.path === '/api/health';
    },
  });
};

/**
 * Auth rate limiting - stricter for login/register
 */
export const createAuthRateLimiter = () => {
  return rateLimit({
    windowMs: config.rateLimitAuthWindowMs,
    max: config.rateLimitAuthMaxRequests,
    message: {
      error: 'Too many login attempts',
      message: 'Too many login attempts, please try again in 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

/**
 * Security headers middleware
 */
export const createHelmetMiddleware = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
};

/**
 * CORS middleware
 */
export const createCorsMiddleware = () => {
  return cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
        : true,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'anonymous',
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logData));
  });

  next();
};

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  const sanitize = (obj: unknown): unknown => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const key in obj as Record<string, unknown>) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = sanitize((obj as Record<string, unknown>)[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body) as typeof req.body;
  }
  if (req.query) {
    req.query = sanitize(req.query) as typeof req.query;
  }
  if (req.params) {
    req.params = sanitize(req.params) as typeof req.params;
  }

  next();
};
