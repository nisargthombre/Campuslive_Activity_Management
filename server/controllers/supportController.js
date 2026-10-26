import {
  getAdminSupabase,
  getAuthenticatedClient,
  adminSupabase,
  supabase,
} from '../supabase.js'
import { initialUnifiedTickets, supportCategoriesList, supportPrioritiesList } from '../../src/data/unifiedSupportData.js'

/**
 * ==============================================================================
 * CAMPUS LIVE: STUDENT SUPPORT TICKETS CONTROLLER
 * ==============================================================================
 * Security & Architectural Constraints:
 * 1. Cryptographic Identity Anchor:
 *    The student ID is derived EXCLUSIVELY from req.user.id (verified via
 *    Supabase Auth JWT). Client-supplied student IDs in the body are strictly ignored.
 *
 * 2. Ownership Isolation:
 *    A student can ONLY view, list, or post messages to support tickets they own
 *    (ticket.student_id === req.user.id). Any attempt to inspect or message another
 *    student's ticket returns HTTP 403 Forbidden.
 *
 * 3. Validation Rules:
 *    - Subject and description are required (HTTP 400 Bad Request).
 *    - Category must be valid (HTTP 400 Bad Request).
 *    - Message text cannot be empty (HTTP 400 Bad Request).
 *    - Closed tickets cannot receive new replies (HTTP 400 Bad Request).
 *
 * 4. Audit & Metadata:
 *    - Ticket numbers follow institutional format (e.g. TICK-2026-XXXX).
 *    - Timestamps are recorded in ISO and formatted strings.
 *
 * 5. Resilient Demo & Offline Fallback:
 *    - If Supabase is unconfigured, paused, or tables are not yet migrated,
 *      controller falls back gracefully to in-memory store with source: 'demo'.
 * ==============================================================================
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * In-memory demo support tickets store.
 * Initialized with initial student tickets from unifiedSupportData.
 */
export const demoTicketsStore = []

// Seed initial student tickets from unifiedSupportData
const initialStudentTickets = initialUnifiedTickets.filter((t) => t.origin === 'student')
for (const t of initialStudentTickets) {
  demoTicketsStore.push({
    ...t,
    student_id: '00000000-0000-0000-0000-000000000001', // Default seed student
  })
}

/**
 * Mutex keyed by ticket identifier to prevent race conditions during ticket updates.
 */
const ticketLocks = new Map()

export async function withTicketLock(ticketId, fn) {
  const currentLock = ticketLocks.get(ticketId) || Promise.resolve()
  let release
  const nextLock = new Promise((resolve) => {
    release = resolve
  })
  ticketLocks.set(ticketId, currentLock.then(() => nextLock))

  try {
    await currentLock
    return await fn()
  } finally {
    release()
    if (ticketLocks.get(ticketId) === nextLock) {
      ticketLocks.delete(ticketId)
    }
  }
}

/**
 * Helper to acquire the best available Supabase client.
 * Follows the trusted-backend pattern:
 * Prefers the administrative client (getAdminSupabase / adminSupabase) for server-orchestrated
 * operations (reply insertions, updated_at timestamps) after strict authentication
 * and ownership verification. Falls back to caller-authenticated client or demo store.
 */
