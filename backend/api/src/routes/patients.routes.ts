import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import {
  authenticate,
  requireStaff,
  requireSameFacility,
  requirePatientOrCounselor,
} from '../middleware/auth';
import * as patientsController from '../controllers/patients.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// CREATE PATIENT (Staff only)
// ============================================================================

router.post(
  '/',
  requireStaff,
  validate([
    body('facility_id').isUUID().withMessage('Valid facility ID required'),
    body('first_name').trim().notEmpty().withMessage('First name required'),
    body('last_name').trim().notEmpty().withMessage('Last name required'),
    body('date_of_birth').isISO8601().withMessage('Valid date of birth required'),
    body('phone').optional().isMobilePhone('any'),
    body('email').optional().isEmail().normalizeEmail(),
    body('assigned_counselor_id').optional().isUUID(),
  ]),
  asyncHandler(patientsController.createPatient)
);

// ============================================================================
// GET ALL PATIENTS (Staff only, facility-scoped)
// ============================================================================

router.get('/', requireStaff, asyncHandler(patientsController.getAllPatients));

// ============================================================================
// GET PATIENT BY ID
// ============================================================================

router.get(
  '/:id',
  validate([param('id').isUUID().withMessage('Valid patient ID required')]),
  requirePatientOrCounselor,
  asyncHandler(patientsController.getPatientById)
);

// ============================================================================
// GET PATIENT DASHBOARD (for counselor)
// ============================================================================

router.get(
  '/:id/dashboard',
  validate([param('id').isUUID().withMessage('Valid patient ID required')]),
  requireStaff,
  requireSameFacility,
  asyncHandler(patientsController.getPatientDashboard)
);

// ============================================================================
// UPDATE PATIENT
// ============================================================================

router.put(
  '/:id',
  requireStaff,
  requireSameFacility,
  validate([
    param('id').isUUID().withMessage('Valid patient ID required'),
    body('first_name').optional().trim().notEmpty(),
    body('last_name').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
    body('email').optional().isEmail().normalizeEmail(),
    body('assigned_counselor_id').optional().isUUID(),
    body('status').optional().isIn(['pending', 'admitted', 'active', 'discharged', 'alumni']),
  ]),
  asyncHandler(patientsController.updatePatient)
);

// ============================================================================
// DELETE PATIENT (soft delete)
// ============================================================================

router.delete(
  '/:id',
  requireStaff,
  requireSameFacility,
  validate([param('id').isUUID().withMessage('Valid patient ID required')]),
  asyncHandler(patientsController.deletePatient)
);

// ============================================================================
// REGENERATE REGISTRATION KEY
// ============================================================================

router.post(
  '/:id/regenerate-key',
  requireStaff,
  requireSameFacility,
  validate([param('id').isUUID().withMessage('Valid patient ID required')]),
  asyncHandler(patientsController.regenerateRegistrationKey)
);

export default router;
