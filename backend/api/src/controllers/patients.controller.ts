import { Response } from 'express';
import { query, transaction } from '../database/pool';
import {
  generateRegistrationKey,
  hashRegistrationKey,
} from '../utils/auth';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../middleware/errorHandler';
import logger from '../utils/logger';
import config from '../config/env';
import {
  AuthenticatedRequest,
  CreatePatientRequest,
  UpdatePatientRequest,
  UserRole,
} from '../types';

// ============================================================================
// CREATE PATIENT (Staff only - generates registration key)
// ============================================================================

export const createPatient = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const data = req.body as CreatePatientRequest;

  // Validate facility access
  if (
    req.user?.role !== UserRole.SUPER_ADMIN &&
    req.user?.facility_id !== data.facility_id
  ) {
    throw new ForbiddenError('Cannot create patient for different facility');
  }

  await transaction(async (client) => {
    // Generate registration key
    const registrationKey = generateRegistrationKey();
    const keyHash = await hashRegistrationKey(registrationKey);
    const keyExpiresAt = new Date(
      Date.now() + config.registrationKey.expiryHours * 60 * 60 * 1000
    );

    // Insert patient
    const result = await client.query(
      `INSERT INTO patients (
        facility_id,
        assigned_counselor_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        admission_date,
        expected_discharge_date,
        sobriety_date,
        substances_of_choice,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        registration_key,
        registration_key_hash,
        key_generated_at,
        key_expires_at,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), $18, 'pending')
      RETURNING id, first_name, last_name, facility_id, status, created_at`,
      [
        data.facility_id,
        data.assigned_counselor_id || null,
        data.first_name,
        data.last_name,
        data.date_of_birth,
        data.gender || null,
        data.phone || null,
        data.email?.toLowerCase() || null,
        data.admission_date || new Date().toISOString().split('T')[0],
        data.expected_discharge_date || null,
        data.sobriety_date || new Date().toISOString().split('T')[0],
        data.substances_of_choice || [],
        data.emergency_contact_name || null,
        data.emergency_contact_phone || null,
        data.emergency_contact_relationship || null,
        registrationKey,
        keyHash,
        keyExpiresAt,
      ]
    );

    const patient = result.rows[0];

    logger.info('Patient created', {
      patient_id: patient.id,
      facility_id: data.facility_id,
      created_by: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      patient,
      registration_key: registrationKey,
      key_expires_at: keyExpiresAt,
    });
  });
};

// ============================================================================
// GET ALL PATIENTS (facility-scoped)
// ============================================================================

