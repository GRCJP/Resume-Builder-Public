'use client'

import { useState, useEffect } from 'react'
import { Search, RefreshCw, ExternalLink, Calendar, Building2, MapPin, Briefcase, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { scanJobBoards, defaultScanConfig } from '../lib/jobScanner'

interface Job {
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

interface JobDiscoveryDashboardProps {
  resumeContent?: string
  selectedResumeName?: string
  onTailorResume?: (jobDescription: string, jobTitle: string, company: string) => void
}

export default function JobDiscoveryDashboard({ resumeContent, selectedResumeName, onTailorResume }: JobDiscoveryDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'title' | 'score'>('score')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [filterMatchLevel, setFilterMatchLevel] = useState<string>('all')
  
  // Scanning state
  const [isScanning, setIsScanning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [searchLocation, setSearchLocation] = useState('Remote')

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
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Filter by source
    if (filterSource !== 'all') {
      console.log('🔍 Filtering by source:', filterSource)
      console.log('🔍 Available sources:', jobs.map(job => job.source))
      filtered = filtered.filter(job => job.source === filterSource)
      console.log('🔍 After source filter:', filtered.length, 'jobs')
    }
    
    // Filter by match level
    if (filterMatchLevel !== 'all') {
      filtered = filtered.filter(job => job.matchLevel === filterMatchLevel)
    }
    
    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0)
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
  }, [jobs, searchTerm, sortBy, filterSource, filterMatchLevel])

  const loadEmailJobs = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    console.log('📧 Loading email jobs from /api/resume-scored-jobs')
    const response = await fetch('/api/resume-scored-jobs')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch resume-scored jobs: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📊 Email jobs response:', data)
    
    if (data.status === 'success') {
      const jobCount = data.jobs?.length || 0
      console.log('✅ Email jobs loaded:', jobCount, 'jobs')
      
      if (jobCount === 0) {
        console.log('⚠️ No email jobs found')
        return { success: true, count: 0, error: 'No email jobs found. Process email alerts first.' }
      }
      
      setJobs(data.jobs || [])
      setLastRefresh(data.lastRefresh || new Date().toISOString())
      return { success: true, count: jobCount }
    } else {
      throw new Error(data.error || 'Unknown error')
    }
    
  } catch (err) {
    console.error('Error loading email jobs:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to load email jobs'
    return { success: false, count: 0, error: errorMessage }
  }
}

const loadApiJobs = async (emailJobs: any[] = []): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    console.log('🔍 Loading API jobs using GRC industry titles (no resume required)...')
    
    const apiConfig = {
      includeAdzuna: true,
      includeJSearch: true,
      includeSerpApi: true,
      includeUSAJobs: false,
      includeEmailAlerts: false,
    }
    
    // Use new title-based scanning instead of resume-based
    const { scanGRCJobsByTitles } = await import('../lib/jobScanner')
    const apiResult = await scanGRCJobsByTitles('Remote', apiConfig)
    
    if (apiResult && apiResult.totalFound > 0) {
      const apiJobs = [
        ...apiResult.highMatches,
        ...apiResult.goodMatches,
        ...apiResult.fairMatches
      ].map((job: any) => ({
        ...job,
        source: job.source || 'api',
        scannedAt: new Date().toISOString()
      }))
      
      console.log('✅ API jobs loaded:', apiJobs.length, 'jobs')
      
      // Combine with existing email jobs
      const allJobs = [...emailJobs, ...apiJobs]
      setJobs(allJobs)
      
      return { success: true, count: apiJobs.length }
    } else {
      return { success: false, count: 0, error: 'No API jobs found' }
    }
    
  } catch (err) {
    console.error('Error loading API jobs:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to load API jobs'
    return { success: false, count: 0, error: errorMessage }
  }
}

