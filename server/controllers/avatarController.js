import { Readable } from 'node:stream'
import { Buffer } from 'node:buffer'
import { getAdminSupabase, supabase } from '../supabase.js'
import { formatSafeProfile } from './profileController.js'

/**
 * Allowed MIME types for avatar images
 */
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * Maximum avatar file size in bytes: 2 MB
 */
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

/**
 * Maps MIME types to standard file extensions
 */
function getExtensionForMime(mimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
    default:
      return 'webp'
  }
}

/**
 * Parses multipart/form-data from an Express incoming request into Web FormData
 * using Node.js web-standard streams and Response.formData().
 *
 * @param {import('express').Request} req
 * @returns {Promise<FormData>}
 */
async function parseMultipartRequest(req) {
  const contentType = req.headers['content-type'] || ''
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    const err = new Error('Content-Type must be multipart/form-data')
    err.code = 'INVALID_CONTENT_TYPE'
    err.statusCode = 400
    throw err
  }

  // Convert Node IncomingMessage stream into Web ReadableStream
  const webStream = Readable.toWeb(req)
  const webResponse = new Response(webStream, {
    headers: {
      'content-type': req.headers['content-type'],
      ...(req.headers['content-length'] ? { 'content-length': req.headers['content-length'] } : {}),
    },
  })

  return await webResponse.formData()
}

/**
 * POST /api/profile/avatar
 * Secure server-side avatar upload endpoint.
 *
 * Workflow:
 * 1. User authenticated via authenticateUser middleware. Target UID strictly bound to req.user.id.
 * 2. Parses multipart/form-data in memory (no temp files written to disk).
 * 3. Validates MIME type (JPEG, PNG, WebP) and size (<= 2 MB).
 * 4. Generates unique filename server-side and constructs isolated path: <req.user.id>/avatar-<unique>.webp
 * 5. Uploads to Supabase Storage 'avatars' bucket using server-side / service-role client.
 * 6. Obtains public CDN URL and persists to public.profiles.profile_image for id = req.user.id.
 * 7. Two-phase rollback: If DB update fails, automatically deletes newly uploaded storage file.
 * 8. Returns sanitized profile without leaking secrets, tokens, or credentials.
 */
