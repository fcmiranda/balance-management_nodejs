import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { TypeOrmDatabase } from './infrastructure/database/typeorm-database';
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

// Initialize TypeORM database
const initializeDatabase = async () => {
  try {
    const database = TypeOrmDatabase.getInstance();
    await database.initialize();
    console.log('TypeORM database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize TypeORM database:', error);
    process.exit(1);
  }
};

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

// Start server after database initialization
const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server Listening on PORT: ${PORT}`);
  });
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  const database = TypeOrmDatabase.getInstance();
  await database.close();
  process.exit(0);
});

// Start the application
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
