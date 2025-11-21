import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  // Server
  nodeEnv: string;
  port: number;
  apiVersion: string;

  // Database
  database: {
    url: string;
    poolMin: number;
    poolMax: number;
    ssl: boolean;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // Registration Keys
  registrationKey: {
    expiryHours: number;
    prefix: string;
  };

  // CORS
  cors: {
    origin: string[];
    credentials: boolean;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // AWS S3
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3BucketName: string;
    s3BucketRegion: string;
  };

  // WebSocket
  socketIo: {
    path: string;
    corsOrigin: string;
  };

  // Logging
  logging: {
    level: string;
    filePath: string;
  };

  // Security
  security: {
    bcryptRounds: number;
    sessionTimeoutMinutes: number;
  };

  // External Services
  pythonServiceUrl: string;

  // Feature Flags
  features: {
    enableFamilyPortal: boolean;
    enableAiInsights: boolean;
    enableAuditLogging: boolean;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/recover_backend',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  registrationKey: {
    expiryHours: parseInt(process.env.REGISTRATION_KEY_EXPIRY_HOURS || '48', 10),
    prefix: process.env.REGISTRATION_KEY_PREFIX || 'REC',
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.S3_BUCKET_NAME || 'recover-documents',
    s3BucketRegion: process.env.S3_BUCKET_REGION || 'us-east-1',
  },

  socketIo: {
    path: process.env.SOCKET_IO_PATH || '/api/v1/socket',
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/api.log',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10),
  },

  pythonServiceUrl: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000',

  features: {
    enableFamilyPortal: process.env.ENABLE_FAMILY_PORTAL === 'true',
    enableAiInsights: process.env.ENABLE_AI_INSIGHTS === 'true',
    enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  },
};

// Validation
if (config.nodeEnv === 'production') {
  if (config.jwt.secret === 'your-secret-key') {
    throw new Error('JWT_SECRET must be set in production');
  }
  if (!config.database.url.includes('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }
}

export default config;
