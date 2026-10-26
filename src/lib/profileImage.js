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

  if (sessionError || !session?.user?.id) {
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
  const filePath = `${session.user.id}/${filename}`

  // Check if Express backend is explicitly configured OR running locally on localhost
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const hasCustomApi = Boolean(import.meta.env.VITE_API_URL)

  if (hasCustomApi || isLocalhost) {
    try {
      const formData = new FormData()
      formData.append('avatar', blob, filename)

      const response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const publicUrl = result.profileImage || result.publicUrl
        if (typeof refreshProfile === 'function') {
          await refreshProfile().catch(() => {})
        }
        return { publicUrl, filePath: result.filePath, profile: result.profile }
      }
    } catch {
      // Fall through to direct Supabase upload
    }
  }

  // DIRECT SUPABASE STORAGE UPLOAD (Cloud native for Vercel without Express)
  try {
    // 1. Upload file into the Supabase 'avatars' bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: blob.type || 'image/webp',
        upsert: true,
      })

    if (uploadError) {
      console.error('[ProfileImage] Supabase Storage upload error:', uploadError)
      throw new Error(uploadError.message || 'Failed to upload photo to Supabase storage.')
    }

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl
    if (!publicUrl) {
      throw new Error('Unable to retrieve public image URL.')
    }

    // 3. Update public.profiles table
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({
        profile_image: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select('*')
      .maybeSingle()

    if (profileError) {
      console.warn('[ProfileImage] Direct profile update warning:', profileError)
    }

    // 4. Update user metadata in auth.users so local session has it immediately
    await supabase.auth
      .updateUser({
        data: { profile_image: publicUrl },
      })
      .catch(() => {})

    // 5. Trigger AuthContext profile refresh
    if (typeof refreshProfile === 'function') {
      try {
        await refreshProfile()
      } catch (err) {
        console.warn('[ProfileImage] Non-critical refreshProfile error:', err)
      }
    }

    return { publicUrl, filePath, profile: updatedProfile }
  } catch (err) {
    console.error('[ProfileImage] Direct upload failed:', err)
    throw new Error(err.message || 'Failed to upload and save profile photo.')
  }
}
