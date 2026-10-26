import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.js'
import {
  getRegistrationStatus,
  registerForActivity,
  cancelRegistration,
  getMyRegistrations,
  getMyActivityHistory,
} from '../controllers/registrationController.js'

const router = Router()

/**
 * ==============================================================================
 * CAMPUS LIVE: REGISTRATIONS ROUTER
 * ==============================================================================
 * Security & Access Rules:
 * 1. All routes are authenticated via Supabase JWT (authenticateUser).
 * 2. Identity is strictly anchored to req.user.id.
 * 3. Endpoints:
 *    - GET  /api/registrations/my                 : Retrieve all registrations for authenticated student
 *    - GET  /api/registrations/history            : Retrieve concluded activity history for authenticated student
 *    - GET  /api/registrations/status/:activityId : Check user's registration status & capacity
 *    - POST /api/registrations                   : Register authenticated student for an activity
 *    - POST /api/registrations/cancel            : Cancel registration for an activity
 * ==============================================================================
 */

// 1. GET /api/registrations/my (Current authenticated student registrations)
router.get('/my', authenticateUser, getMyRegistrations)

// 2. GET /api/registrations/history (Concluded activity history for authenticated student)
router.get('/history', authenticateUser, getMyActivityHistory)


// 2. GET /api/registrations/status/:activityId
router.get('/status/:activityId', authenticateUser, getRegistrationStatus)

// 3. POST /api/registrations
router.post('/', authenticateUser, registerForActivity)

// 4. POST /api/registrations/cancel
router.post('/cancel', authenticateUser, cancelRegistration)

export default router
