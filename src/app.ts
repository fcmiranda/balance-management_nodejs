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

app.use(createHelmetMiddleware());
app.use(createCorsMiddleware());
app.use(createRateLimiter());

app.use(express.json({ limit: config.limits.requestBodySizeLimit }));
app.use(express.urlencoded({ extended: true, limit: config.limits.requestBodySizeLimit }));
app.use(sanitizeInput);
app.use(requestLogger);

setupSwagger(app);

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.nodeEnv,
  });
});

app.use('/api', routes);

app.use(handleError);

const PORT = config.port;

const startServer = async () => {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`✅ Server is running on ${configHelpers.getServerUrl()}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 API Documentation: ${configHelpers.getServerUrl()}/api-docs`);
  });
};

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  const database = TypeOrmDatabase.getInstance();
  await database.close();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
