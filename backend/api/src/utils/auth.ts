import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/env';
import { Staff, Patient, UserRole } from '../types';

// ============================================================================
// PASSWORD HASHING
// ============================================================================

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ============================================================================
// REGISTRATION KEY GENERATION
// ============================================================================

export const generateRegistrationKey = (): string => {
  // Generate cryptographically secure random key
  const randomBytes = crypto.randomBytes(9);
  const base64 = randomBytes
    .toString('base64')
    .replace(/\+/g, '0')
    .replace(/\//g, '1')
    .replace(/=/g, '')
    .substring(0, 12)
    .toUpperCase();

  // Format: REC7-K9M2-P4N8
  const prefix = config.registrationKey.prefix;
  return `${prefix}${base64.slice(0, 1)}-${base64.slice(1, 5)}-${base64.slice(5, 9)}`;
};

export const hashRegistrationKey = async (key: string): Promise<string> => {
  return hashPassword(key);
};

export const verifyRegistrationKey = async (
  key: string,
  hash: string
): Promise<boolean> => {
  return comparePassword(key, hash);
};

// ============================================================================
// JWT TOKEN GENERATION & VERIFICATION
// ============================================================================

export interface TokenPayload {
  id: string;
  type: 'staff' | 'patient';
  role?: UserRole;
  facility_id?: string;
  email?: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// ============================================================================
// TOKEN HELPERS
// ============================================================================

export const generateTokenPair = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// ============================================================================
// USER PAYLOAD BUILDERS
// ============================================================================

export const buildStaffTokenPayload = (staff: Staff): TokenPayload => {
  return {
    id: staff.id,
    type: 'staff',
    role: staff.role,
    facility_id: staff.facility_id || undefined,
    email: staff.email,
  };
};

export const buildPatientTokenPayload = (patient: Patient): TokenPayload => {
  return {
    id: patient.id,
    type: 'patient',
    facility_id: patient.facility_id,
    email: patient.email || undefined,
  };
};

// ============================================================================
// SESSION TOKEN HASHING (for storage in sessions table)
// ============================================================================

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ============================================================================
// RANDOM ID GENERATION
// ============================================================================

export const generateSecureId = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export default {
  hashPassword,
  comparePassword,
  generateRegistrationKey,
  hashRegistrationKey,
  verifyRegistrationKey,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  extractTokenFromHeader,
  buildStaffTokenPayload,
  buildPatientTokenPayload,
  hashToken,
  generateSecureId,
};