export async function uploadAvatar(req, res, options = {}) {
  let uploadedFilePath = null
  let storageClient = null

  try {
    // --------------------------------------------------------------------------
    // 1. Identity & Authorization Verification
    // --------------------------------------------------------------------------
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Verified user identity missing.',
        code: 'AUTH_REQUIRED',
      })
    }

    // --------------------------------------------------------------------------
    // 2. Parse Multipart Payload
    // --------------------------------------------------------------------------
    let formData
    try {
      formData = options.formData || (await parseMultipartRequest(req))
    } catch (parseErr) {
      return res.status(parseErr.statusCode || 400).json({
        error: 'BadRequest',
        message: parseErr.message || 'Failed to parse multipart/form-data request.',
        code: parseErr.code || 'MULTIPART_PARSE_ERROR',
      })
    }

    const file = formData.get('avatar')
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'No avatar image file supplied. Expected multipart field "avatar".',
        code: 'AVATAR_FILE_MISSING',
      })
    }

    // --------------------------------------------------------------------------
    // 3. MIME Type & Size Validations
    // --------------------------------------------------------------------------
    const mimeType = (file.type || '').toLowerCase()
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: `Invalid image format '${mimeType || 'unknown'}'. Allowed formats: image/jpeg, image/png, image/webp.`,
        code: 'INVALID_IMAGE_TYPE',
        allowedTypes: Array.from(ALLOWED_MIME_TYPES),
      })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return res.status(413).json({
        error: 'PayloadTooLarge',
        message: `Image size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum limit of 2 MB.`,
        code: 'FILE_TOO_LARGE',
        maxBytes: MAX_FILE_SIZE_BYTES,
      })
    }

    // Convert file to Buffer in memory
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Avatar file cannot be empty (0 bytes).',
        code: 'EMPTY_FILE',
      })
    }

    // --------------------------------------------------------------------------
    // 4. Construct Isolated Storage Path (Server-Enforced)
    // --------------------------------------------------------------------------
    const extension = getExtensionForMime(mimeType)
    const uniqueName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`
    uploadedFilePath = `${userId}/${uniqueName}`

    // --------------------------------------------------------------------------
    // 5. Acquire Server-Side Administrative Storage & Database Client
    // --------------------------------------------------------------------------
    // Strictly utilize the server-side administrative client (service_role) to
    // perform trusted, isolated uploads to the 'avatars' bucket, preventing
    // accidental fallback to the public/anonymous key or unprivileged client.
    storageClient =
      options.storageClient ||
      options.adminClient ||
      req.app?.locals?.adminClient ||
      getAdminSupabase()

    if (!storageClient) {
      console.error(
        '[AvatarController] Configuration error: SUPABASE_SERVICE_ROLE_KEY is missing. ' +
        'Storage upload requires the server-side administrative client.'
      )
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message:
          'Avatar storage service is not properly configured on the server. SUPABASE_SERVICE_ROLE_KEY required.',
        code: 'STORAGE_ADMIN_CLIENT_REQUIRED',
      })
    }

    // --------------------------------------------------------------------------
    // 6. Upload to Supabase Storage 'avatars' Bucket
    // --------------------------------------------------------------------------
    const { error: uploadError } = await storageClient.storage
      .from('avatars')
      .upload(uploadedFilePath, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      console.error('[AvatarController] Storage upload error details:', {
        name: uploadError.name,
        message: uploadError.message,
        status: uploadError.status,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
        cause: uploadError.cause,
        stack: uploadError.stack?.split('\n').slice(0, 3).join('\n'),
      })
      console.error('[AvatarController] Upload context:', {
        bucket: 'avatars',
        uploadedFilePath,
        hasAdminClient: Boolean(getAdminSupabase()),
        clientIsAnon: storageClient === supabase,
      })
      return res.status(500).json({
        error: 'InternalServerError',
        message: uploadError.message || 'Failed to upload photo to storage.',
        code: 'STORAGE_UPLOAD_FAILED',
        storageDetails: {
          statusCode: uploadError.statusCode,
          status: uploadError.status,
          error: uploadError.error,
        },
      })
    }

    // --------------------------------------------------------------------------
    // 7. Obtain Public CDN URL
    // --------------------------------------------------------------------------
    const { data: urlData } = storageClient.storage.from('avatars').getPublicUrl(uploadedFilePath)
    const publicUrl = urlData?.publicUrl

    if (!publicUrl) {
      // Rollback uploaded file
      try {
        await storageClient.storage.from('avatars').remove([uploadedFilePath])
      } catch (cleanupErr) {
        console.warn('[AvatarController] Orphan file cleanup warning:', cleanupErr)
      }
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve public CDN URL for the uploaded photo.',
        code: 'CDN_URL_RESOLUTION_FAILED',
      })
    }

    // --------------------------------------------------------------------------
    // 8. Update public.profiles.profile_image (Strictly id = req.user.id)
    // --------------------------------------------------------------------------
    // Database updates for avatar persistence strictly utilize the server-side
    // administrative client (service_role) initialized with SUPABASE_SERVICE_ROLE_KEY.
    // This ensures trusted server-side persistence while avoiding silent fallback
    // to the unprivileged public or anonymous client.
    const dbClient =
      options.dbClient ||
      (options.adminClient?.from ? options.adminClient : null) ||
      (options.storageClient?.from ? options.storageClient : null) ||
      storageClient ||
      getAdminSupabase()

    if (!dbClient) {
      console.error(
        '[AvatarController] Configuration error: Administrative client is missing for profile update.'
      )
      try {
        await storageClient.storage.from('avatars').remove([uploadedFilePath])
      } catch (cleanupErr) {
        console.warn('[AvatarController] Orphan file cleanup warning:', cleanupErr)
      }

      return res.status(503).json({
        error: 'ServiceUnavailable',
        message:
          'Avatar service is not properly configured on the server. Administrative client required.',
        code: 'STORAGE_ADMIN_CLIENT_REQUIRED',
      })
    }

    const { data: updatedProfile, error: dbError } = await dbClient
      .from('profiles')
      .update({
        profile_image: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (dbError || !updatedProfile) {
      console.error('[AvatarController] Database update error:', {
        message: dbError?.message || 'Profile not found',
        code: dbError?.code,
        details: dbError?.details,
        hint: dbError?.hint,
        targetUserId: userId,
      })
      // Two-Phase Rollback: delete uploaded Storage file to prevent orphaned images
      try {
        await storageClient.storage.from('avatars').remove([uploadedFilePath])
        console.log('[AvatarController] Rollback: successfully removed orphaned storage file:', uploadedFilePath)
      } catch (cleanupErr) {
        console.warn('[AvatarController] Orphan file cleanup warning:', cleanupErr)
      }

      return res.status(500).json({
        error: 'InternalServerError',
        message: dbError?.message || 'Failed to update profile record in database.',
        code: 'PROFILE_UPDATE_FAILED',
      })
    }

    // --------------------------------------------------------------------------
    // 9. Return Sanitized Safe Profile
    // --------------------------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded and updated successfully.',
      profileImage: publicUrl,
      filePath: uploadedFilePath,
      profile: formatSafeProfile(updatedProfile, req.user),
    })
  } catch (err) {
    console.error('[AvatarController] Unexpected error in uploadAvatar:', err)

    // Attempt rollback if file was uploaded before the exception
    if (uploadedFilePath && storageClient) {
      try {
        await storageClient.storage.from('avatars').remove([uploadedFilePath])
      } catch (cleanupErr) {
        console.warn('[AvatarController] Orphan file cleanup warning:', cleanupErr)
      }
    }

    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while processing avatar upload.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}
