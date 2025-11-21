import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/auth.controller';

const router = Router();

// ============================================================================
// STAFF LOGIN
// ============================================================================

router.post(
  '/staff/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ]),
  asyncHandler(authController.staffLogin)
);

// ============================================================================
// PATIENT REGISTRATION (with key)
// ============================================================================

router.post(
  '/patient/register',
  validate([
    body('registration_key')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Registration key required'),
    body('password')
      .isString()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ]),
  asyncHandler(authController.patientRegister)
);

// ============================================================================
// PATIENT LOGIN
// ============================================================================

router.post(
  '/patient/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ]),
  asyncHandler(authController.patientLogin)
);

// ============================================================================
// VALIDATE REGISTRATION KEY
// ============================================================================

router.post(
  '/validate-key',
  validate([
    body('registration_key')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Registration key required'),
  ]),
  asyncHandler(authController.validateRegistrationKey)
);

// ============================================================================
// REFRESH TOKEN
// ============================================================================

router.post(
  '/refresh-token',
  validate([body('refreshToken').isString().notEmpty().withMessage('Refresh token required')]),
  asyncHandler(authController.refreshToken)
);

// ============================================================================
// LOGOUT
// ============================================================================

router.post('/logout', authenticate, asyncHandler(authController.logout));

export default router;
