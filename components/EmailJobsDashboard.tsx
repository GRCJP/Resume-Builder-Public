'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw, ExternalLink, Calendar, Building2, MapPin, Briefcase, AlertCircle, CheckCircle } from 'lucide-react'

interface EmailJob {
  id: string
  title: string
  company: string
  location?: string
  url?: string
  description?: string
  source: string
  postedDate?: string
  scannedAt: string
  requiresLogin?: boolean
  linkStatus?: number
  score?: number
  scoreReasons?: string[]
  matchLevel?: 'Excellent' | 'Good' | 'Fair' | 'Poor'
}

interface EmailJobsDashboardProps {
  resumeContent?: string
  selectedResumeName?: string
  onTailorResume?: (jobDescription: string, jobTitle: string, company: string) => void
}

export default function EmailJobsDashboard({ resumeContent, selectedResumeName, onTailorResume }: EmailJobsDashboardProps) {
  const [emailJobs, setEmailJobs] = useState<EmailJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<EmailJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'title'>('date')
  const [filterSource, setFilterSource] = useState<string>('all')

  // Load email jobs on mount
  useEffect(() => {
    loadEmailJobs()
  }, [])

  // Filter and sort jobs when dependencies change
  useEffect(() => {
    let filtered = [...emailJobs]
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Filter by source
    if (filterSource !== 'all') {
      filtered = filtered.filter(job => job.source === filterSource)
    }
    
    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.postedDate || b.scannedAt).getTime() - new Date(a.postedDate || a.scannedAt).getTime()
        case 'company':
          return a.company.localeCompare(b.company)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
    
    setFilteredJobs(filtered)
  }, [emailJobs, searchTerm, sortBy, filterSource])

  const loadEmailJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/resume-scored-jobs')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch resume-scored jobs: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setEmailJobs(data.jobs || [])
        setLastRefresh(data.lastRefresh || new Date().toISOString())
      } else {
        throw new Error(data.error || 'Unknown error')
      }
      
    } catch (err) {
      console.error('Error loading resume-scored jobs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load resume-scored jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadEmailJobs()
  }

  const handleJobClick = (job: EmailJob) => {
    if (job.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleTailorResume = (job: EmailJob) => {
    if (onTailorResume && job.description) {
      onTailorResume(job.description, job.title, job.company)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-r from-green-500 to-emerald-500'
    if (score >= 75) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (score >= 65) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-gray-500 to-slate-500'
  }

  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Good': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Fair': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Resume Scored Jobs</h2>
            <p className="text-gray-400">Email jobs scored against your GRC resume</p>
          </div>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{filteredJobs.length}</div>
              <div className="text-sm text-gray-400">Filtered Jobs</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
            <div>
              <div className="text-2xl font-bold text-white">
                {filteredJobs.filter(job => job.matchLevel === 'Excellent').length}
              </div>
              <div className="text-sm text-gray-400">Excellent Matches</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
            <div>
              <div className="text-2xl font-bold text-white">
                {filteredJobs.filter(job => job.matchLevel === 'Good').length}
              </div>
              <div className="text-sm text-gray-400">Good Matches</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">
                {new Set(filteredJobs.map(job => job.company)).size}
              </div>
              <div className="text-sm text-gray-400">Companies</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
            <div>
              <div className="text-2xl font-bold text-white">
                {filteredJobs.length > 0 ? Math.round(filteredJobs.reduce((sum, job) => sum + (job.score || 0), 0) / filteredJobs.length) : 0}
              </div>
              <div className="text-sm text-gray-400">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Jobs</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, company, or location..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'title')}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Most Recent</option>
              <option value="company">Company (A-Z)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="linkedin-email">LinkedIn</option>
              <option value="indeed-email">Indeed</option>
              <option value="lensa-email">Lensa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Error loading email jobs</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-blue-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading email jobs...</span>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                {emailJobs.length === 0 ? 'No resume-scored jobs found' : 'No jobs match your filters'}
              </h3>
              <p className="text-gray-500">
                {emailJobs.length === 0 
                  ? 'Check your Gmail job alert emails and make sure OAuth is configured.'
                  : 'Try adjusting your search or filter criteria.'
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
                        
                        {/* Score Badge */}
                        {job.score && (
                          <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getScoreColor(job.score)}`}>
                            {job.score}/100
                          </div>
                        )}
                        
                        {/* Match Level Badge */}
                        {job.matchLevel && (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getMatchLevelColor(job.matchLevel)}`}>
                            {job.matchLevel}
                          </span>
                        )}
                        
                        {job.requiresLogin && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                            Login Required
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                        )}
                        {job.postedDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(job.postedDate)}
                          </div>
                        )}
                      </div>
                      
                      {job.description && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      
                      {/* Score Reasons */}
                      {job.scoreReasons && job.scoreReasons.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Why this matches:</div>
                          <div className="flex flex-wrap gap-1">
                            {job.scoreReasons.slice(0, 3).map((reason, index) => (
                              <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                {reason}
                              </span>
                            ))}
                            {job.scoreReasons.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{job.scoreReasons.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        <span>Source: {job.source}</span>
                        <span>•</span>
                        <span>Scanned: {formatDate(job.scannedAt)}</span>
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
                          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          title="Tailor Resume"
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>
                      )}
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