const loadJobs = async () => {
  setLoading(true)
  setError(null)
  setStatusMessage('📧 Loading email jobs...')
  
  try {
    // Step 1: Load email jobs
    const emailResult = await loadEmailJobs()
    
    if (!emailResult.success) {
      setError(emailResult.error || 'Failed to load email jobs')
      setStatusMessage('❌ Failed to load email jobs')
      return
    }
    
    if (emailResult.count === 0) {
      setError(emailResult.error || 'No email jobs found')
      setStatusMessage('📭 No email jobs found. Process email alerts first.')
      return
    }
    
    // Step 2: Load API jobs only if email jobs succeeded
    setStatusMessage('🔍 Loading API jobs...')
    const currentJobs = jobs || [] // Get the email jobs that were just loaded
    const apiResult = await loadApiJobs(currentJobs)
    
    if (!apiResult.success) {
      console.warn('API jobs failed, but email jobs loaded successfully')
      setStatusMessage(`⚠️ Email jobs loaded (${emailResult.count}), but API jobs failed: ${apiResult.error}`)
    } else {
      setStatusMessage(`✅ Complete! ${emailResult.count} email jobs + ${apiResult.count} API jobs`)
    }
    
  } catch (err) {
    console.error('Error in sequential load:', err)
    setError(err instanceof Error ? err.message : 'Failed to load jobs')
    setStatusMessage('❌ Failed to load jobs')
  } finally {
    setLoading(false)
  }
}

  const handleRefresh = () => {
    loadJobs()
  }

  const handleProcessEmails = async () => {
    setLoading(true)
    setError(null)
    setStatusMessage('📧 Processing email alerts...')
    
    try {
      console.log('📧 Processing email alerts from Gmail...')
      const response = await fetch('/api/email-alerts?fetch=true&process=true')
      
      if (!response.ok) {
        throw new Error(`Failed to process email alerts: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Email processing response:', data)
      
      setStatusMessage(`✅ Processed ${data.emailsProcessed || 0} emails, found ${data.jobsFound || 0} jobs`)
      
      // Reload email jobs after processing
      setTimeout(async () => {
        const emailResult = await loadEmailJobs()
        if (emailResult.success) {
          setStatusMessage(`✅ ${emailResult.count} email jobs loaded successfully`)
        } else {
          setStatusMessage(`⚠️ Email processing complete, but loading failed: ${emailResult.error}`)
        }
      }, 1000)
      
    } catch (err) {
      console.error('Error processing email alerts:', err)
      setStatusMessage(`❌ Email processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleScanJobs = async () => {
    if (isScanning) {
      return
    }
    
    setIsScanning(true)
    setStatusMessage('🔍 Scanning API job boards using GRC industry titles...')
    
    try {
      // Get current email jobs
      const currentJobs = jobs || []
      const emailJobs = currentJobs.filter(job => job.source.includes('-email'))
      
      if (emailJobs.length === 0) {
        setStatusMessage('⚠️ No email jobs found. Process email alerts first.')
        setIsScanning(false)
        return
      }
      
      // Load API jobs using title-based scanning (no resume required)
      const apiResult = await loadApiJobs(emailJobs)
      
      if (apiResult.success) {
        setStatusMessage(`✅ Complete! ${emailJobs.length} email jobs + ${apiResult.count} GRC title-based API jobs`)
      } else {
        setStatusMessage(`⚠️ API scan failed: ${apiResult.error}. Email jobs still available.`)
      }
      
    } catch (error) {
      console.error('❌ API scan failed:', error)
      setStatusMessage(`❌ Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsScanning(false)
    }
  }

  const handleJobClick = (job: Job) => {
    if (job.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleTailorResume = (job: Job) => {
    if (onTailorResume && job.description) {
      onTailorResume(job.description, job.title, job.company)
    }
  }

  const handleAppliedJob = (job: Job) => {
    // Mark job as applied in localStorage for Application Tracker
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]')
    const jobExists = appliedJobs.find((appliedJob: any) => appliedJob.id === job.id)
    
    if (!jobExists) {
      const appliedJob = {
        ...job,
        status: 'applied',
        appliedDate: new Date().toISOString(),
        notes: ''
      }
      appliedJobs.push(appliedJob)
      localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs))
      
      // Show success message
      setStatusMessage(`✅ Applied to "${job.title}" at ${job.company} - Added to Application Tracker`)
      
      // Clear message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000)
    } else {
      setStatusMessage(`⚠️ "${job.title}" at ${job.company} is already marked as applied`)
      setTimeout(() => setStatusMessage(''), 3000)
    }
  }

  const handleNotInterestedJob = (job: Job) => {
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
        notes: ''
      }
      notInterestedJobs.push(notInterestedJob)
      localStorage.setItem('notInterestedJobs', JSON.stringify(notInterestedJobs))
    }
    
    // Show success message
    setStatusMessage(`🗑️ Removed "${job.title}" at ${job.company} - Not Interested`)
    
    // Clear message after 3 seconds
    setTimeout(() => setStatusMessage(''), 3000)
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
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Job Discovery</h2>
            <p className="text-gray-400">Resume-scored jobs from your email alerts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <div className="text-sm text-gray-400">
              Last updated: {formatDate(lastRefresh)}
            </div>
          )}
          <button
            onClick={handleProcessEmails}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Process Emails
          </button>
          <button
            onClick={handleScanJobs}
            disabled={loading || isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Search className={`w-4 h-4 ${isScanning ? 'animate-pulse' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan GRC Jobs by Title'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-purple-400" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Jobs</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, company, or location..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'title' | 'score')}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="score">Resume Match (High to Low)</option>
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
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Sources</option>
              
              {/* Email Sources (Priority) */}
              <optgroup label="📧 Email Jobs">
                <option value="linkedin-email">LinkedIn Email</option>
                <option value="indeed-email">Indeed Email</option>
                <option value="lensa-email">Lensa Email</option>
              </optgroup>
              
              {/* API Sources */}
              <optgroup label="🔍 API Jobs">
                <option value="adzuna">Adzuna</option>
                <option value="jsearch">JSearch</option>
                <option value="serpapi">SerpApi</option>
                <option value="linkedin">LinkedIn API</option>
                <option value="indeed">Indeed API</option>
                <option value="dice">Dice</option>
                <option value="ziprecruiter">ZipRecruiter</option>
                <option value="glassdoor">Glassdoor</option>
                <option value="other">Other</option>
                <option value="curated">Curated</option>
              </optgroup>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Match Level</label>
            <select
              value={filterMatchLevel}
              onChange={(e) => setFilterMatchLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="Excellent">Excellent (85+)</option>
              <option value="Good">Good (75+)</option>
              <option value="Fair">Fair (65+)</option>
            </select>
          </div>
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
            <Search className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
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
              <div className="font-semibold">Error loading jobs</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-purple-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading resume-scored jobs...</span>
          </div>
        </div>
      )}

      {/* Scanning State */}
      {isScanning && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-green-400">
            <Search className="w-5 h-5 animate-spin" />
            <span>Scanning job boards for GRC opportunities...</span>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !isScanning && !error && (
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                {jobs.length === 0 ? 'No resume-scored jobs found' : 'No jobs match your filters'}
              </h3>
              <p className="text-gray-500">
                {jobs.length === 0 
                  ? 'No jobs found. Try loading resume-scored jobs from your email alerts or scan job boards for new opportunities.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
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
                          <div className="text-xs text-gray-500 mb-1">Why this matches your resume:</div>
                          <div className="flex flex-wrap gap-1">
                            {job.scoreReasons.slice(0, 3).map((reason, index) => (
                              <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
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
                        <Search className="w-3 h-3" />
                        <span className="flex items-center gap-1">
                          {job.source.includes('-email') ? (
                            <>
                              <Mail className="w-3 h-3 text-green-400" />
                              {job.source.replace('-email', '')} Email
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3 h-3 text-blue-400" />
                              {job.source.charAt(0).toUpperCase() + job.source.slice(1)}
                            </>
                          )}
                        </span>
                        <span>•</span>
                        <span>Scanned: {formatDate(job.scannedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {job.url && (
                        <button
                          onClick={() => handleJobClick(job)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
