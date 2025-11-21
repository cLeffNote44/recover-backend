import { Request, Response } from 'express';
import { query, transaction } from '../database/pool';
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  buildStaffTokenPayload,
  buildPatientTokenPayload,
  verifyRefreshToken,
  hashToken,
  verifyRegistrationKey,
} from '../utils/auth';
import { UnauthorizedError, NotFoundError, ValidationError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { AuthenticatedRequest, LoginRequest, RegisterPatientRequest } from '../types';

// ============================================================================
// STAFF LOGIN
// ============================================================================

export const staffLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginRequest;

  // Find staff by email
  const result = await query(
    `SELECT id, facility_id, email, password_hash, first_name, last_name, role, is_active, locked_until
     FROM staff
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const staff = result.rows[0];

  // Check if account is locked
  if (staff.locked_until && new Date(staff.locked_until) > new Date()) {
    throw new UnauthorizedError('Account is temporarily locked. Please try again later.');
  }

  // Check if account is active
  if (!staff.is_active) {
    throw new UnauthorizedError('Account is inactive. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, staff.password_hash);

  if (!isPasswordValid) {
    // Increment failed login attempts
    await query(
      `UPDATE staff
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE
             WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
             ELSE locked_until
           END
       WHERE id = $1`,
      [staff.id]
    );

    throw new UnauthorizedError('Invalid email or password');
  }

  // Reset failed login attempts and update last login
  await query(
    `UPDATE staff
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_login = NOW()
     WHERE id = $1`,
    [staff.id]
  );

  // Generate tokens
  const tokenPayload = buildStaffTokenPayload(staff);
  const tokens = generateTokenPair(tokenPayload);

  // Store session (optional - for token revocation)
  const refreshTokenHash = hashToken(tokens.refreshToken);
  await query(
    `INSERT INTO sessions (user_type, user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')`,
    [
      'staff',
      staff.id,
      hashToken(tokens.accessToken),
      refreshTokenHash,
      req.ip,
      req.headers['user-agent'],
    ]
  );

  // Log successful login
  logger.info('Staff login successful', {
    staff_id: staff.id,
    email: staff.email,
    role: staff.role,
    ip: req.ip,
  });

  res.json({
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: staff.id,
      email: staff.email,
      first_name: staff.first_name,
      last_name: staff.last_name,
      role: staff.role,
      facility_id: staff.facility_id,
    },
  });
};

// ============================================================================
// PATIENT REGISTRATION (with registration key)
// ============================================================================

export const patientRegister = async (req: Request, res: Response): Promise<void> => {
  const { registration_key, password } = req.body as RegisterPatientRequest;

  await transaction(async (client) => {
    // Find patient by registration key
    const patientResult = await client.query(
      `SELECT id, facility_id, first_name, last_name, email, registration_key_hash, key_expires_at, key_used_at
       FROM patients
       WHERE registration_key = $1`,
      [registration_key.toUpperCase()]
    );

    if (patientResult.rows.length === 0) {
      throw new NotFoundError('Invalid registration key');
    }

    const patient = patientResult.rows[0];

    // Check if key already used
    if (patient.key_used_at) {
      throw new ValidationError('Registration key has already been used');
    }

    // Check if key expired
    if (new Date(patient.key_expires_at) < new Date()) {
      throw new ValidationError('Registration key has expired');
    }

    // Verify key hash (additional security)
    const isKeyValid = await verifyRegistrationKey(
      registration_key,
      patient.registration_key_hash
    );

    if (!isKeyValid) {
      throw new UnauthorizedError('Invalid registration key');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Update patient record
    await client.query(
      `UPDATE patients
       SET password_hash = $1,
           key_used_at = NOW(),
           status = 'active'
       WHERE id = $2`,
      [passwordHash, patient.id]
    );

    // Generate tokens
    const tokenPayload = buildPatientTokenPayload({
      ...patient,
      password_hash: passwordHash,
    });
    const tokens = generateTokenPair(tokenPayload);

    // Store session
    const refreshTokenHash = hashToken(tokens.refreshToken);
    await client.query(
      `INSERT INTO sessions (user_type, user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')`,
      [
        'patient',
        patient.id,
        hashToken(tokens.accessToken),
        refreshTokenHash,
        req.ip,
        req.headers['user-agent'],
      ]
    );

    logger.info('Patient registration successful', {
      patient_id: patient.id,
      facility_id: patient.facility_id,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
        facility_id: patient.facility_id,
      },
    });
  });
};