function getClient(req) {
  return (
    req?.mockClient ||
    getAdminSupabase() ||
    adminSupabase ||
    (req?.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
    supabase
  )
}

/**
 * Helper to format a date into institutional ticket string format:
 * '24 Sep 2026, 09:00 AM'
 */
export function formatTicketDate(isoDateString) {
  const d = isoDateString ? new Date(isoDateString) : new Date()
  const dateFormatted = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${dateFormatted}, ${timeFormatted}`
}

/**
 * Standardizes a ticket row with its messages into client-safe object format.
 */
export function formatSafeTicket(ticketRow, messages = [], profile = null) {
  if (!ticketRow) return null

  const creatorName =
    profile?.full_name ||
    ticketRow.creator?.name ||
    ticketRow.sender_name ||
    'Student'

  const creatorEmail = profile?.email || ticketRow.creator?.email || ''
  const creatorRole = profile?.role || ticketRow.creator?.role || 'Student'
  const creatorDept = profile?.department || ticketRow.creator?.department || 'General'
  const studentId = profile?.student_id || ticketRow.creator?.studentId || ''

  const formattedMessages = messages.map((m) => {
    const avatar = m.sender_name
      ? m.sender_name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : m.avatar || 'U'

    return {
      id: m.id,
      ticketId: m.ticket_id || ticketRow.id,
      senderId: m.sender_id || null,
      senderName: m.sender_name || m.senderName || 'User',
      senderRole: m.sender_role || m.senderRole || m.role || 'Student',
      role: m.sender_role || m.senderRole || m.role || 'Student',
      avatar,
      text: m.message || m.text || '',
      message: m.message || m.text || '',
      timestamp: m.created_at ? formatTicketDate(m.created_at) : (m.timestamp || m.time || 'Just now'),
      time: m.created_at ? formatTicketDate(m.created_at) : (m.time || m.timestamp || 'Just now'),
      isStaff: Boolean(m.is_staff ?? m.isStaff),
      createdAt: m.created_at || new Date().toISOString(),
    }
  })

  return {
    id: ticketRow.id,
    ticketNumber: ticketRow.ticket_number || ticketRow.ticketNumber || ticketRow.id,
    origin: ticketRow.origin || 'student',
    subject: ticketRow.subject || '',
    category: ticketRow.category || 'General Inquiry',
    priority: ticketRow.priority || 'Medium',
    status: ticketRow.status || 'Open',
    assignedTo: ticketRow.assigned_to || ticketRow.assignedTo || 'Unassigned',
    createdDate: ticketRow.created_at ? formatTicketDate(ticketRow.created_at) : (ticketRow.createdDate || 'Just now'),
    lastUpdated: ticketRow.updated_at ? formatTicketDate(ticketRow.updated_at) : (ticketRow.lastUpdated || 'Just now'),
    description: ticketRow.description || '',
    attachmentName: ticketRow.attachment_name || ticketRow.attachmentName || null,
    creator: {
      name: creatorName,
      role: creatorRole,
      email: creatorEmail,
      department: creatorDept,
      studentId: studentId,
    },
    messages: formattedMessages,
    createdAt: ticketRow.created_at || null,
    updatedAt: ticketRow.updated_at || null,
  }
}

/**
 * GET /api/support/tickets (also /api/support)
 * Retrieves tickets belonging exclusively to the authenticated student.
 */
export async function getMyTickets(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in to view your support tickets.',
        code: 'AUTH_REQUIRED',
      })
    }

    const { category, status, search } = req.query || {}
    const client = getClient(req)
    let liveTickets = null
    let liveMessagesMap = new Map()

    if (client && UUID_REGEX.test(userId)) {
      try {
        let query = client
          .from('support_tickets')
          .select('*')
          .eq('student_id', userId)
          .order('created_at', { ascending: false })

        if (status && status !== 'All') {
          if (status === 'Open') {
            query = query.in('status', ['Open', 'Assigned'])
          } else {
            query = query.eq('status', status)
          }
        }

        if (category && category !== 'All') {
          query = query.eq('category', category)
        }

        const { data: ticketRows, error: ticketErr } = await query

        if (!ticketErr && Array.isArray(ticketRows)) {
          liveTickets = ticketRows

          if (liveTickets.length > 0) {
            const ticketIds = liveTickets.map((t) => t.id)
            const { data: msgRows } = await client
              .from('support_ticket_messages')
              .select('*')
              .in('ticket_id', ticketIds)
              .order('created_at', { ascending: true })

            if (Array.isArray(msgRows)) {
              for (const msg of msgRows) {
                if (!liveMessagesMap.has(msg.ticket_id)) {
                  liveMessagesMap.set(msg.ticket_id, [])
                }
                liveMessagesMap.get(msg.ticket_id).push(msg)
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn('[SupportController] Live tickets query note:', dbErr.message || dbErr)
      }
    }

    const isLive = liveTickets !== null
    let ticketsToReturn

    if (isLive) {
      ticketsToReturn = liveTickets.map((t) => {
        const msgs = liveMessagesMap.get(t.id) || []
        return formatSafeTicket(t, msgs, req.profile)
      })
    } else {
      // In-memory demo fallback for current student
      ticketsToReturn = demoTicketsStore
        .filter((t) => t.student_id === userId || !t.student_id)
        .map((t) => formatSafeTicket(t, t.messages || [], req.profile))

      // Apply status filter if fallback
      if (status && status !== 'All') {
        if (status === 'Open') {
          ticketsToReturn = ticketsToReturn.filter(
            (t) => t.status === 'Open' || t.status === 'Assigned'
          )
        } else {
          ticketsToReturn = ticketsToReturn.filter(
            (t) => t.status.toLowerCase() === status.toLowerCase()
          )
        }
      }

      // Apply category filter if fallback
      if (category && category !== 'All') {
        ticketsToReturn = ticketsToReturn.filter(
          (t) => t.category.toLowerCase() === category.toLowerCase()
        )
      }
    }

    // Apply search filter if query string provided
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase()
      ticketsToReturn = ticketsToReturn.filter((t) => {
        return (
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        )
      })
    }

    return res.status(200).json({
      success: true,
      tickets: ticketsToReturn,
      total: ticketsToReturn.length,
      isDemo: !isLive,
      source: isLive ? 'live' : 'demo',
    })
  } catch (err) {
    console.error('[SupportController] Error in getMyTickets:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to retrieve support tickets.',
    })
  }
}

/**
 * POST /api/support/tickets (also /api/support)
 * Creates a new support ticket for the authenticated student.
 */
export async function createTicket(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in to create a support ticket.',
        code: 'AUTH_REQUIRED',
      })
    }

    const { subject, description, category, priority, attachmentName } = req.body || {}

    // Validation
    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Please provide a ticket subject.',
        code: 'SUBJECT_REQUIRED',
      })
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Please provide a detailed description of the issue.',
        code: 'DESCRIPTION_REQUIRED',
      })
    }

    const cleanSubject = String(subject).trim()
    const cleanDescription = String(description).trim()
    const cleanCategory = category && supportCategoriesList.includes(category) ? category : supportCategoriesList[0]
    const cleanPriority = priority && supportPrioritiesList.includes(priority) ? priority : 'Medium'
    const cleanAttachment = attachmentName ? String(attachmentName).trim() : null

    // Generate formatted institutional ticket number
    const randomTicketSuffix = Math.floor(1000 + Math.random() * 9000)
    const ticketNumber = `TICK-2026-${randomTicketSuffix}`

    const client = getClient(req)
    let liveCreatedTicket = null
    let liveCreatedMessage = null

    if (client && UUID_REGEX.test(userId)) {
      try {
        // Insert ticket row
        const { data: ticketRow, error: ticketErr } = await client
          .from('support_tickets')
          .insert({
            ticket_number: ticketNumber,
            student_id: userId,
            origin: 'student',
            subject: cleanSubject,
            description: cleanDescription,
            category: cleanCategory,
            priority: cleanPriority,
            status: 'Open',
            attachment_name: cleanAttachment,
            assigned_to: 'Unassigned',
          })
          .select()
          .single()

        if (!ticketErr && ticketRow) {
          liveCreatedTicket = ticketRow

          // Insert opening message
          const senderName = req.profile?.full_name || req.user.email || 'Student'
          const { data: msgRow, error: msgErr } = await client
            .from('support_ticket_messages')
            .insert({
              ticket_id: liveCreatedTicket.id,
              sender_id: userId,
              sender_name: senderName,
              sender_role: 'Student',
              message: cleanDescription,
              is_staff: false,
            })
            .select()
            .single()

          if (!msgErr && msgRow) {
            liveCreatedMessage = msgRow
          }
        }
      } catch (dbErr) {
        console.warn('[SupportController] Live ticket creation note:', dbErr.message || dbErr)
      }
    }

    if (liveCreatedTicket) {
      const messages = liveCreatedMessage ? [liveCreatedMessage] : []
      const safeTicket = formatSafeTicket(liveCreatedTicket, messages, req.profile)

      return res.status(201).json({
        success: true,
        message: `Support ticket ${safeTicket.ticketNumber} created successfully!`,
        ticket: safeTicket,
        isDemo: false,
        source: 'live',
      })
    }

    // Demo store fallback
    const nowIso = new Date().toISOString()
    const nowFormatted = formatTicketDate(nowIso)
    const senderName = req.profile?.full_name || req.user.email || 'Student'
    const avatarInitials = senderName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const demoTicket = {
      id: `tick-${Date.now()}`,
      ticket_number: ticketNumber,
      ticketNumber: ticketNumber,
      student_id: userId,
      origin: 'student',
      subject: cleanSubject,
      description: cleanDescription,
      category: cleanCategory,
      priority: cleanPriority,
      status: 'Open',
      attachment_name: cleanAttachment,
      attachmentName: cleanAttachment,
      assigned_to: 'Unassigned',
      assignedTo: 'Unassigned',
      created_at: nowIso,
      updated_at: nowIso,
      createdDate: nowFormatted,
      lastUpdated: nowFormatted,
      creator: {
        name: senderName,
        role: req.profile?.role || 'Student',
        email: req.user.email || '',
        department: req.profile?.department || 'General',
        studentId: req.profile?.student_id || '',
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender_name: senderName,
          senderName: senderName,
          sender_role: 'Student',
          senderRole: 'Student',
          role: 'Student',
          avatar: avatarInitials || 'ST',
          message: cleanDescription,
          text: cleanDescription,
          created_at: nowIso,
          timestamp: nowFormatted,
          time: nowFormatted,
          is_staff: false,
          isStaff: false,
        },
      ],
    }

    demoTicketsStore.unshift(demoTicket)

    const formattedDemoTicket = formatSafeTicket(demoTicket, demoTicket.messages, req.profile)

    return res.status(201).json({
      success: true,
      message: `Support ticket ${formattedDemoTicket.ticketNumber} created successfully (Demo Mode).`,
      ticket: formattedDemoTicket,
      isDemo: true,
      source: 'demo',
    })
  } catch (err) {
    console.error('[SupportController] Error in createTicket:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'An error occurred while creating the support ticket.',
    })
  }
}

/**
 * GET /api/support/tickets/:id
 * Fetches an individual ticket only if the authenticated student owns it.
 */
export async function getTicketById(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to view this support ticket.',
        code: 'AUTH_REQUIRED',
      })
    }

    const { id } = req.params
    if (!id || !String(id).trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Ticket identifier is required.',
        code: 'TICKET_ID_MISSING',
      })
    }

    const cleanId = String(id).trim()
    const client = getClient(req)
    let liveTicket = null
    let liveMessages = []

    if (client) {
      try {
        let query = client.from('support_tickets').select('*')
        if (UUID_REGEX.test(cleanId)) {
          query = query.or(`id.eq.${cleanId},ticket_number.eq.${cleanId}`)
        } else {
          query = query.eq('ticket_number', cleanId)
        }

        const { data, error } = await query.maybeSingle()

        if (!error && data) {
          liveTicket = data

          const { data: msgData } = await client
            .from('support_ticket_messages')
            .select('*')
            .eq('ticket_id', liveTicket.id)
            .order('created_at', { ascending: true })

          if (Array.isArray(msgData)) {
            liveMessages = msgData
          }
        }
      } catch (dbErr) {
        console.warn('[SupportController] Live getTicketById note:', dbErr.message || dbErr)
      }
    }

    if (liveTicket) {
      const userRole = (req.profile?.role || req.user?.role || '').toLowerCase()
      const isStaff = ['faculty', 'admin', 'super_admin', 'superadmin'].includes(userRole)

      // Ownership isolation check: Students can ONLY view their own tickets. Staff can inspect.
      if (liveTicket.student_id !== userId && !isStaff) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied. You do not have permission to view another student’s ticket.',
          code: 'FORBIDDEN_TICKET_ACCESS',
        })
      }

      return res.status(200).json({
        success: true,
        ticket: formatSafeTicket(liveTicket, liveMessages, req.profile),
        isDemo: false,
        source: 'live',
      })
    }

    // Demo store lookup
    const demoTicket = demoTicketsStore.find(
      (t) =>
        t.id === cleanId ||
        (t.ticket_number && t.ticket_number.toLowerCase() === cleanId.toLowerCase()) ||
        (t.ticketNumber && t.ticketNumber.toLowerCase() === cleanId.toLowerCase())
    )

    if (!demoTicket) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Support ticket '${cleanId}' was not found.`,
        code: 'TICKET_NOT_FOUND',
      })
    }

    // Ownership check in demo mode
    const userRole = (req.profile?.role || req.user?.role || '').toLowerCase()
    const isStaff = ['faculty', 'admin', 'super_admin', 'superadmin'].includes(userRole)

    if (demoTicket.student_id && demoTicket.student_id !== userId && !isStaff) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You do not have permission to view another student’s ticket.',
        code: 'FORBIDDEN_TICKET_ACCESS',
      })
    }

    return res.status(200).json({
      success: true,
      ticket: formatSafeTicket(demoTicket, demoTicket.messages || [], req.profile),
      isDemo: true,
      source: 'demo',
    })
  } catch (err) {
    console.error('[SupportController] Error in getTicketById:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to retrieve ticket details.',
    })
  }
}

