'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, Bookmark, ExternalLink, Clock, MapPin, Building, DollarSign, TrendingUp } from 'lucide-react'
import { 
  scanJobBoards, 
  defaultScanConfig, 
  getScanHistory, 
  getSavedJobs, 
  saveJob, 
  removeSavedJob,
  shouldScan,
  type JobPosting,
  type ScanResult,
  type ScanConfig
} from '@/lib/jobScanner'

interface JobScannerProps {
  resumeContent: string
}

export default function JobScanner({ resumeContent }: JobScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<ScanResult | null>(null)
  const [savedJobs, setSavedJobs] = useState<JobPosting[]>([])
  const [config, setConfig] = useState<ScanConfig>(defaultScanConfig)
  const [autoScanEnabled, setAutoScanEnabled] = useState(false)
  const [lastScanTime, setLastScanTime] = useState<string | null>(null)

  useEffect(() => {
    // Load saved jobs
    setSavedJobs(getSavedJobs())
    
    // Load last scan results
    const history = getScanHistory()
    if (history.length > 0) {
      setScanResults(history[0])
      setLastScanTime(history[0].lastScanTime)
    }
  }, [])

  useEffect(() => {
    // Auto-scan every 6 hours if enabled
    if (!autoScanEnabled) return

    const checkAndScan = async () => {
      if (shouldScan(config) && resumeContent) {
        await handleScan()
      }
    }

    // Check immediately
    checkAndScan()

    // Then check every hour
    const interval = setInterval(checkAndScan, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoScanEnabled, config, resumeContent])

  const handleScan = async () => {
    if (!resumeContent) {
      alert('Please upload a resume first')
      return
    }

    setIsScanning(true)
    try {
      const results = await scanJobBoards(resumeContent, config)
      setScanResults(results)
      setLastScanTime(results.lastScanTime)
      
      // Show notification for high matches
      if (results.highMatches.length > 0) {
        showNotification(`🎯 Found ${results.highMatches.length} jobs with 90%+ match!`)
      }
    } catch (error) {
      console.error('Scan error:', error)
      alert('Error scanning job boards. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleSaveJob = (job: JobPosting) => {
    saveJob(job)
    setSavedJobs(getSavedJobs())
    showNotification('Job saved!')
  }

  const handleRemoveJob = (jobId: string) => {
    removeSavedJob(jobId)
    setSavedJobs(getSavedJobs())
  }

  const showNotification = (message: string) => {
    // In production, this would use browser notifications
    // For now, just console log
    console.log('Notification:', message)
    
    // Could also use a toast library
    alert(message)
  }

  const renderJobCard = (job: JobPosting, showSaveButton: boolean = true) => (
    <div 
      key={job.id}
      className="bg-slate-700/50 border border-purple-500/30 rounded-xl p-4 hover:border-purple-400 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-purple-100 text-lg mb-1">{job.title}</h3>
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <Building className="w-4 h-4" />
            <span>{job.company}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${
            job.matchScore >= 90 ? 'text-green-400' : 
            job.matchScore >= 80 ? 'text-yellow-400' : 'text-orange-400'
          }`}>
            {job.matchScore}%
          </span>
          {showSaveButton && (
            <button
              onClick={() => handleSaveJob(job)}
              className="p-2 hover:bg-purple-900/50 rounded transition-colors"
              title="Save job"
            >
              <Bookmark className="w-5 h-5 text-purple-300" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-purple-300 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
          {job.remote && <span className="px-2 py-0.5 bg-green-900/30 text-green-300 rounded text-xs">Remote</span>}
        </div>
        
        {job.salary && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-purple-500/30">
        <span className="text-xs text-purple-400 uppercase font-semibold">
          {job.source}
        </span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-t-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-100 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Job Scanner
            </h2>
            <p className="text-sm text-purple-300 mt-1">
              Automatically find jobs matching your skills
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-purple-200">
              <input
                type="checkbox"
                checked={autoScanEnabled}
                onChange={(e) => setAutoScanEnabled(e.target.checked)}
                className="rounded"
              />
              <Bell className="w-4 h-4" />
              Auto-scan every 6 hours
            </label>
            <button
              onClick={handleScan}
              disabled={isScanning || !resumeContent}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status */}
        {lastScanTime && (
          <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300">
                Last scan: {new Date(lastScanTime).toLocaleString()}
              </span>
              {scanResults && (
                <span className="text-purple-200 font-semibold">
                  Found {scanResults.totalFound} matching jobs
                </span>
              )}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-orange-900/30 rounded-lg border border-orange-500/50">
          <h3 className="font-bold text-orange-200 mb-2 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Feature in Development
          </h3>
          <p className="text-sm text-orange-100 mb-2">
            The job scanner requires API keys from job boards. Currently supported:
          </p>
          <ul className="text-sm text-orange-100 space-y-1 ml-4">
            <li>• <strong>USAJobs API</strong> - Free API key available (excellent for federal GRC roles)</li>
            <li>• <strong>Dice API</strong> - Public API for tech jobs</li>
            <li>• <strong>Indeed/LinkedIn</strong> - Requires partner API access</li>
          </ul>
          <p className="text-xs text-orange-200 mt-3">
            To enable: Add API keys to your environment variables and the scanner will automatically start working.
          </p>
        </div>

        {/* Demo Results */}
        {scanResults && scanResults.totalFound > 0 ? (
          <div className="space-y-6">
            {/* High Matches (90%+) */}
            {scanResults.highMatches.length > 0 && (
              <div>
                <h3 className="font-bold text-green-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Excellent Matches (90%+) - {scanResults.highMatches.length}
                </h3>
                <div className="space-y-3">
                  {scanResults.highMatches.map(job => renderJobCard(job))}
                </div>
              </div>
            )}

            {/* Good Matches (75-89%) */}
            {scanResults.goodMatches.length > 0 && (
              <div>
                <h3 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Good Matches (75-89%) - {scanResults.goodMatches.length}
                </h3>
                <div className="space-y-3">
                  {scanResults.goodMatches.map(job => renderJobCard(job))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-purple-300">
            <Search className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <p className="text-lg font-semibold mb-2">No scans yet</p>
            <p className="text-sm text-purple-400">
              Click "Scan Now" to find jobs matching your resume
            </p>
          </div>
        )}

        {/* Saved Jobs */}
        {savedJobs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-purple-500/30">
            <h3 className="font-bold text-purple-200 mb-3 flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Saved Jobs ({savedJobs.length})
            </h3>
            <div className="space-y-3">
              {savedJobs.map(job => (
                <div key={job.id} className="relative">
                  {renderJobCard(job, false)}
                  <button
                    onClick={() => handleRemoveJob(job.id)}
                    className="absolute top-2 right-2 p-2 bg-red-900/50 hover:bg-red-900/70 rounded transition-colors"
                    title="Remove"
                  >
                    <Bookmark className="w-4 h-4 text-red-300 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