// ============================================================================
// PATIENT LOGIN
// ============================================================================

export const patientLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginRequest;

  // Find patient by email
  const result = await query(
    `SELECT id, facility_id, email, password_hash, first_name, last_name, is_active, status
     FROM patients
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const patient = result.rows[0];

  // Check if account is active
  if (!patient.is_active || patient.status === 'discharged') {
    throw new UnauthorizedError('Account is inactive. Please contact your facility.');
  }

  // Check if password is set (completed registration)
  if (!patient.password_hash) {
    throw new UnauthorizedError('Please complete registration first');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, patient.password_hash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last sync
  await query('UPDATE patients SET last_sync = NOW() WHERE id = $1', [patient.id]);

  // Generate tokens
  const tokenPayload = buildPatientTokenPayload(patient);
  const tokens = generateTokenPair(tokenPayload);

  // Store session
  const refreshTokenHash = hashToken(tokens.refreshToken);
  await query(
    `INSERT INTO sessions (user_type, user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')`,
    [
      'patient',
      patient.id,
      hashToken(tokens.accessToken),
      refreshTokenHash,
      req.ip,
      req.headers['user-agent'],
    ]
  );

  logger.info('Patient login successful', {
    patient_id: patient.id,
    facility_id: patient.facility_id,
    ip: req.ip,
  });

  res.json({
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: patient.id,
      email: patient.email,
      first_name: patient.first_name,
      last_name: patient.last_name,
      facility_id: patient.facility_id,
    },
  });
};

// ============================================================================
// REFRESH TOKEN
// ============================================================================

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ValidationError('Refresh token required');
  }

  // Verify refresh token
  const payload = verifyRefreshToken(token);

  // Check if session exists and is valid
  const tokenHash = hashToken(token);
  const sessionResult = await query(
    `SELECT user_type, user_id, expires_at
     FROM sessions
     WHERE refresh_token_hash = $1 AND expires_at > NOW()`,
    [tokenHash]
  );

  if (sessionResult.rows.length === 0) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Generate new tokens
  const tokens = generateTokenPair(payload);

  // Update session with new tokens
  await query(
    `UPDATE sessions
     SET token_hash = $1,
         refresh_token_hash = $2,
         last_activity = NOW()
     WHERE refresh_token_hash = $3`,
    [hashToken(tokens.accessToken), hashToken(tokens.refreshToken), tokenHash]
  );

  res.json({
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
};

// ============================================================================
// LOGOUT
// ============================================================================

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  // Delete session
  await query(
    `DELETE FROM sessions
     WHERE user_type = $1 AND user_id = $2`,
    [req.user.type, req.user.id]
  );

  logger.info('User logged out', {
    user_id: req.user.id,
    user_type: req.user.type,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ============================================================================
// VALIDATE REGISTRATION KEY
// ============================================================================

export const validateRegistrationKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { registration_key } = req.body;

  // Find patient by registration key
  const result = await query(
    `SELECT id, first_name, last_name, key_expires_at, key_used_at,
            f.name as facility_name
     FROM patients p
     JOIN facilities f ON p.facility_id = f.id
     WHERE p.registration_key = $1`,
    [registration_key.toUpperCase()]
  );

  if (result.rows.length === 0) {
    res.json({
      success: false,
      valid: false,
      message: 'Invalid registration key',
    });
    return;
  }

  const patient = result.rows[0];

  // Check if key already used
  if (patient.key_used_at) {
    res.json({
      success: false,
      valid: false,
      message: 'Registration key has already been used',
    });
    return;
  }

  // Check if key expired
  if (new Date(patient.key_expires_at) < new Date()) {
    res.json({
      success: false,
      valid: false,
      message: 'Registration key has expired',
    });
    return;
  }

  res.json({
    success: true,
    valid: true,
    patient: {
      first_name: patient.first_name,
      last_name: patient.last_name,
      facility_name: patient.facility_name,
    },
    expires_at: patient.key_expires_at,
  });
};

export default {
  staffLogin,
  patientRegister,
  patientLogin,
  refreshToken,
  logout,
  validateRegistrationKey,
};
