import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import SearchBar from '../components/common/SearchBar'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import ClubCard from '../components/common/ClubCard'
import LoadingState from '../components/common/LoadingState'
import { IconCheck, IconClose, IconAlertCircle } from '../components/icons/Icons'
import { clubCategories, initialClubsData, CLUBS_EVENT_KEY } from '../data/clubsData'
import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function StudentClubs() {
  const navigate = useNavigate()

  // Clubs state
  const [clubs, setClubs] = useState(initialClubsData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('demo')
  const [isSubmittingId, setIsSubmittingId] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [toast, setToast] = useState(null)

  const [reloadToken, setReloadToken] = useState(0)
  const refreshClubs = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadToken((k) => k + 1)
  }, [])

  // Fetch clubs from Express API with demo/offline fallback
  useEffect(() => {
    let ignore = false

    const loadClubs = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const headers = {}
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`
        }

        const response = await fetch(`${API_BASE_URL}/api/clubs`, {
          method: 'GET',
          headers,
        })

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}))
          throw new Error(errorJson.message || `Server returned status ${response.status}`)
        }

        const result = await response.json()
        if (!ignore) {
          setDataSource(result.source || (result.isDemo ? 'demo' : 'live'))
          setError(null)
        }
        if (Array.isArray(result.clubs) && result.clubs.length > 0) {
          // Also check local demo memberships overlay if in demo mode
          try {
            const savedDemo = JSON.parse(
              localStorage.getItem('campuslive_demo_club_memberships') || '{}'
            )
            const merged = result.clubs.map((c) => {
              if (savedDemo[c.id]) {
                const dm = savedDemo[c.id]
                const effStatus = dm.status === 'joined' ? 'Joined' : dm.status === 'pending' ? 'Pending' : 'Not Joined'
                return {
                  ...c,
                  membershipStatus: effStatus,
                  membersCount:
                    dm.status === 'joined' && c.membershipStatus !== 'Joined'
                      ? c.membersCount + 1
                      : dm.status === 'left' && c.membershipStatus === 'Joined'
                      ? Math.max(0, c.membersCount - 1)
                      : c.membersCount,
                }
              }
              return c
            })
            if (!ignore) setClubs(merged)
          } catch {
            if (!ignore) setClubs(result.clubs)
          }
        } else {
          if (!ignore) setClubs(initialClubsData)
        }
      } catch (err) {
        console.warn('[StudentClubs] Live fetch note, falling back to local dataset:', err.message || err)
        try {
          const savedDemo = JSON.parse(
            localStorage.getItem('campuslive_demo_club_memberships') || '{}'
          )
          const overlaid = initialClubsData.map((c) => {
            if (savedDemo[c.id]) {
              const dm = savedDemo[c.id]
              const effStatus = dm.status === 'joined' ? 'Joined' : dm.status === 'pending' ? 'Pending' : 'Not Joined'
              return {
                ...c,
                membershipStatus: effStatus,
                membersCount:
                  dm.status === 'joined' && c.membershipStatus !== 'Joined'
                    ? c.membersCount + 1
                    : dm.status === 'left' && c.membershipStatus === 'Joined'
                    ? Math.max(0, c.membersCount - 1)
                    : c.membersCount,
              }
            }
            return c
          })
          if (!ignore) setClubs(overlaid)
        } catch {
          if (!ignore) setClubs(initialClubsData)
        }
        if (!ignore) {
          setDataSource('demo')
          setError('Backend clubs service is currently unreachable. Displaying offline demo clubs.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadClubs()
    return () => {
      ignore = true
    }
  }, [reloadToken])

  // Derived counts
  const totalClubsCount = clubs.length
  const joinedClubsCount = useMemo(
    () => clubs.filter((c) => c.membershipStatus === 'Joined').length,
    [clubs]
  )

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts = { All: clubs.length }
    clubCategories.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = clubs.filter((c) => c.category.toLowerCase() === cat.toLowerCase()).length
      }
    })
    return counts
  }, [clubs])

  // Filtered clubs based on search and category
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (club.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      // Search filter (name, description, faculty coordinator, lead)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          club.name.toLowerCase().includes(q) ||
          club.description.toLowerCase().includes(q) ||
          (club.category && club.category.toLowerCase().includes(q)) ||
          (club.facultyCoordinator && club.facultyCoordinator.toLowerCase().includes(q)) ||
          (club.leadName && club.leadName.toLowerCase().includes(q))
        if (!matches) return false
      }

      return true
    })
  }, [clubs, selectedCategory, searchQuery])

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Join Club Action (server-backed with demo fallback)
  const handleJoinClub = async (club) => {
    if (isSubmittingId) return
    setIsSubmittingId(club.id)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      let joinedSuccess = false
      let updatedMembersCount = club.membersCount + 1
      let serverMessage = `You have successfully joined ${club.name}! Welcome aboard.`

      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${club.id}/join`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const resData = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (res.status === 409) {
            showToast(resData.message || `You are already a member of ${club.name}.`, 'info')
            refreshClubs()
            return
          }
          throw new Error(resData.message || 'Failed to join club on the server.')
        }

        joinedSuccess = true
        if (typeof resData.membersCount === 'number') {
          updatedMembersCount = resData.membersCount
        }
        if (resData.message) {
          serverMessage = resData.message
        }
      } else {
        // Safe offline / demo client join
        try {
          const savedDemo = JSON.parse(
            localStorage.getItem('campuslive_demo_club_memberships') || '{}'
          )
          savedDemo[club.id] = { status: 'joined', joinedAt: new Date().toISOString() }
          localStorage.setItem('campuslive_demo_club_memberships', JSON.stringify(savedDemo))
        } catch {
          // ignore
        }
        joinedSuccess = true
        serverMessage = `You have joined ${club.name} (Demo Mode).`
      }

      if (joinedSuccess) {
        setClubs((prev) =>
          prev.map((c) => {
            if (c.id === club.id) {
              return {
                ...c,
                membershipStatus: 'Joined',
                membersCount: updatedMembersCount,
              }
            }
            return c
          })
        )
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(CLUBS_EVENT_KEY, {
              detail: { clubId: club.id, status: 'joined' },
            })
          )
        }
        showToast(serverMessage, 'success')
      }
    } catch (err) {
      console.error('[StudentClubs] Join error:', err)
      showToast(err.message || 'Failed to join club. Please try again.', 'danger')
    } finally {
      setIsSubmittingId(null)
    }
  }

  // Leave Club Action (server-backed with demo fallback)
  const handleLeaveClub = async (club) => {
    if (isSubmittingId) return
    setIsSubmittingId(club.id)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      let leaveSuccess = false
      let updatedMembersCount = Math.max(0, club.membersCount - 1)
      let serverMessage = `You have left ${club.name}.`

      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${club.id}/leave`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const resData = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(resData.message || 'Failed to leave club on the server.')
        }

        leaveSuccess = true
        if (typeof resData.membersCount === 'number') {
          updatedMembersCount = resData.membersCount
        }
        if (resData.message) {
          serverMessage = resData.message
        }
      } else {
        // Safe offline / demo client leave
        try {
          const savedDemo = JSON.parse(
            localStorage.getItem('campuslive_demo_club_memberships') || '{}'
          )
          savedDemo[club.id] = { status: 'left', leftAt: new Date().toISOString() }
          localStorage.setItem('campuslive_demo_club_memberships', JSON.stringify(savedDemo))
        } catch {
          // ignore
        }
        leaveSuccess = true
        serverMessage = `You have left ${club.name} (Demo Mode).`
      }

      if (leaveSuccess) {
        setClubs((prev) =>
          prev.map((c) => {
            if (c.id === club.id) {
              return {
                ...c,
                membershipStatus: 'Not Joined',
                membersCount: updatedMembersCount,
              }
            }
            return c
          })
        )
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(CLUBS_EVENT_KEY, {
              detail: { clubId: club.id, status: 'left' },
            })
          )
        }
        showToast(serverMessage, 'info')
      }
    } catch (err) {
      console.error('[StudentClubs] Leave error:', err)
      showToast(err.message || 'Failed to leave club. Please try again.', 'danger')
    } finally {
      setIsSubmittingId(null)
    }
  }

  // Cancel Request Action
  const handleCancelRequest = (club) => {
    handleLeaveClub(club)
  }

  // View Club Action - navigate to Club Details page
  const handleViewClub = (club) => {
    navigate(`/student/clubs/${club.id}`)
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
  }

  return (
    <StudentLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all bg-white border-slate-200 text-slate-800">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500'
                : toast.type === 'info'
                ? 'bg-blue-500'
                : 'bg-rose-500'
            }`}
          />
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 ml-2 cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Clubs"
        subtitle="Discover student clubs and find communities that match your interests."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Clubs' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {dataSource === 'demo' && (
              <Badge variant="warning" size="md" className="py-1 px-3 shadow-2xs font-medium">
                Offline Demo
              </Badge>
            )}
            <Badge variant="success" size="md" className="py-1 px-3 shadow-2xs font-medium">
              <IconCheck className="w-3.5 h-3.5 mr-1 inline text-emerald-600" />
              {joinedClubsCount} Clubs Joined
            </Badge>
          </div>
        }
      />

      {/* Error Retry Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshClubs()}
            className="text-xs text-rose-700 border-rose-300 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search & Category Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="w-full md:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search clubs by name or keywords..."
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between md:justify-end gap-2">
            <span>
              Showing <strong className="text-slate-800">{filteredClubs.length}</strong> of{' '}
              {totalClubsCount} clubs
            </span>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium ml-1 underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 shrink-0 mr-1">Categories:</span>
          {clubCategories.map((category) => {
            const isSelected = selectedCategory.toLowerCase() === category.toLowerCase()
            const count = categoryCounts[category] ?? 0
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }
                `}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingState message="Loading campus clubs..." />
      ) : filteredClubs.length > 0 ? (
        /* Clubs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onView={handleViewClub}
              onJoin={handleJoinClub}
              onLeave={handleLeaveClub}
              onCancelRequest={handleCancelRequest}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No clubs found"
          description="No student clubs match your current search or category filter. Try refining your keywords or clearing the category filter."
          actionLabel="Reset Search & Filters"
          onAction={handleResetFilters}
        />
      )}
    </StudentLayout>
  )
}

