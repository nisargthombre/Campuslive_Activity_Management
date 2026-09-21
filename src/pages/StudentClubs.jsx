import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import SearchBar from '../components/common/SearchBar'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import ClubCard from '../components/common/ClubCard'
import { IconCheck, IconClose } from '../components/icons/Icons'
import { clubCategories, initialClubsData } from '../data/clubsData'

export default function StudentClubs() {
  const navigate = useNavigate()

  // Clubs state
  const [clubs, setClubs] = useState(initialClubsData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [toast, setToast] = useState(null)

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
          club.facultyCoordinator.toLowerCase().includes(q) ||
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

  // Join Club Action
  const handleJoinClub = (club) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === club.id) {
          return {
            ...c,
            membershipStatus: 'Joined',
            membersCount: c.membersCount + 1,
          }
        }
        return c
      })
    )

    showToast(`You have successfully joined ${club.name}! Welcome aboard.`, 'success')
  }

  // Leave Club Action
  const handleLeaveClub = (club) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === club.id) {
          return {
            ...c,
            membershipStatus: 'Not Joined',
            membersCount: Math.max(0, c.membersCount - 1),
          }
        }
        return c
      })
    )

    showToast(`You have left ${club.name}.`, 'info')
  }

  // Cancel Request Action
  const handleCancelRequest = (club) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === club.id) {
          return {
            ...c,
            membershipStatus: 'Not Joined',
          }
        }
        return c
      })
    )

    showToast(`Membership request for ${club.name} was cancelled.`, 'info')
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
                : 'bg-amber-500'
            }`}
          />
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 ml-2"
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
            <Badge variant="success" size="md" className="py-1 px-3 shadow-2xs font-medium">
              <IconCheck className="w-3.5 h-3.5 mr-1 inline text-emerald-600" />
              {joinedClubsCount} Clubs Joined
            </Badge>
          </div>
        }
      />

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

      {/* Clubs Grid */}
      {filteredClubs.length > 0 ? (
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
