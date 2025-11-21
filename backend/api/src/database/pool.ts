import { Pool, PoolClient, QueryResult } from 'pg';
import config from '../config/env';
import logger from '../utils/logger';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.database.url,
  min: config.database.poolMin,
  max: config.database.poolMax,
  ssl: config.database.ssl
    ? {
        rejectUnauthorized: false, // For development. In production, use proper SSL certificates
      }
    : false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Event handlers
pool.on('connect', (client: PoolClient) => {
  logger.debug('New database connection established');
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected database pool error:', err);
  process.exit(-1);
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

// Wrapper for queries with logging
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn('Slow query detected', {
        duration,
        query: text,
        rowCount: result.rowCount,
      });
    } else {
      logger.debug('Query executed', {
        duration,
        rowCount: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    logger.error('Database query error:', {
      query: text,
      params,
      error,
    });
    throw error;
  }
};

// Transaction wrapper
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Health check
export const checkConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    return !!result;
  } catch (error) {
    logger.error('Database connection check failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('Database pool closed gracefully');
  } catch (error) {
    logger.error('Error closing database pool:', error);
    throw error;
  }
};

export default pool;
