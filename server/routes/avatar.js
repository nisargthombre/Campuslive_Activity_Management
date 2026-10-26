import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.js'
import { uploadAvatar } from '../controllers/avatarController.js'

const router = Router()

/**
 * POST /api/profile/avatar
 * Uploads a cropped student avatar via multipart/form-data, stores it in Supabase Storage
 * under <auth-user-id>/avatar-<unique>.webp, updates public.profiles.profile_image,
 * and returns the updated profile.
 */
router.post('/', authenticateUser, uploadAvatar)

export default router
