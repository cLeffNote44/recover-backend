import winston from 'winston';
import path from 'path';
import config from '../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`;

  // Add stack trace for errors
  if (stack) {
    log += `\n${stack}`;
  }

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    log += `\n${JSON.stringify(metadata, null, 2)}`;
  }

  return log;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport (with colors for development)
    new winston.transports.Console({
      format: combine(
        colorize(),
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

// Add file transport if in production or if log file path is specified
if (config.nodeEnv === 'production' || config.logging.filePath) {
  logger.add(
    new winston.transports.File({
      filename: path.resolve(config.logging.filePath),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Separate error log file
  logger.add(
    new winston.transports.File({
      filename: path.resolve(config.logging.filePath.replace('.log', '-error.log')),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

// Create a stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
