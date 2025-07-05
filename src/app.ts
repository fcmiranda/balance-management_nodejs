import express from 'express';
import { Database } from './infrastructure/database/database';
import { routes } from './routes/index';

const app = express();

// Initialize database
Database.getInstance();

app.use(express.json());
app.use('/api', routes);

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server Listening on PORT: ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  Database.getInstance().close();
  process.exit(0);
});
