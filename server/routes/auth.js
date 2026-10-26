import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.js'
import { requireRole } from '../middleware/authorize.js'

const router = Router()

/**
 * ==============================================================================
 * GET /api/auth/me
 * ==============================================================================
 * Protected test endpoint returning sanitized profile and user identity.
 *
 * Security Guarantee:
 * - Passwords, JWT access tokens, refresh tokens, and internal secrets are NEVER returned.
 * - Profile and user data are strictly sourced from verified Supabase session & public.profiles.
 */
router.get('/me', authenticateUser, (req, res) => {
  const { user, profile } = req

  // Return strictly sanitized, safe attributes
  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      emailConfirmedAt: user.email_confirmed_at || null,
      lastSignInAt: user.last_sign_in_at || null,
      createdAt: user.created_at || null,
    },
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email || user.email,
      role: profile.role,
      department: profile.department || null,
      course: profile.course || null,
      academicYear: profile.academic_year || null,
      studentId: profile.student_id || null,
      division: profile.division || null,
      enrollmentYear: profile.enrollment_year || null,
      phone: profile.phone || null,
      profileImage: profile.profile_image || null,
      socialLinks: profile.social_links || null,
      isActive: profile.is_active,
      createdAt: profile.created_at || null,
      updatedAt: profile.updated_at || null,
    },
  })
})

/**
 * ==============================================================================
 * Role Verification Test Endpoints (For Testing & Validation)
 * ==============================================================================
 */

// Student-only test route
router.get('/student-check', authenticateUser, requireRole('student'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized as Student.',
    role: req.profile.role,
    userId: req.user.id,
  })
})

// Admin / Faculty test route
router.get('/admin-check', authenticateUser, requireRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized as Admin / Faculty.',
    role: req.profile.role,
    userId: req.user.id,
  })
})

// Super Admin test route
router.get('/super-admin-check', authenticateUser, requireRole('super_admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized as Super Admin.',
    role: req.profile.role,
    userId: req.user.id,
  })
})

export default router
