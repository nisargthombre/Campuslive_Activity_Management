/* global process */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Load environment variables (.env.local prioritized, fallback to .env from workspace root or current dir)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: '.env.local' })
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * 1. Default Supabase Client (Anonymous/Publishable Key)
 * Used for public auth operations (e.g. verifying user tokens via auth.getUser).
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  : null

/**
 * 2. Authenticated User Client Factory
 * Creates a scoped Supabase client configured with the caller's JWT access token.
 * This ensures that database queries executed with this client strictly respect
 * PostgreSQL Row Level Security (RLS) policies defined on `public.profiles` and other tables.
 *
 * @param {string} accessToken - Supabase access token (JWT) from the Authorization header
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getAuthenticatedClient(accessToken) {
  if (!isSupabaseConfigured) return null

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth:
    {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

/**
 * 3. Optional Admin Client (Service Role Key)
 * Only initialized if SUPABASE_SERVICE_ROLE_KEY is provided in the environment.
 * Bypasses RLS for trusted background tasks or administrative profile lookups.
 */
export const adminSupabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    : null

/**
 * Returns an instance of the Admin Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Falls back to checking environment dynamically.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getAdminSupabase() {
  if (adminSupabase) return adminSupabase
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (url && key) {
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return null
}

/**
 * Validates connection to the Supabase project
 */
export async function testSupabaseConnection() {
  if (!supabase) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase credentials missing from environment variables.',
    }
  }

  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    // If error code is 42501 (RLS/permissions), connection is still verified
    if (error && error.code !== '42501' && error.code !== 'PGRST116') {
      const isNetworkError =
        error.message?.includes('fetch failed') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('ECONNREFUSED')

      return {
        connected: !isNetworkError,
        configured: true,
        message: isNetworkError
          ? `Network error reaching Supabase: ${error.message}`
          : `Supabase reached (API notice: ${error.message})`,
      }
    }

    return {
      connected: true,
      configured: true,
      message: 'Supabase client connected and operational.',
    }
  } catch (err) {
    return {
      connected: false,
      configured: true,
      message: `Error connecting to Supabase: ${err.message || String(err)}`,
    }
  }
}
