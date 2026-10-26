import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Uploads a cropped student avatar blob to the Express backend endpoint:
 * POST /api/profile/avatar (multipart/form-data, field: 'avatar')
 *
 * The Express backend handles:
 * 1. Cryptographic authentication and user verification.
 * 2. Secure server-side upload to the Supabase Storage 'avatars' bucket under <auth.uid()>/avatar-<unique>.webp
 * 3. Atomic persistence to public.profiles.profile_image.
 * 4. Two-phase rollback if persistence fails.
 *
 * @param {Blob} blob - Cropped image blob (image/webp, image/jpeg, or image/png)
 * @param {Function} [refreshProfile] - Optional AuthContext profile refresh callback
 * @returns {Promise<{ publicUrl: string, filePath: string, profile: object }>}
 */
export async function uploadAndPersistProfileImage(blob, refreshProfile = null) {
  // 1. Authenticate caller and obtain verified session access token
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user?.id || !session?.access_token) {
    throw new Error('Your session has expired or is invalid. Please sign in again.')
  }

  // 2. Validate blob locally before sending
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('Invalid image file. Please select a valid photo.')
  }

  const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
  if (blob.size > MAX_SIZE) {
    throw new Error('Image size exceeds maximum limit of 2 MB. Please choose a smaller photo.')
  }

  const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/png' ? 'png' : 'webp'
  const filename = `avatar-${Date.now()}.${extension}`

  // 3. Construct multipart/form-data payload with field 'avatar'
  const formData = new FormData()
  formData.append('avatar', blob, filename)

  // Safe diagnostic log without exposing any access token, secret, or password
  console.log('[ProfileImage] Sending avatar to Express backend:', {
    endpoint: `${API_BASE_URL}/api/profile/avatar`,
    userId: session.user.id,
    mimeType: blob.type || 'image/webp',
    sizeBytes: blob.size,
  })

  // 4. Send multipart/form-data to POST /api/profile/avatar
  // Note: Do NOT set Content-Type header manually; browser fetch sets boundary automatically
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    })
  } catch (netErr) {
    console.error('[ProfileImage] Network error connecting to backend:', netErr)
    throw new Error(
      'Unable to connect to the backend server to upload profile photo. Please ensure backend is running.',
      { cause: netErr }
    )
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[ProfileImage] Backend upload error:', errorData)

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.')
    }
    if (response.status === 413) {
      throw new Error('Image exceeds 2 MB size limit. Please select a smaller photo.')
    }

    throw new Error(
      errorData.message || `Server error (${response.status}) uploading profile photo.`
    )
  }

  const result = await response.json()
  const publicUrl = result.profileImage || result.publicUrl
  const filePath = result.filePath
  const profile = result.profile

  if (!publicUrl) {
    throw new Error('Server responded with success but did not return the image URL.')
  }

  console.log('[ProfileImage] Avatar successfully uploaded and persisted:', {
    filePath,
    publicUrl,
  })

  // 5. Trigger AuthContext profile refresh to propagate to Navigation bars & Layouts
  if (typeof refreshProfile === 'function') {
    try {
      await refreshProfile()
    } catch (err) {
      console.warn('[ProfileImage] Non-critical refreshProfile error:', err)
    }
  }

  return { publicUrl, filePath, profile }
}