export const getAllPatients = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { status, counselor_id, search, page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  // Build query conditions
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // Facility scoping (unless super admin)
  if (req.user?.role !== UserRole.SUPER_ADMIN) {
    conditions.push(`p.facility_id = $${paramIndex}`);
    params.push(req.user?.facility_id);
    paramIndex++;
  }

  // Status filter
  if (status) {
    conditions.push(`p.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  // Counselor filter
  if (counselor_id) {
    conditions.push(`p.assigned_counselor_id = $${paramIndex}`);
    params.push(counselor_id);
    paramIndex++;
  }

  // Search filter (name or email)
  if (search) {
    conditions.push(
      `(p.first_name ILIKE $${paramIndex} OR p.last_name ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM patients p ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Get patients
  const result = await query(
    `SELECT
      p.id,
      p.first_name,
      p.last_name,
      p.date_of_birth,
      p.phone,
      p.email,
      p.status,
      p.admission_date,
      p.expected_discharge_date,
      p.sobriety_date,
      p.days_sober,
      p.check_in_streak,
      p.assigned_counselor_id,
      s.first_name || ' ' || s.last_name as counselor_name,
      p.facility_id,
      f.name as facility_name,
      p.created_at
    FROM patients p
    LEFT JOIN staff s ON p.assigned_counselor_id = s.id
    LEFT JOIN facilities f ON p.facility_id = f.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limitNum, offset]
  );

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext: offset + limitNum < total,
      hasPrev: pageNum > 1,
    },
  });
};

// ============================================================================
// GET PATIENT BY ID
// ============================================================================

export const getPatientById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const result = await query(
    `SELECT
      p.*,
      s.first_name || ' ' || s.last_name as counselor_name,
      s.email as counselor_email,
      s.phone as counselor_phone,
      f.name as facility_name
    FROM patients p
    LEFT JOIN staff s ON p.assigned_counselor_id = s.id
    LEFT JOIN facilities f ON p.facility_id = f.id
    WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Patient not found');
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
};

// ============================================================================
// UPDATE PATIENT
// ============================================================================

export const updatePatient = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const updates = req.body as UpdatePatientRequest;

  // Build update query dynamically
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'first_name',
    'last_name',
    'phone',
    'email',
    'assigned_counselor_id',
    'status',
    'expected_discharge_date',
    'discharge_date',
    'discharge_reason',
    'sobriety_date',
  ];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  // Add patient ID to params
  params.push(id);

  const result = await query(
    `UPDATE patients
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex}
     RETURNING id, first_name, last_name, status, updated_at`,
    params
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Patient not found');
  }

  logger.info('Patient updated', {
    patient_id: id,
    updated_by: req.user?.id,
    fields: Object.keys(updates),
  });

  res.json({
    success: true,
    message: 'Patient updated successfully',
    data: result.rows[0],
  });
};

// ============================================================================
// DELETE PATIENT (soft delete)
// ============================================================================

export const deletePatient = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  // Only super admin or facility admin can delete
  if (
    req.user?.role !== UserRole.SUPER_ADMIN &&
    req.user?.role !== UserRole.FACILITY_ADMIN
  ) {
    throw new ForbiddenError('Insufficient permissions to delete patient');
  }

  const result = await query(
    `UPDATE patients
     SET is_active = false, status = 'discharged', updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Patient not found');
  }

  logger.warn('Patient deleted (soft)', {
    patient_id: id,
    deleted_by: req.user?.id,
  });

  res.json({
    success: true,
    message: 'Patient deactivated successfully',
  });
};

// ============================================================================
// REGENERATE REGISTRATION KEY
// ============================================================================

export const regenerateRegistrationKey = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  // Generate new key
  const registrationKey = generateRegistrationKey();
  const keyHash = await hashRegistrationKey(registrationKey);
  const keyExpiresAt = new Date(
    Date.now() + config.registrationKey.expiryHours * 60 * 60 * 1000
  );

  const result = await query(
    `UPDATE patients
     SET registration_key = $1,
         registration_key_hash = $2,
         key_generated_at = NOW(),
         key_expires_at = $3,
         key_used_at = NULL
     WHERE id = $4 AND key_used_at IS NULL
     RETURNING id, first_name, last_name`,
    [registrationKey, keyHash, keyExpiresAt, id]
  );

  if (result.rows.length === 0) {
    throw new ValidationError(
      'Cannot regenerate key: patient not found or key already used'
    );
  }

  logger.info('Registration key regenerated', {
    patient_id: id,
    regenerated_by: req.user?.id,
  });

  res.json({
    success: true,
    message: 'Registration key regenerated',
    registration_key: registrationKey,
    key_expires_at: keyExpiresAt,
  });
};

// ============================================================================
// GET PATIENT DASHBOARD (for counselor view)
// ============================================================================

export const getPatientDashboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  // Get patient info
  const patientResult = await query(
    `SELECT * FROM patient_dashboard_summary WHERE id = $1`,
    [id]
  );

  if (patientResult.rows.length === 0) {
    throw new NotFoundError('Patient not found');
  }

  const patient = patientResult.rows[0];

  // Get recent check-ins (last 7 days)
  const checkInsResult = await query(
    `SELECT check_in_date, mood_rating, energy_level, sleep_quality, stress_level, halt_check, feelings
     FROM patient_check_ins
     WHERE patient_id = $1
     ORDER BY check_in_date DESC
     LIMIT 7`,
    [id]
  );

  // Get recent cravings (last 10)
  const cravingsResult = await query(
    `SELECT intensity, trigger, overcame, occurred_at
     FROM patient_cravings
     WHERE patient_id = $1
     ORDER BY occurred_at DESC
     LIMIT 10`,
    [id]
  );

  // Get active goals
  const goalsResult = await query(
    `SELECT id, title, description, goal_type, target_value, current_progress, status, due_date
     FROM patient_goals
     WHERE patient_id = $1 AND status = 'active'
     ORDER BY created_at DESC`,
    [id]
  );

  res.json({
    success: true,
    data: {
      patient,
      recent_check_ins: checkInsResult.rows,
      recent_cravings: cravingsResult.rows,
      active_goals: goalsResult.rows,
    },
  });
};

export default {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  regenerateRegistrationKey,
  getPatientDashboard,
};
