import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.js'
import { requireRole } from '../middleware/authorize.js'
import { createAdminUser } from '../controllers/adminController.js'

const router = Router()

/**
 * ==============================================================================
 * CAMPUS LIVE - ADMIN & FACULTY PROVISIONING ROUTES (/api/admin)
 * ==============================================================================
 * All routes in this module require:
 * 1. Valid Supabase session Bearer token (`authenticateUser`)
 * 2. Elevated system privileges (`requireRole('super_admin')`)
 */

// POST /api/admin/users - Super Admin provisions new Admin / Faculty accounts
router.post('/users', authenticateUser, requireRole('super_admin'), createAdminUser)

export default router
