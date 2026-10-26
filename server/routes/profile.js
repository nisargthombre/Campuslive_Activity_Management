import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.js'
import {
  getProfileMe,
  updateProfileMe,
  getProfilePreferences,
  updateProfilePreferences,
} from '../controllers/profileController.js'

const router = Router()

/**
 * ==============================================================================
 * CAMPUS LIVE - PROFILE API ROUTES (/api/profile)
 * ==============================================================================
 * All profile endpoints require a verified Supabase session Bearer token.
 * Access is restricted to the authenticated user's own record.
 */

// GET /api/profile/me - Retrieve current user profile
router.get('/me', authenticateUser, getProfileMe)

// PUT /api/profile/me - Update current user profile
router.put('/me', authenticateUser, updateProfileMe)

// GET /api/profile/preferences - Retrieve current user preferences
router.get('/preferences', authenticateUser, getProfilePreferences)

// PUT /api/profile/preferences - Update current user preferences
router.put('/preferences', authenticateUser, updateProfilePreferences)

export default router

