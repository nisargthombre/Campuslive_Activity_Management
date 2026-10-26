import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import SearchBar from '../components/common/SearchBar'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import {
  IconCalendar,
  IconMapPin,
  IconCheck,
  IconSearch,
  IconClipboardCheck,
  IconActivity,
  IconUsers,
  IconAlertCircle,
} from '../components/icons/Icons'
import {
  activityCategories,
  participationRecords as demoParticipationRecords,
  activitySummary as demoActivitySummary,
} from '../data/myActivityData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function MyActivity() {
  const navigate = useNavigate()
  const { user, isDemo } = useAuth()

  // State for search and active category filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // History data states
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({
    totalPastEvents: 0,
    totalParticipated: 0,
    thisYear: 0,
    workshops: 0,
    competitions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('loading') // 'database' | 'demo'

  // State for triggering retry
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const retryLoad = () => setReloadTrigger((prev) => prev + 1)

  // Fetch verified student registration history from Express backend API
  useEffect(() => {
    let ignore = false

    async function fetchHistory() {
      // A. Demo Mode: Load sample historical records clearly labeled as demo
      if (isDemo || user?.isDemo) {
        if (!ignore) {
          setRecords(demoParticipationRecords)
          setSummary(demoActivitySummary)
          setDataSource('demo')
          setIsLoading(false)
          setError(null)
        }
        return
      }

      // B. Authenticated Mode: Query backend API /api/registrations/history
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const token = session?.access_token

        if (!token) {
          if (!ignore) {
            console.info('[MyActivity] No active Supabase session, using demo fallback.')
            setRecords(demoParticipationRecords)
            setSummary(demoActivitySummary)
            setDataSource('demo')
            setIsLoading(false)
            setError(null)
          }
          return
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 6000)

        const response = await fetch(`${API_BASE_URL}/api/registrations/history`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}))
          throw new Error(errJson.message || `Server returned status ${response.status}`)
        }

        const data = await response.json()
        if (!ignore) {
          setRecords(data.records || [])
          setSummary(
            data.summary || {
              totalPastEvents: (data.records || []).length,
              totalParticipated: (data.records || []).length,
              thisYear: 0,
              workshops: 0,
              competitions: 0,
            }
          )
          setDataSource('database')
          setError(null)
          setIsLoading(false)
        }
      } catch (err) {
        console.warn('[MyActivity] Backend activity history request exception:', err.message || err)
        if (!ignore) {
          const isAbort = err?.name === 'AbortError'
          setError(
            isAbort
              ? 'History request timed out. Please check that the backend service is running.'
              : err?.message || 'Unable to load activity history. Please verify your connection.'
          )
          setIsLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      ignore = true
    }
  }, [isDemo, user, reloadTrigger])

  // Filter records based on category and search query
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Category filter
      if (selectedCategory !== 'All') {
        const cat = (rec.filterCategory || rec.category || '').toLowerCase()
        if (cat !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      // Search query filter (matches title, category, venue, organizer, department)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          (rec.title || '').toLowerCase().includes(q) ||
          (rec.category || '').toLowerCase().includes(q) ||
          (rec.venue || '').toLowerCase().includes(q) ||
          (rec.organizer || '').toLowerCase().includes(q) ||
          (rec.department || '').toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [records, selectedCategory, searchQuery])

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
  }

  return (
    <StudentLayout>
      {/* Page Header */}
      <PageHeader
        title="My Activity"
        subtitle="View your past registered activities and event history."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'My Activity' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/student/activities')}
            className="shadow-xs cursor-pointer"
          >
            Explore More Activities &rarr;
          </Button>
        }
      />

      {/* 4 Summary Cards */}
      <section aria-label="Activity History Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <StatCard
          title="Past Events"
          value={String(summary.totalPastEvents || summary.totalParticipated || 0)}
          icon={<IconActivity className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          change="Concluded"
          changeType="neutral"
          helperText="Concluded registered campus activities"
        />

        <StatCard
          title="This Year"
          value={String(summary.thisYear || 0)}
          icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          change="2026 Session"
          changeType="neutral"
          helperText="Activities concluded this academic year"
        />

        <StatCard
          title="Workshops"
          value={String(summary.workshops || 0)}
          icon={<IconClipboardCheck className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50 text-amber-600"
          change="Technical"
          changeType="positive"
          helperText="Hands-on workshop sessions"
        />

        <StatCard
          title="Competitions"
          value={String(summary.competitions || 0)}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Contests"
          changeType="positive"
          helperText="Hackathons & coding challenges"
        />
      </section>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs mb-8">
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            size="md"
            placeholder="Search past activities, workshops, organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Category Filter Pills */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Filter by Activity Type
            </span>
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {activityCategories.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }
                  `}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Results Summary & Storage Mode Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> concluded activity record{filteredRecords.length === 1 ? '' : 's'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>

          <div>
            {dataSource === 'database' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Registration History
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Offline Demo Mode (Sample History)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8 shadow-xs">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 mb-1">Loading Activity History</h4>
          <p className="text-xs text-slate-500">
            Retrieving your concluded registrations and event records...
          </p>
        </div>
      )}

      {/* Error State with Retry Button */}
      {!isLoading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-8 space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <IconAlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900 mb-1">
              Unable to Load Activity History
            </h4>
            <p className="text-xs text-rose-700 max-w-md mx-auto">
              {error}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={retryLoad}
              className="cursor-pointer"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Empty State vs Historical Records List */}
      {!isLoading && !error && filteredRecords.length === 0 && (
        <EmptyState
          title={
            searchQuery
              ? 'No matching activities found'
              : selectedCategory !== 'All'
              ? `No concluded activities in ${selectedCategory}`
              : 'No activity history yet'
          }
          description={
            searchQuery
              ? 'Try modifying your search keywords or resetting the category filter.'
              : selectedCategory !== 'All'
              ? 'You do not have concluded registrations under this category. Explore upcoming campus events!'
              : 'You have not registered for any concluded campus activities yet. When activities you register for conclude, they will appear here.'
          }
          actionText={
            searchQuery || selectedCategory !== 'All'
              ? 'Clear Filters'
              : 'Explore Activities'
          }
          onAction={
            searchQuery || selectedCategory !== 'All'
              ? handleResetFilters
              : () => navigate('/student/activities')
          }
          icon={
            searchQuery ? (
              <IconSearch className="w-6 h-6 text-slate-400" />
            ) : (
              <IconClipboardCheck className="w-6 h-6 text-slate-400" />
            )
          }
          className="my-8 bg-white"
        />
      )}

      {!isLoading && !error && filteredRecords.length > 0 && (
        <div className="space-y-4 mb-12">
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-stretch"
            >
              {/* Visual Strip */}
              <div
                className={`w-full sm:w-44 md:w-52 bg-gradient-to-br ${item.thumbnailGradient || 'from-blue-600 to-indigo-700'} p-4 flex flex-col justify-between shrink-0 relative overflow-hidden text-white`}
              >
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xs pointer-events-none" />
                <div className="absolute right-3 top-3 text-white/20 pointer-events-none">
                  <IconActivity className="w-10 h-10" />
                </div>

                <div className="relative z-10">
                  <Badge
                    variant={item.badgeVariant || 'primary'}
                    size="sm"
                    className="bg-white/20 backdrop-blur-xs text-white font-semibold"
                  >
                    {item.category}
                  </Badge>
                </div>

                <div className="relative z-10 mt-6 sm:mt-0">
                  <span className="text-[10px] text-white/80 uppercase tracking-wider block font-semibold">
                    Academic Year
                  </span>
                  <span className="text-xs font-semibold text-white">
                    Session {item.year || '2026'}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Status Badge */}
                    <Badge variant="success" size="md" dot className="font-semibold">
                      Concluded
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mb-3.5 flex items-center gap-1.5">
                    <IconUsers className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Organized by <strong className="text-slate-700 font-medium">{item.organizer}</strong>
                    </span>
                  </p>

                  {/* Date & Venue Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-800">{item.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IconMapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{item.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Archived registration record
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/activities/${item.activityId}`)}
                    className="hover:border-blue-600 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    View Activity &rarr;
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  )
}
