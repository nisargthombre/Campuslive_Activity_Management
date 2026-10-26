import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.js'
import {
  getMyTickets,
  createTicket,
  getTicketById,
  addTicketMessage,
} from '../controllers/supportController.js'

const router = Router()

/**
 * ==============================================================================
 * CAMPUS LIVE: STUDENT SUPPORT TICKETS ROUTER
 * ==============================================================================
 * Endpoints:
 * 1. GET  /api/support/tickets             : List authenticated student's tickets
 * 2. POST /api/support/tickets             : Create a new support ticket
 * 3. GET  /api/support/tickets/:id         : Fetch ticket details (owner-restricted)
 * 4. POST /api/support/tickets/:id/messages: Add a reply to a ticket (owner-restricted)
 *
 * Root aliases are also provided for convenience:
 * - GET  /api/support
 * - POST /api/support
 * - GET  /api/support/:id
 * - POST /api/support/:id/messages
 * ==============================================================================
 */

// Primary /tickets subpaths
router.get('/tickets', authenticateUser, getMyTickets)
router.post('/tickets', authenticateUser, createTicket)
router.get('/tickets/:id', authenticateUser, getTicketById)
router.post('/tickets/:id/messages', authenticateUser, addTicketMessage)

// Root aliases
router.get('/', authenticateUser, getMyTickets)
router.post('/', authenticateUser, createTicket)
router.get('/:id', authenticateUser, getTicketById)
router.post('/:id/messages', authenticateUser, addTicketMessage)

export default router
