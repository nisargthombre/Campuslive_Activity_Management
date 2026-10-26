import { supabase, getAuthenticatedClient, adminSupabase } from '../supabase.js'

/**
 * ==============================================================================
 * CAMPUS LIVE - AUTHENTICATION MIDDLEWARE
 * ==============================================================================
 * Flow Architecture for Viva & Project Defense:
 *
 * 1. Token Extraction:
 *    The client (React Vite frontend) sends an HTTP request with an 'Authorization'
 *    header adhering to RFC 6750: `Authorization: Bearer <access_token>`.
 *
 * 2. Cryptographic JWT Verification:
 *    We pass the Bearer token to `supabase.auth.getUser(token)`.
 *    Supabase verifies the signature, expiration (`exp`), and cryptographic integrity
 *    against the project's JWT secret without storing sensitive credentials in memory.
 *
 * 3. Profile Fetching & Row Level Security (RLS):
 *    Using the verified user ID (`user.id`), we fetch the corresponding student,
 *    faculty, or admin profile record from `public.profiles`. We use an authenticated
 *    Supabase client scoped with the user's token (`getAuthenticatedClient`), ensuring
 *    PostgreSQL Row Level Security (RLS) policies are honored.
 *
 * 4. Status Checks (Account Inactivity & Profile Existence):
 *    - Rejects if the user does not have a row in `public.profiles`.
 *    - Rejects if `is_active === false` (administrative suspension).
 *
 * 5. Request Decoration:
 *    Attaches `req.user` (Supabase Auth identity) and `req.profile` (database metadata)
 *    to the Express request object, available to subsequent controller handlers.
 * ==============================================================================
 */

export async function authenticateUser(req, res, next) {
  try {
    // --------------------------------------------------------------------------
    // Step 1: Extract Authorization Header
    // --------------------------------------------------------------------------
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Authorization header missing.',
        code: 'AUTH_HEADER_MISSING',
      })
    }

    const parts = authHeader.trim().split(/\s+/)
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: "Invalid Authorization header format. Expected 'Bearer <token>'.",
        code: 'AUTH_HEADER_MALFORMED',
      })
    }

    const token = parts[1]
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token cannot be empty.',
        code: 'AUTH_TOKEN_EMPTY',
      })
    }

    // --------------------------------------------------------------------------
    // Step 2: Verify Access Token with Supabase Auth
    // --------------------------------------------------------------------------
    if (!supabase) {
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Authentication service is not configured on the server.',
        code: 'AUTH_SERVICE_UNAVAILABLE',
      })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: authError?.message || 'Invalid or expired access token. Please sign in again.',
        code: 'AUTH_TOKEN_INVALID',
      })
    }

    // --------------------------------------------------------------------------
    // Step 3: Fetch matching profile from `public.profiles`
    // --------------------------------------------------------------------------
    // Prefer authenticated client to preserve RLS; fallback to admin client if configured
    const client = getAuthenticatedClient(token) || adminSupabase || supabase

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[AuthMiddleware] Error fetching public.profiles row:', profileError.message)
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve profile record from database.',
        code: 'PROFILE_DATABASE_ERROR',
      })
    }

    // Reject missing profile
    if (!profile) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'User profile record not found in public.profiles. Registration may be incomplete.',
        code: 'PROFILE_NOT_FOUND',
      })
    }

    // Reject deactivated / inactive users
    if (profile.is_active === false) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account has been deactivated or suspended by campus administration.',
        code: 'ACCOUNT_INACTIVE',
      })
    }

    // --------------------------------------------------------------------------
    // Step 4: Attach Authenticated Context to Express Request
    // --------------------------------------------------------------------------
    req.user = user
    req.profile = profile
    req.token = token

    return next()
  } catch (err) {
    console.error('[AuthMiddleware] Unexpected authentication exception:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred during authentication.',
      code: 'AUTH_UNEXPECTED_ERROR',
    })
  }
}

/**
 * Optional Authentication Middleware
 * Allows public endpoints (e.g. activity discovery/details) to be accessed without a token.
 * If an Authorization header is provided, verifies the JWT token and attaches req.user,
 * req.profile, and req.token. If no token is provided, gracefully proceeds with req.user = null.
 * If a token is provided but is expired/invalid, returns 401 AUTH_TOKEN_INVALID so the client
 * can prompt for re-authentication.
 */
export async function optionalAuthenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    // If no Authorization header is sent, allow public access
    if (!authHeader) {
      req.user = null
      req.profile = null
      req.token = null
      return next()
    }

    const parts = authHeader.trim().split(/\s+/)
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: "Invalid Authorization header format. Expected 'Bearer <token>'.",
        code: 'AUTH_HEADER_MALFORMED',
      })
    }

    const token = parts[1]
    if (!token) {
      req.user = null
      req.profile = null
      req.token = null
      return next()
    }

    if (!supabase) {
      req.user = null
      req.profile = null
      req.token = null
      return next()
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: authError?.message || 'Invalid or expired access token. Please sign in again.',
        code: 'AUTH_TOKEN_INVALID',
      })
    }

    // Attach authenticated client/profile if available
    const client = getAuthenticatedClient(token) || adminSupabase || supabase
    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    req.user = user
    req.profile = profile || null
    req.token = token

    return next()
  } catch (err) {
    console.error('[OptionalAuthMiddleware] Unexpected exception:', err)
    // Fail safe to public view on unexpected auth exception
    req.user = null
    req.profile = null
    req.token = null
    return next()
  }
}
