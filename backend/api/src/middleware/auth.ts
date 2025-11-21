import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/auth';
import { query } from '../database/pool';
import logger from '../utils/logger';

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
      return;
    }

    // Verify JWT token
    const payload = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      id: payload.id,
      type: payload.type,
      role: payload.role,
      facility_id: payload.facility_id,
      email: payload.email,
    };

    // Verify user still exists and is active
    if (payload.type === 'staff') {
      const result = await query(
        'SELECT id, is_active FROM staff WHERE id = $1',
        [payload.id]
      );

      if (result.rows.length === 0 || !result.rows[0].is_active) {
        res.status(401).json({
          success: false,
          error: 'User account not found or inactive',
        });
        return;
      }
    } else if (payload.type === 'patient') {
      const result = await query(
        'SELECT id, is_active FROM patients WHERE id = $1',
        [payload.id]
      );

      if (result.rows.length === 0 || !result.rows[0].is_active) {
        res.status(401).json({
          success: false,
          error: 'Patient account not found or inactive',
        });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

// ============================================================================
// AUTHORIZATION MIDDLEWARE (Role-based)
// ============================================================================

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.type !== 'staff') {
      res.status(403).json({
        success: false,
        error: 'Staff access required',
      });
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

// ============================================================================
// STAFF ONLY
// ============================================================================

export const requireStaff = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (req.user.type !== 'staff') {
    res.status(403).json({
      success: false,
      error: 'Staff access required',
    });
    return;
  }

  next();
};

// ============================================================================
// PATIENT ONLY
// ============================================================================

export const requirePatient = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (req.user.type !== 'patient') {
    res.status(403).json({
      success: false,
      error: 'Patient access required',
    });
    return;
  }

  next();
};

// ============================================================================
// FACILITY SCOPED ACCESS
// ============================================================================

export const requireSameFacility = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Super admin can access all facilities
    if (req.user.role === UserRole.SUPER_ADMIN) {
      next();
      return;
    }

    // Get patient ID from route params or body
    const patientId = req.params.patientId || req.params.id || req.body.patient_id;

    if (!patientId) {
      next(); // No patient ID to check, continue
      return;
    }

    // Verify patient belongs to same facility as staff
    const result = await query(
      'SELECT facility_id FROM patients WHERE id = $1',
      [patientId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Patient not found',
      });
      return;
    }

    const patientFacilityId = result.rows[0].facility_id;

    if (req.user.type === 'staff' && req.user.facility_id !== patientFacilityId) {
      res.status(403).json({
        success: false,
        error: 'Access denied: Patient not in your facility',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Facility access check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// ============================================================================
// PATIENT SELF OR ASSIGNED COUNSELOR
// ============================================================================

export const requirePatientOrCounselor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const patientId = req.params.patientId || req.params.id;

    // Patient accessing their own data
    if (req.user.type === 'patient' && req.user.id === patientId) {
      next();
      return;
    }

    // Staff accessing patient data
    if (req.user.type === 'staff') {
      // Super admin or facility admin can access
      if (
        req.user.role === UserRole.SUPER_ADMIN ||
        req.user.role === UserRole.FACILITY_ADMIN
      ) {
        next();
        return;
      }

      // Check if staff is assigned to this patient
      const result = await query(
        `SELECT assigned_counselor_id, facility_id
         FROM patients
         WHERE id = $1`,
        [patientId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Patient not found',
        });
        return;
      }

      const patient = result.rows[0];

      // Check if staff is assigned counselor OR in same facility
      if (
        patient.assigned_counselor_id === req.user.id ||
        patient.facility_id === req.user.facility_id
      ) {
        next();
        return;
      }
    }

    res.status(403).json({
      success: false,
      error: 'Access denied',
    });
  } catch (error) {
    logger.error('Patient/counselor access check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export default {
  authenticate,
  requireRole,
  requireStaff,
  requirePatient,
  requireSameFacility,
  requirePatientOrCounselor,
};
