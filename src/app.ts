import 'dotenv/config';
import 'reflect-metadata';
import { config, configHelpers, validateConfig } from '@infrastructure/config/config';
import { TypeOrmDatabase } from '@infrastructure/database/typeorm-database';
import { handleError } from '@infrastructure/middleware/error-handler';
import {
  createCorsMiddleware,
  createHelmetMiddleware,
  createRateLimiter,
  requestLogger,
  sanitizeInput,
} from '@infrastructure/middleware/security-middleware';
import { setupSwagger } from '@infrastructure/swagger/swagger-config';
import { routes } from '@routes/index';
import express from 'express';

// Validate configuration on startup
validateConfig();

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
app.use(express.json({ limit: config.limits.requestBodySizeLimit }));
app.use(express.urlencoded({ extended: true, limit: config.limits.requestBodySizeLimit }));
app.use(sanitizeInput);
app.use(requestLogger);

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(handleError);

const PORT = config.port;

// Start server after database initialization
const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`✅ Server is running on ${configHelpers.getServerUrl()}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 API Documentation: ${configHelpers.getServerUrl()}/api-docs`);
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
