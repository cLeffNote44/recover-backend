import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

import config from './config/env';
import logger, { morganStream } from './utils/logger';
import { checkConnection, closePool } from './database/pool';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import patientsRoutes from './routes/patients.routes';

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app: Application = express();
const httpServer = createServer(app);

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: config.nodeEnv === 'production',
  })
);

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============================================================================
// GENERAL MIDDLEWARE
// ============================================================================

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: morganStream }));
}

// ============================================================================
// API ROUTES
// ============================================================================

const API_PREFIX = `/api/${config.apiVersion}`;

// Health check
app.get(`${API_PREFIX}/health`, async (req, res) => {
  const dbHealthy = await checkConnection();

  const health = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: dbHealthy ? 'connected' : 'disconnected',
  };

  res.status(dbHealthy ? 200 : 503).json(health);
});

// Authentication routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// Patient management routes
app.use(`${API_PREFIX}/patients`, patientsRoutes);

// TODO: Add more routes
// app.use(`${API_PREFIX}/messages`, messagesRoutes);
// app.use(`${API_PREFIX}/documents`, documentsRoutes);
// app.use(`${API_PREFIX}/goals`, goalsRoutes);
// app.use(`${API_PREFIX}/facilities`, facilitiesRoutes);
// app.use(`${API_PREFIX}/staff`, staffRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Recovery Backend API',
    version: '1.0.0',
    status: 'running',
    apiVersion: config.apiVersion,
    documentation: `${API_PREFIX}/docs`,
  });
});

// ============================================================================
// WEBSOCKET SETUP
// ============================================================================

const io = new SocketIOServer(httpServer, {
  path: config.socketIo.path,
  cors: {
    origin: config.socketIo.corsOrigin,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  socket.on('authenticate', (data) => {
    // TODO: Implement WebSocket authentication
    logger.debug('WebSocket auth attempt', { socketId: socket.id });
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });

  socket.on('error', (error) => {
    logger.error('WebSocket error', { socketId: socket.id, error });
  });
});

// Make io available globally for other modules
export { io };

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = async (): Promise<void> => {
  try {
    // Check database connection
    const dbConnected = await checkConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    logger.info('Database connection established');

    // Start HTTP server
    const PORT = config.port;
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
      logger.info(`🔌 WebSocket path: ${config.socketIo.path}`);
      logger.info(`📡 Health check: http://localhost:${PORT}${API_PREFIX}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new connections
  httpServer.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close database connections
      await closePool();

      // Close WebSocket connections
      io.close(() => {
        logger.info('WebSocket server closed');
      });

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

// ============================================================================
// START THE SERVER
// ============================================================================

if (require.main === module) {
  startServer();
}

export default app;
