'use client'

import { useState, useEffect } from 'react'
import { Search, RefreshCw, ExternalLink, Calendar, Building2, MapPin, AlertCircle, CheckCircle, Briefcase } from 'lucide-react'
import { searchFederalGRCJobs } from '../lib/usajobsAPI'

interface USAJob {
  id: string
  title: string
  organization: string
  location: string
  description: string
  url: string
  salary: {
    min: number
    max: number
  }
  posted: string
  closes: string
  clearance?: string
  remote: boolean
}

interface USAJobsDashboardProps {
  resumeContent?: string
  selectedResumeName?: string
  onTailorResume?: (jobDescription: string, jobTitle: string, company: string) => void
}

export default function USAJobsDashboard({ resumeContent, selectedResumeName, onTailorResume }: USAJobsDashboardProps) {
  const [jobs, setJobs] = useState<USAJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'organization' | 'title'>('date')
  const [filteredJobs, setFilteredJobs] = useState<USAJob[]>([])

  // Load jobs on mount
  useEffect(() => {
    loadJobs()
  }, [])

  // Filter and sort jobs when dependencies change
  useEffect(() => {
    let filtered = [...jobs]
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.posted).getTime() - new Date(a.posted).getTime()
        case 'organization':
          return a.organization.localeCompare(b.organization)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
    
    setFilteredJobs(filtered)
  }, [jobs, searchTerm, sortBy])

  const loadJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      setStatusMessage('🏛️ Loading federal GRC opportunities...')
      const usaJobs = await searchFederalGRCJobs()
      
      if (usaJobs && usaJobs.length > 0) {
        setJobs(usaJobs)
        setLastRefresh(new Date().toISOString())
        setStatusMessage(`✅ Found ${usaJobs.length} federal GRC opportunities`)
      } else {
        setStatusMessage('📭 No federal GRC jobs found')
      }
    } catch (err) {
      console.error('Error loading USA jobs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load USA jobs')
      setStatusMessage('❌ Failed to load USA jobs')
    } finally {
      setLoading(false)
    }
  }

  const [statusMessage, setStatusMessage] = useState('')

  const handleRefresh = () => {
    loadJobs()
  }

  const handleJobClick = (job: USAJob) => {
    if (job.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleTailorResume = (job: USAJob) => {
    if (onTailorResume && job.description) {
      onTailorResume(job.description, job.title, job.organization)
    }
  }

  const handleAppliedJob = (job: USAJob) => {
    // Mark job as applied in localStorage for Application Tracker
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
    const jobExists = appliedJobs.find((appliedJob: any) => appliedJob.id === job.id)
    
    if (!jobExists) {
      const appliedJob = {
        ...job,
        status: 'applied',
        appliedDate: new Date().toISOString(),
        notes: '',
        source: 'usajobs'
      }
      appliedJobs.push(appliedJob)
      localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs))
      
      // Show success message
      setStatusMessage(`✅ Applied to "${job.title}" at ${job.organization} - Added to Application Tracker`)
      
      // Clear message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000)
    } else {
      setStatusMessage(`⚠️ "${job.title}" at ${job.organization} is already marked as applied`)
      setTimeout(() => setStatusMessage(''), 3000)
    }
  }

  const handleNotInterestedJob = (job: USAJob) => {
    // Remove job from the current jobs list
    const updatedJobs = jobs.filter(j => j.id !== job.id)
    setJobs(updatedJobs)
    
    // Also save to not interested list for tracking
    const notInterestedJobs = JSON.parse(localStorage.getItem('notInterestedJobs') || '[]')
    const jobExists = notInterestedJobs.find((notJob: any) => notJob.id === job.id)
    
    if (!jobExists) {
      const notInterestedJob = {
        ...job,
        status: 'not interested',
        removedDate: new Date().toISOString(),
        notes: '',
        source: 'usajobs'
      }
      notInterestedJobs.push(notInterestedJob)
      localStorage.setItem('notInterestedJobs', JSON.stringify(notInterestedJobs))
    }
    
    // Show success message
    setStatusMessage(`🗑️ Removed "${job.title}" at ${job.organization} - Not Interested`)
    
    // Clear message after 3 seconds
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🏛️ USA Jobs - Federal GRC Opportunities</h2>
          <p className="text-gray-400">Federal government GRC, cybersecurity, and compliance positions</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <div className="text-sm text-gray-400">
              Last updated: {formatDate(lastRefresh)}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border ${
          statusMessage.includes('❌') ? 'bg-red-900/20 border-red-500/50 text-red-400' :
          statusMessage.includes('⚠️') ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400' :
          statusMessage.includes('✅') ? 'bg-green-900/20 border-green-500/50 text-green-400' :
          'bg-blue-900/20 border-blue-500/50 text-blue-400'
        }`}>
          <div className="flex items-center gap-3">
            <Search className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Error loading USA jobs</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search titles, agencies..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Most Recent</option>
              <option value="organization">Agency (A-Z)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading federal opportunities...</span>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                {jobs.length === 0 ? 'No federal jobs found' : 'No jobs match your filters'}
              </h3>
              <p className="text-gray-500">
                {jobs.length === 0 
                  ? 'Try refreshing to load the latest federal GRC opportunities.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h3>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/50">
                          Federal
                        </span>
                        {job.clearance && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/50">
                            {job.clearance}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.organization}
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                        )}
                        {job.posted && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Posted: {formatDate(job.posted)}
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <span className="text-green-400">
                              ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {job.description && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Search className="w-3 h-3" />
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-blue-400" />
                          USA Jobs
                        </span>
                        <span>•</span>
                        <span>Closes: {job.closes ? formatDate(job.closes) : 'Open'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {job.url && (
                        <button
                          onClick={() => handleJobClick(job)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          title="View Job"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      {onTailorResume && resumeContent && (
                        <button
                          onClick={() => handleTailorResume(job)}
                          className="p-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                          title="Tailor Resume"
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleAppliedJob(job)}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        title="Applied - Add to Application Tracker"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Applied</span>
                      </button>
                      <button
                        onClick={() => handleNotInterestedJob(job)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        title="Not Interested - Remove this job"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">Not Interested</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