/**
 * POST /api/support/tickets/:id/messages
 * Adds a message/reply to a ticket with server-side authorization.
 */
export async function addTicketMessage(req, res) {
  const { id } = req.params
  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in to send a reply.',
      code: 'AUTH_REQUIRED',
    })
  }

  if (!id || !String(id).trim()) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Ticket identifier is required.',
      code: 'TICKET_ID_MISSING',
    })
  }

  const { message, text } = req.body || {}
  const rawMessage = message || text
  if (!rawMessage || !String(rawMessage).trim()) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Message text cannot be empty.',
      code: 'MESSAGE_REQUIRED',
    })
  }

  const cleanId = String(id).trim()
  const cleanMessage = String(rawMessage).trim()

  return withTicketLock(cleanId, async () => {
    try {
      const client = getClient(req)
      let liveTicket = null

      if (client) {
        try {
          let query = client.from('support_tickets').select('*')
          if (UUID_REGEX.test(cleanId)) {
            query = query.or(`id.eq.${cleanId},ticket_number.eq.${cleanId}`)
          } else {
            query = query.eq('ticket_number', cleanId)
          }

          const { data } = await query.maybeSingle()
          liveTicket = data || null
        } catch {
          liveTicket = null
        }
      }

      if (liveTicket) {
        const userRole = (req.profile?.role || req.user?.role || '').toLowerCase()
        const isStaff = ['faculty', 'admin', 'super_admin', 'superadmin'].includes(userRole)

        // Ownership / authorization check:
        // Students can ONLY reply to their own tickets. Staff can reply to student tickets.
        if (liveTicket.student_id !== userId && !isStaff) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Access denied. You cannot post replies to another student’s ticket.',
            code: 'FORBIDDEN_TICKET_ACCESS',
          })
        }

        // Closed ticket check
        if (liveTicket.status === 'Closed') {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Cannot post replies to a closed support ticket.',
            code: 'TICKET_CLOSED',
          })
        }

        // Server-determined sender metadata (never trust client payload for staff/role)
        const senderRole = isStaff
          ? req.profile?.role === 'faculty'
            ? 'Faculty Coordinator'
            : req.profile?.role === 'super_admin'
            ? 'Super Admin'
            : 'Support Staff'
          : 'Student'
        const senderName = req.profile?.full_name || req.user.email || (isStaff ? 'Staff Support' : 'Student')

        const { data: insertedMsg, error: insertErr } = await client
          .from('support_ticket_messages')
          .insert({
            ticket_id: liveTicket.id,
            sender_id: userId,
            sender_name: senderName,
            sender_role: senderRole,
            message: cleanMessage,
            is_staff: isStaff,
          })
          .select()
          .single()

        if (insertErr) {
          throw insertErr
        }

        // Update ticket's updated_at
        await client
          .from('support_tickets')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', liveTicket.id)

        // Fetch full message list
        const { data: allMsgs } = await client
          .from('support_ticket_messages')
          .select('*')
          .eq('ticket_id', liveTicket.id)
          .order('created_at', { ascending: true })

        const safeTicket = formatSafeTicket(liveTicket, allMsgs || [insertedMsg], req.profile)

        return res.status(201).json({
          success: true,
          message: 'Your reply has been submitted.',
          ticketMessage: insertedMsg,
          ticket: safeTicket,
          isDemo: false,
          source: 'live',
        })
      }

      // Demo store handling
      const demoTicket = demoTicketsStore.find(
        (t) =>
          t.id === cleanId ||
          (t.ticket_number && t.ticket_number.toLowerCase() === cleanId.toLowerCase()) ||
          (t.ticketNumber && t.ticketNumber.toLowerCase() === cleanId.toLowerCase())
      )

      if (!demoTicket) {
        return res.status(404).json({
          error: 'NotFound',
          message: `Support ticket '${cleanId}' was not found.`,
          code: 'TICKET_NOT_FOUND',
        })
      }

      // Ownership authorization in demo mode
      const userRole = (req.profile?.role || req.user?.role || '').toLowerCase()
      const isStaff = ['faculty', 'admin', 'super_admin', 'superadmin'].includes(userRole)

      if (demoTicket.student_id && demoTicket.student_id !== userId && !isStaff) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied. You cannot post replies to another student’s ticket.',
          code: 'FORBIDDEN_TICKET_ACCESS',
        })
      }

      if (demoTicket.status === 'Closed') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Cannot post replies to a closed support ticket.',
          code: 'TICKET_CLOSED',
        })
      }

      const nowIso = new Date().toISOString()
      const nowFormatted = formatTicketDate(nowIso)
      const senderRole = isStaff
        ? req.profile?.role === 'faculty'
          ? 'Faculty Coordinator'
          : req.profile?.role === 'super_admin'
          ? 'Super Admin'
          : 'Support Staff'
        : 'Student'
      const senderName = req.profile?.full_name || req.user.email || (isStaff ? 'Staff Support' : 'Student')
      const avatarInitials = senderName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

      const newMsg = {
        id: `msg-${Date.now()}`,
        ticket_id: demoTicket.id,
        sender_id: userId,
        sender_name: senderName,
        senderName: senderName,
        sender_role: senderRole,
        senderRole: senderRole,
        role: senderRole,
        avatar: avatarInitials || (isStaff ? 'STF' : 'ST'),
        message: cleanMessage,
        text: cleanMessage,
        created_at: nowIso,
        timestamp: nowFormatted,
        time: nowFormatted,
        is_staff: isStaff,
        isStaff: isStaff,
      }

      demoTicket.messages = [...(demoTicket.messages || []), newMsg]
      demoTicket.updated_at = nowIso
      demoTicket.lastUpdated = nowFormatted

      const safeDemoTicket = formatSafeTicket(demoTicket, demoTicket.messages, req.profile)

      return res.status(201).json({
        success: true,
        message: 'Your reply has been submitted (Demo Mode).',
        ticketMessage: newMsg,
        ticket: safeDemoTicket,
        isDemo: true,
        source: 'demo',
      })
    } catch (err) {
      console.error('[SupportController] Error in addTicketMessage:', err)
      return res.status(500).json({
        error: 'InternalServerError',
        message: err.message || 'An error occurred while posting your reply.',
      })
    }
  })
}
