import 'dotenv/config';
import express from 'express';
import { Database } from './infrastructure/database/database';
import { handleError } from './infrastructure/middleware/error-handler';
import {
  createCorsMiddleware,
  createHelmetMiddleware,
  createRateLimiter,
  requestLogger,
  sanitizeInput,
} from './infrastructure/middleware/security-middleware';
import { routes } from './routes/index';

const app = express();

// Initialize database
Database.getInstance();

// Security middleware
app.use(createHelmetMiddleware());
app.use(createCorsMiddleware());
app.use(createRateLimiter());

// Request processing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(handleError);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server Listening on PORT: ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  Database.getInstance().close();
  process.exit(0);
});
