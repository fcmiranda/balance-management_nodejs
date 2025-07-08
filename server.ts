#!/usr/bin/env node

import 'dotenv/config';
import express from 'express';
import { TypeOrmDatabase } from './src/infrastructure/database/typeorm-database';
import { handleError } from './src/infrastructure/middleware/error-handler';
import {
  createCorsMiddleware,
  createHelmetMiddleware,
  sanitizeInput,
} from './src/infrastructure/middleware/security-middleware';
import { routes } from './src/routes/index';

const app = express();

TypeOrmDatabase.getInstance();

app.use(createHelmetMiddleware());
app.use(createCorsMiddleware());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api', routes);

app.use(handleError);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log('🔐 Authentication endpoints:');
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
  console.log('📊 Client endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/clients`);
  console.log(`   POST http://localhost:${PORT}/api/clients`);
  console.log('🏥 Health check:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log('\n💡 Use the following credentials to test:');
  console.log('   Admin: admin@itau.com / admin123');
  console.log('   Client: client@test.com / client123');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  TypeOrmDatabase.getInstance().close();
  process.exit(0);
});
