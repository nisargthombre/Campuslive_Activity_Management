/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

import { normalizeRole } from '../lib/authUtils'
export { normalizeRole }

// Helper to normalize database rows and API responses into a unified profile format
function normalizeProfile(apiProfile, user = null) {
  if (!apiProfile) return null
  return {
    ...apiProfile,
    id: apiProfile.id || user?.id,
    full_name: apiProfile.fullName || apiProfile.full_name || user?.user_metadata?.full_name || '',
    fullName: apiProfile.fullName || apiProfile.full_name || user?.user_metadata?.full_name || '',
    email: apiProfile.email || user?.email || '',
    role: apiProfile.role ? normalizeRole(apiProfile.role) : 'student',
    department: apiProfile.department || null,
    course: apiProfile.course || null,
    student_id: apiProfile.studentId || apiProfile.student_id || '',
    studentId: apiProfile.studentId || apiProfile.student_id || '',
    academic_year: apiProfile.academicYear || apiProfile.academic_year || '',
    academicYear: apiProfile.academicYear || apiProfile.academic_year || '',
    division: apiProfile.division || null,
    enrollment_year: apiProfile.enrollmentYear || apiProfile.enrollment_year || '',
    enrollmentYear: apiProfile.enrollmentYear || apiProfile.enrollment_year || '',
    phone: apiProfile.phone || null,
    profile_image: (apiProfile.profileImage || apiProfile.profile_image)?.trim() || null,
    profileImage: (apiProfile.profileImage || apiProfile.profile_image)?.trim() || null,
    social_links: apiProfile.socialLinks || apiProfile.social_links || {},
    socialLinks: apiProfile.socialLinks || apiProfile.social_links || {},
    is_active: apiProfile.isActive !== undefined ? apiProfile.isActive : apiProfile.is_active !== false,
    isActive: apiProfile.isActive !== undefined ? apiProfile.isActive : apiProfile.is_active !== false,
    created_at: apiProfile.createdAt || apiProfile.created_at || null,
    createdAt: apiProfile.createdAt || apiProfile.created_at || null,
    updated_at: apiProfile.updatedAt || apiProfile.updated_at || null,
    updatedAt: apiProfile.updatedAt || apiProfile.updated_at || null,
  }
}

// 1. Create the Auth Context
const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  error: null,
  isProfileMissing: false,
  isDemo: false,
  refreshProfile: async () => {},
  signOut: async () => {},
  loginDemoUser: () => {},
})

