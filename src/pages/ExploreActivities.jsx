import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import SearchBar from '../components/common/SearchBar'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import ActivityCard from '../components/common/ActivityCard'
import EmptyState from '../components/common/EmptyState'
import {
  IconSearch,
  IconCalendar,
  IconSparkles,
} from '../components/icons/Icons'
import {
  allActivities,
  featuredActivities,
  upcomingActivities,
  activityCategories,
  dateFilters,
  departmentFilters,
  statusFilters,
} from '../data/activitiesData'

export default function ExploreActivities() {
  const navigate = useNavigate()

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDate, setSelectedDate] = useState('All Dates')
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Check if any filter is active
  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedDate !== 'All Dates' ||
    selectedDepartment !== 'All Departments' ||
    selectedStatus !== 'All'

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedDate('All Dates')
    setSelectedDepartment('All Departments')
    setSelectedStatus('All')
  }

  // Filtered list
  const filteredAll = useMemo(() => {
    return allActivities.filter((act) => {
      // Search query matches title, category, organizer, venue, department
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          act.title.toLowerCase().includes(q) ||
          act.category.toLowerCase().includes(q) ||
          act.organizer.toLowerCase().includes(q) ||
          act.venue.toLowerCase().includes(q) ||
          (act.department && act.department.toLowerCase().includes(q))
        if (!match) return false
      }

      // Category / Activity Type
      if (selectedCategory !== 'All') {
        if (act.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      // Department
      if (selectedDepartment !== 'All Departments') {
        if (!act.department || act.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
          return false
        }
      }

      // Status
      if (selectedStatus !== 'All') {
        if (act.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false
        }
      }

      // Date
      if (selectedDate !== 'All Dates') {
        if (selectedDate === 'Today' && act.dateGroup !== 'today') return false
        if (selectedDate === 'This Week' && act.dateGroup !== 'this_week' && act.dateGroup !== 'today') return false
        if (
          selectedDate === 'This Month' &&
          act.dateGroup !== 'this_month' &&
          act.dateGroup !== 'this_week' &&
          act.dateGroup !== 'today'
        ) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, selectedCategory, selectedDate, selectedDepartment, selectedStatus])

  return (
    <StudentLayout>
      {/* Page Header */}
      <PageHeader
        title="Explore Activities"
        subtitle="Discover upcoming events, workshops, competitions and more happening on campus."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Explore Activities' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/student/dashboard')}
            className="shadow-xs"
          >
            View My Registrations
          </Button>
        }
      />

      {/* Search & Filter Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs mb-8">
        {/* Large Search Bar */}
        <div className="mb-5">
          <SearchBar
            size="lg"
            placeholder="Search activities, workshops, competitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="shadow-2xs"
          />
        </div>

        {/* Activity Type Pills */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Activity Type
            </span>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Reset Type
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
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

        {/* Secondary Dropdown Filters */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
          {/* Date Filter */}
          <Select
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            options={dateFilters}
            className="text-xs"
          />

          {/* Department Filter */}
          <Select
            label="Department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            options={departmentFilters}
            className="text-xs"
          />

          {/* Status Filter */}
          <Select
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusFilters}
            className="text-xs"
          />
        </div>

        {/* Active Filters Summary & Reset */}
        {isFilterActive && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium">Active filters:</span>
              {searchQuery && (
                <Badge variant="primary" size="sm">
                  "{searchQuery}"
                </Badge>
              )}
              {selectedCategory !== 'All' && (
                <Badge variant="secondary" size="sm">
                  Type: {selectedCategory}
                </Badge>
              )}
              {selectedDate !== 'All Dates' && (
                <Badge variant="neutral" size="sm">
                  Date: {selectedDate}
                </Badge>
              )}
              {selectedDepartment !== 'All Departments' && (
                <Badge variant="neutral" size="sm">
                  Dept: {selectedDepartment}
                </Badge>
              )}
              {selectedStatus !== 'All' && (
                <Badge variant="warning" size="sm">
                  Status: {selectedStatus}
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Main Activities Presentation */}
      {filteredAll.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No activities found"
          description="Try changing your search or filters."
          actionText="Clear Filters"
          onAction={handleClearFilters}
          icon={<IconSearch className="w-6 h-6 text-slate-400" />}
          className="my-8"
        />
      ) : isFilterActive ? (
        /* Filtered Results View */
        <section aria-label="Filtered Activities" className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Matching Activities ({filteredAll.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Results matching your selected search criteria and filters
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredAll.length} of {allActivities.length} activities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAll.map((act) => (
              <ActivityCard
                key={act.id}
                title={act.title}
                category={act.category}
                date={act.date}
                time={act.time}
                venue={act.venue}
                organizer={act.organizer}
                description={act.description}
                status={act.status}
                statusVariant={act.statusVariant}
                badgeVariant={act.badgeVariant}
                thumbnailGradient={act.thumbnailGradient}
                spotsLeft={act.spotsLeft}
                actionText="View Details"
                onAction={() => navigate(`/student/activities/${act.id}`)}
              />
            ))}
          </div>
        </section>
      ) : (
        /* Default Browse Mode: Featured Activities + Upcoming Activities */
        <>
          {/* Featured Activities Section */}
          <section aria-label="Featured Activities" className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconSparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Featured Activities</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-priority flagship campus workshops, hackathons, and seminars
                  </p>
                </div>
              </div>
              <Badge variant="primary" size="md">
                3 Featured
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredActivities.map((act) => (
                <ActivityCard
                  key={act.id}
                  title={act.title}
                  category={act.category}
                  date={act.date}
                  time={act.time}
                  venue={act.venue}
                  organizer={act.organizer}
                  description={act.description}
                  status={act.status}
                  statusVariant={act.statusVariant}
                  badgeVariant={act.badgeVariant}
                  thumbnailGradient={act.thumbnailGradient}
                  spotsLeft={act.spotsLeft}
                  actionText="View Details"
                  onAction={() => navigate(`/student/activities/${act.id}`)}
                />
              ))}
            </div>
          </section>

          {/* All Upcoming Activities Section */}
          <section aria-label="Upcoming Activities" className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <IconCalendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upcoming Activities</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore all scheduled competitions, fests, workshops, and student meets
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {upcomingActivities.length} activities scheduled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingActivities.map((act) => (
                <ActivityCard
                  key={act.id}
                  title={act.title}
                  category={act.category}
                  date={act.date}
                  time={act.time}
                  venue={act.venue}
                  organizer={act.organizer}
                  description={act.description}
                  status={act.status}
                  statusVariant={act.statusVariant}
                  badgeVariant={act.badgeVariant}
                  thumbnailGradient={act.thumbnailGradient}
                  spotsLeft={act.spotsLeft}
                  actionText="View Details"
                  onAction={() => navigate(`/student/activities/${act.id}`)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </StudentLayout>
  )
}
