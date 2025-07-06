#!/usr/bin/env node

import 'dotenv/config';
import express from 'express';
import { Database } from './src/infrastructure/database/database';
import { routes } from './src/routes/index';
import { SecurityMiddleware } from './src/infrastructure/middleware/security-middleware';
import { ErrorHandlerMiddleware } from './src/infrastructure/middleware/error-handler';

const app = express();

// Initialize database
Database.getInstance();

// Security middleware
app.use(SecurityMiddleware.createHelmetMiddleware());
app.use(SecurityMiddleware.createCorsMiddleware());

// Request processing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(SecurityMiddleware.sanitizeInput);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(ErrorHandlerMiddleware.handle);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`🔐 Authentication endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`📊 Client endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/clients`);
  console.log(`   POST http://localhost:${PORT}/api/clients`);
  console.log(`🏥 Health check:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`\n💡 Use the following credentials to test:`);
  console.log(`   Admin: admin@itau.com / admin123`);
  console.log(`   Client: client@test.com / client123`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  Database.getInstance().close();
  process.exit(0);
});
