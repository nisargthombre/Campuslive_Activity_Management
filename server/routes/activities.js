import { Router } from 'express'
import { optionalAuthenticateUser } from '../middleware/auth.js'
import { getActivities, getActivityById } from '../controllers/activityController.js'

const router = Router()

/**
 * ==============================================================================
 * CAMPUS LIVE: ACTIVITIES ROUTER
 * ==============================================================================
 * 1. GET /api/activities
 *    Returns activities appropriate for student discovery.
 *    Uses optionalAuthenticateUser: allows public browsing while scoping to
 *    authenticated user JWT when token is provided.
 *
 * 2. GET /api/activities/:id
 *    Returns detailed information for a single activity.
 *    Uses optionalAuthenticateUser: allows public browsing while scoping to
 *    authenticated user JWT when token is provided.
 * ==============================================================================
 */

router.get('/', optionalAuthenticateUser, getActivities)
router.get('/:id', optionalAuthenticateUser, getActivityById)

export default router
