import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './env.js';
import { logger } from './middleware/logger.js';
import { shutdownAnalytics } from './services/analytics.js';

// Import routes
import usersRouter from './routes/users.js';
import tasksRouter from './routes/tasks.js';
import adminRouter from './routes/admin.js';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  logger.info('Request processed', {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration_ms: duration,
  });
});

// API key authentication middleware (for protected routes)
app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid Authorization header', {
      path: c.req.path,
    });

    return c.json({
      success: false,
      error: 'Unauthorized - API key required',
    }, 401);
  }

  const apiKey = authHeader.substring(7);

  if (apiKey !== env.API_KEY) {
    logger.warn('Invalid API key', {
      path: c.req.path,
    });

    return c.json({
      success: false,
      error: 'Unauthorized - Invalid API key',
    }, 401);
  }

  await next();
});

// Health check endpoint (no auth required)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.route('/api/users', usersRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/admin', adminRouter);

// 404 handler
app.notFound((c) => {
  logger.warn('Route not found', {
    method: c.req.method,
    path: c.req.path,
  });

  return c.json({
    success: false,
    error: 'Not found',
  }, 404);
});

// Error handler
app.onError((error, c) => {
  logger.error('Unhandled error', error, {
    method: c.req.method,
    path: c.req.path,
  });

  return c.json({
    success: false,
    error: 'Internal server error',
  }, 500);
});

const port = env.PORT;

logger.info('Backend Starting');
logger.info(`Runtime: Bun ${Bun.version}`);
logger.info(`Server: http://localhost:${port}`);
logger.info(`Health: http://localhost:${port}/health`);
logger.info(`Environment: ${env.NODE_ENV}`);

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await shutdownAnalytics();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await shutdownAnalytics();
  process.exit(0);
});

export default {
  port,
  fetch: app.fetch,
  // Increase idle timeout for long-running requests (e.g., video generation)
  idleTimeout: 180, // 3 minutes in seconds
};