// 2. Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProfileMissing, setIsProfileMissing] = useState(false)

  // Helper to fetch the authenticated user profile via backend API: GET /api/profile/me
  const fetchProfile = useCallback(async (token = null) => {
    let accessToken = token
    let currentSessionUser = null

    if (!accessToken) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        accessToken = session?.access_token
        currentSessionUser = session?.user
      } catch (err) {
        console.error('[AuthContext] Error retrieving session for profile fetch:', err)
      }
    }

    if (!accessToken) {
      setProfile(null)
      setError(null)
      setIsProfileMissing(false)
      return null
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.status === 401) {
        setProfile(null)
        setError('Session expired or unauthorized. Please sign in again.')
        return null
      }

      if (response.status === 403) {
        const data = await response.json().catch(() => ({}))
        setProfile(null)
        setError(data.message || 'Access forbidden. Your account may be inactive.')
        return null
      }

      if (response.status === 404) {
        setProfile(null)
        setIsProfileMissing(true)
        setError(null)
        return null
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setProfile(null)
        setError(data.message || `Server error (${response.status}) loading profile.`)
        return null
      }

      const result = await response.json()
      const apiProfile = result.profile || result
      const normalized = normalizeProfile(apiProfile, currentSessionUser)

      setProfile(normalized)
      setError(null)
      setIsProfileMissing(false)
      return normalized
    } catch (err) {
      console.warn('[AuthContext] Primary backend profile request notice:', err.message || err)

      // Resilient fallback: Direct Supabase query if Express backend is offline or network fails
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser(accessToken)

        if (authUser?.id) {
          const { data: directProfile, error: directErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle()

          if (!directErr && directProfile) {
            const normalized = normalizeProfile(directProfile, authUser)
            setProfile(normalized)
            setError(null)
            setIsProfileMissing(false)
            return normalized
          } else if (!directErr && !directProfile) {
            setProfile(null)
            setIsProfileMissing(true)
            setError(null)
            return null
          }
        }
      } catch (fallbackErr) {
        console.warn('[AuthContext] Direct Supabase fallback notice:', fallbackErr?.message || fallbackErr)
      }

      setProfile(null)
      const isAbort = err?.name === 'AbortError'
      const isNet = err?.message?.includes('fetch') || err?.name === 'TypeError'
      setError(
        isAbort
          ? 'Profile request timed out. Please verify backend server is responsive.'
          : isNet
          ? 'Unable to connect to the profile service. Please check your network and retry.'
          : err?.message || 'An unexpected error occurred while loading profile.'
      )
      return null
    }
  }, [])

  // Function to re-fetch the profile on demand (e.g. after editing profile or retrying)
  const refreshProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setProfile(null)
        return null
      }
      return await fetchProfile(session.access_token)
    } catch (err) {
      console.error('[AuthContext] Error in refreshProfile:', err)
      return null
    }
  }, [fetchProfile])

  // Explicit demo user login helper
  const loginDemoUser = useCallback((demoData) => {
    if (!demoData) return
    try {
      localStorage.setItem('campuslive_user', JSON.stringify(demoData))
      window.dispatchEvent(new Event('campuslive_auth_updated'))
    } catch {
      // ignore
    }
    const simulatedUser = {
      id: 'demo-user',
      email: demoData.email || 'demo@campus.edu',
      isDemo: true,
      user_metadata: {
        full_name: demoData.name,
        role: demoData.role,
      },
    }
    const simulatedProfile = {
      ...demoData,
      id: 'demo-user',
      isDemo: true,
      full_name: demoData.name,
      fullName: demoData.name,
      role: demoData.role,
    }
    setUser(simulatedUser)
    setProfile(simulatedProfile)
    setLoading(false)
  }, [])

  // Sign out helper
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[AuthContext] Error signing out:', err?.message || err)
    } finally {
      try {
        localStorage.removeItem('campuslive_user')
        localStorage.removeItem('campuslive_auth_session')
        sessionStorage.clear()
        window.dispatchEvent(new Event('campuslive_auth_updated'))
      } catch {
        // ignore
      }
      setUser(null)
      setProfile(null)
      setError(null)
      setIsProfileMissing(false)
      setLoading(false)
    }
  }, [])

  // Listen for Supabase Auth state changes and initial session
  useEffect(() => {
    let isMounted = true

    async function handleAuthChange(session) {
      try {
        const currentUser = session?.user || null
        if (!isMounted) return

        if (currentUser) {
          setUser(currentUser)

          if (session?.access_token) {
            await fetchProfile(session.access_token)
          } else {
            setProfile(null)
            setError(null)
            setIsProfileMissing(false)
          }
        } else {
          // Check for supported local demo user
          let demoUser = null
          try {
            const raw = localStorage.getItem('campuslive_user')
            if (raw) demoUser = JSON.parse(raw)
          } catch {
            demoUser = null
          }

          if (demoUser && demoUser.email) {
            const simulatedUser = {
              id: 'demo-user',
              email: demoUser.email,
              isDemo: true,
              user_metadata: {
                full_name: demoUser.name,
                role: demoUser.role,
              },
            }
            const simulatedProfile = {
              ...demoUser,
              id: 'demo-user',
              isDemo: true,
              full_name: demoUser.name,
              fullName: demoUser.name,
              role: demoUser.role,
            }
            setUser(simulatedUser)
            setProfile(simulatedProfile)
          } else {
            setUser(null)
            setProfile(null)
          }
          setError(null)
          setIsProfileMissing(false)
        }
      } catch (err) {
        console.error('[AuthContext] Error in handleAuthChange:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        await handleAuthChange(session)
      } catch (err) {
        console.error('[AuthContext] Error checking initial auth session:', err)
        if (isMounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth state updates (sign in, sign out, token refreshed, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          try {
            localStorage.removeItem('campuslive_user')
          } catch {
            // ignore
          }
          setUser(null)
          setProfile(null)
          setError(null)
          setIsProfileMissing(false)
          setLoading(false)
        }
        return
      }
      await handleAuthChange(session)
    })

    // Listen to local auth update events
    const handleLocalSync = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange(session)
      })
    }
    window.addEventListener('campuslive_auth_updated', handleLocalSync)
    window.addEventListener('storage', handleLocalSync)

    return () => {
      isMounted = false
      subscription?.unsubscribe()
      window.removeEventListener('campuslive_auth_updated', handleLocalSync)
      window.removeEventListener('storage', handleLocalSync)
    }
  }, [fetchProfile])

  const isDemo = Boolean(user?.isDemo || profile?.isDemo)

  const value = {
    user,
    profile,
    loading,
    error,
    isProfileMissing,
    isDemo,
    refreshProfile,
    signOut,
    loginDemoUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 3. Custom hook to consume the Auth Context easily in any component
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
