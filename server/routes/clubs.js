import { Router } from 'express'
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth.js'
import {
  getClubs,
  getMyMemberships,
  getClubById,
  joinClub,
  leaveClub,
} from '../controllers/clubController.js'

const router = Router()

/**
 * ==============================================================================
 * CAMPUS LIVE: CLUBS ROUTER
 * ==============================================================================
 * Endpoints:
 * 1. GET  /api/clubs          : List active clubs (optional auth for personalized status)
 * 2. GET  /api/clubs/my       : List authenticated student's joined clubs
 * 3. GET  /api/clubs/:id      : Fetch club details by UUID or slug
 * 4. POST /api/clubs/:id/join : Join a club for authenticated student
 * 5. POST /api/clubs/:id/leave: Leave a club for authenticated student
 * ==============================================================================
 */

// 1. GET /api/clubs
router.get('/', optionalAuthenticateUser, getClubs)

// 2. GET /api/clubs/my (Must precede /:id)
router.get('/my', authenticateUser, getMyMemberships)

// 3. GET /api/clubs/:id
router.get('/:id', optionalAuthenticateUser, getClubById)

// 4. POST /api/clubs/:id/join
router.post('/:id/join', authenticateUser, joinClub)

// 5. POST /api/clubs/:id/leave
router.post('/:id/leave', authenticateUser, leaveClub)

export default router
