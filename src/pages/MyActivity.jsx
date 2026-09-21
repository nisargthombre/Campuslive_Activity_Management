import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '../components/icons/Icons'
import {
  activityCategories,
  participationRecords,
  activitySummary,
} from '../data/myActivityData'

export default function MyActivity() {
  const navigate = useNavigate()

  // State for search and active category filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Filter records based on category and search query
  const filteredRecords = useMemo(() => {
    return participationRecords.filter((rec) => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (rec.filterCategory.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      // Search query filter (matches title, category, venue, organizer)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          rec.title.toLowerCase().includes(q) ||
          rec.category.toLowerCase().includes(q) ||
          rec.venue.toLowerCase().includes(q) ||
          rec.organizer.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [selectedCategory, searchQuery])

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
        subtitle="View your participation history and activities you have attended."
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
            className="shadow-xs"
          >
            Explore More Activities &rarr;
          </Button>
        }
      />

      {/* 4 Summary Cards */}
      <section aria-label="Participation Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <StatCard
          title="Total Participated"
          value={String(activitySummary.totalParticipated)}
          icon={<IconActivity className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          change="Attended"
          changeType="positive"
          helperText="All verified campus activities"
        />

        <StatCard
          title="This Year"
          value={String(activitySummary.thisYear)}
          icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          change="2026 Session"
          changeType="neutral"
          helperText="Activities completed this academic year"
        />

        <StatCard
          title="Workshops"
          value={String(activitySummary.workshops)}
          icon={<IconClipboardCheck className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50 text-amber-600"
          change="Technical"
          changeType="positive"
          helperText="Hands-on learning sessions"
        />

        <StatCard
          title="Competitions"
          value={String(activitySummary.competitions)}
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
            placeholder="Search attended activities, workshops, organizers..."
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

        {/* Active Results Summary */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> verified participation record{filteredRecords.length === 1 ? '' : 's'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
            All records verified by faculty
          </span>
        </div>
      </div>

      {/* Participation Records List */}
      {filteredRecords.length === 0 ? (
        /* Empty State */
        <EmptyState
          title={
            searchQuery
              ? 'No matching activities found'
              : selectedCategory !== 'All'
              ? `No attended activities in ${selectedCategory}`
              : 'No participation history yet'
          }
          description={
            searchQuery
              ? 'Try modifying your search keywords or resetting the category filter.'
              : 'You have not attended activities under this category yet. Explore upcoming campus events!'
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
      ) : (
        /* Activity History Cards */
        <div className="space-y-4 mb-12">
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-stretch"
            >
              {/* Visual Strip */}
              <div
                className={`w-full sm:w-44 md:w-52 bg-gradient-to-br ${item.thumbnailGradient} p-4 flex flex-col justify-between shrink-0 relative overflow-hidden text-white`}
              >
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xs pointer-events-none" />
                <div className="absolute right-3 top-3 text-white/20 pointer-events-none">
                  <IconActivity className="w-10 h-10" />
                </div>

                <div className="relative z-10">
                  <Badge variant={item.badgeVariant} size="sm" className="bg-white/20 backdrop-blur-xs text-white font-semibold">
                    {item.category}
                  </Badge>
                </div>

                <div className="relative z-10 mt-6 sm:mt-0">
                  <span className="text-[10px] text-white/80 uppercase tracking-wider block font-semibold">
                    Academic Year
                  </span>
                  <span className="text-xs font-semibold text-white">
                    Session {item.year}
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

                    {/* Participation Status Badge (Clearly distinguishing Participated from Registered) */}
                    <Badge variant="success" size="md" dot className="font-semibold">
                      {item.participationStatus} &bull; Attended
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mb-3.5 flex items-center gap-1.5">
                    <IconUsers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Organized by <strong className="text-slate-700 font-medium">{item.organizer}</strong></span>
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

                  {/* Verification Note */}
                  {item.verificationNote && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
                      <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item.verificationNote}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Verified record in student co-curricular ledger
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/activities/${item.activityId}`)}
                    className="hover:border-blue-600 hover:text-blue-600 font-medium"
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
