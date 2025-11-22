'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, Briefcase, ExternalLink, Sparkles, Play, Filter } from 'lucide-react'
import { 
  getStoredJobs, 
  addJobs, 
  saveJobScores, 
  updateLastSeen,
  getNewJobsCount,
  clearNewFlags,
  getUnscoredJobs,
  type JobWithScore 
} from '@/lib/jobStorage'
import { 
  batchScoreJobs, 
  getScoreBuckets, 
  filterJobsByBucket,
  sortJobsByScore,
  SCORE_BUCKETS,
  type ScoreBucket 
} from '@/lib/batchScorer'
import { getPrimarySearchTitles } from '@/lib/jobTitles'
import { searchAllJobBoards } from '@/lib/jobBoardIntegrations'
import JobDescriptionAnalyzer from './JobDescriptionAnalyzer'
import ResumeTailor from './ResumeTailor'

interface JobDiscoveryDashboardProps {
  resumeContent: string
  selectedResumeName: string
}

type JobSource = 'all' | 'linkedin' | 'indeed' | 'dice' | 'ziprecruiter' | 'glassdoor' | 'momproject' | 'usajobs'

export default function JobDiscoveryDashboard({ resumeContent, selectedResumeName }: JobDiscoveryDashboardProps) {
  const [jobs, setJobs] = useState<JobWithScore[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobWithScore[]>([])
  const [selectedSource, setSelectedSource] = useState<JobSource>('all')
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)
  const [scoreBuckets, setScoreBuckets] = useState<ScoreBucket[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isBatchScoring, setIsBatchScoring] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })
  const [newJobsCount, setNewJobsCount] = useState(0)
  const [selectedJob, setSelectedJob] = useState<JobWithScore | null>(null)
  const [jobAnalysis, setJobAnalysis] = useState<any>(null)
  const [currentJobDescription, setCurrentJobDescription] = useState('')

  // Load jobs on mount
  useEffect(() => {
    loadJobs()
    setNewJobsCount(getNewJobsCount())
  }, [])

  // Update buckets when jobs change
  useEffect(() => {
    const buckets = getScoreBuckets(jobs)
    setScoreBuckets(buckets)
    filterJobs()
  }, [jobs, selectedSource, selectedBucket])

  const loadJobs = () => {
    const stored = getStoredJobs()
    setJobs(stored)
    setFilteredJobs(stored)
  }

  const filterJobs = () => {
    let filtered = [...jobs]

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(job => job.source === selectedSource)
    }

    // Filter by score bucket
    if (selectedBucket) {
      const bucket = SCORE_BUCKETS[selectedBucket as keyof typeof SCORE_BUCKETS]
      filtered = filtered.filter(job => {
        if (job.score === undefined) return false
        return job.score >= bucket.min && job.score <= bucket.max
      })
    }

    // Sort by score (highest first)
    filtered = sortJobsByScore(filtered)

    setFilteredJobs(filtered)
  }

  const handleScanJobs = async (source: JobSource) => {
    if (!resumeContent) {
      alert('Please upload a resume first')
      return
    }

    setIsScanning(true)
    setSelectedSource(source)

    try {
      const keywords = getPrimarySearchTitles()
      const location = 'Washington DC'

      let newJobs: any[] = []

      if (source === 'all') {
        newJobs = await searchAllJobBoards(keywords, location)
      } else {
        // Import specific source scanner
        const { searchLinkedInJobs, searchIndeedJobs, searchDiceJobs, searchZipRecruiterJobs, searchGlassdoorJobs, searchMomProjectJobs } = await import('@/lib/jobBoardIntegrations')
        const { searchUSAJobs } = await import('@/lib/usajobsAPI')

        switch (source) {
          case 'linkedin':
            newJobs = await searchLinkedInJobs(keywords, location)
            break
          case 'indeed':
            newJobs = await searchIndeedJobs(keywords, location)
            break
          case 'dice':
            newJobs = await searchDiceJobs(keywords, location)
            break
          case 'ziprecruiter':
            newJobs = await searchZipRecruiterJobs(keywords, location)
            break
          case 'glassdoor':
            newJobs = await searchGlassdoorJobs(keywords, location)
            break
          case 'momproject':
            newJobs = await searchMomProjectJobs(keywords)
            break
          case 'usajobs':
            const usaJobs = await searchUSAJobs({ keyword: keywords.join(' OR '), location, remote: true })
            newJobs = usaJobs.map(job => ({
              id: job.id,
              title: job.title,
              company: job.organization,
              location: job.location,
              description: job.description,
              url: job.url,
              source: 'usajobs',
              postedDate: job.posted,
              salary: `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`,
              remote: job.remote
            }))
            break
        }
      }

      // Add jobs to storage (will mark new ones)
      addJobs(newJobs as JobWithScore[], source)
      updateLastSeen(source)

      // Reload jobs
      loadJobs()
      setNewJobsCount(getNewJobsCount())

      alert(`Found ${newJobs.length} jobs from ${source}!`)
    } catch (error) {
      console.error('Scan error:', error)
      alert('Error scanning jobs. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleBatchScore = async () => {
    if (!resumeContent) {
      alert('Please upload a resume first')
      return
    }

    const unscoredJobs = getUnscoredJobs()
    if (unscoredJobs.length === 0) {
      alert('All jobs have been scored! Scan for new jobs to analyze more.')
      return
    }

    setIsBatchScoring(true)
    setBatchProgress({ current: 0, total: unscoredJobs.length })

    try {
      const scores = await batchScoreJobs(
        unscoredJobs,
        resumeContent,
        (current, total) => {
          setBatchProgress({ current, total })
        }
      )

      // Save scores
      saveJobScores(scores)

      // Reload jobs
      loadJobs()

      alert(`Batch scoring complete! Analyzed ${unscoredJobs.length} jobs.`)
    } catch (error) {
      console.error('Batch scoring error:', error)
      alert('Error during batch scoring. Please try again.')
    } finally {
      setIsBatchScoring(false)
      setBatchProgress({ current: 0, total: 0 })
    }
  }

  const handleJobClick = (job: JobWithScore) => {
    setSelectedJob(job)
    setJobAnalysis(null)
    setCurrentJobDescription(job.description)
  }

  const handleCloseJobDetail = () => {
    setSelectedJob(null)
    setJobAnalysis(null)
    setCurrentJobDescription('')
  }

  const handleBucketClick = (bucketKey: string) => {
    setSelectedBucket(selectedBucket === bucketKey ? null : bucketKey)
  }

  const handleClearNew = () => {
    clearNewFlags()
    setNewJobsCount(0)
    loadJobs()
  }

  const sources: { key: JobSource; label: string; icon: string }[] = [
    { key: 'all', label: 'All Sources', icon: '🌐' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'indeed', label: 'Indeed', icon: '🔍' },
    { key: 'dice', label: 'Dice', icon: '🎲' },
    { key: 'ziprecruiter', label: 'ZipRecruiter', icon: '📮' },
    { key: 'glassdoor', label: 'Glassdoor', icon: '🚪' },
    { key: 'momproject', label: 'Mom Project', icon: '👩‍💼' },
    { key: 'usajobs', label: 'USAJobs', icon: '🏛️' }
  ]

  return (
    <div className="space-y-6">
      {/* Top Bar - Source Buttons */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-purple-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job Discovery Dashboard
          </h2>
          {newJobsCount > 0 && (
            <button
              onClick={handleClearNew}
              className="px-3 py-1 bg-green-900/30 text-green-300 rounded text-sm hover:bg-green-900/50 transition-colors"
            >
              {newJobsCount} new jobs
            </button>
          )}
        </div>

        {/* Source Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sources.map(source => (
            <button
              key={source.key}
              onClick={() => handleScanJobs(source.key)}
              disabled={isScanning}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2 ${
                selectedSource === source.key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-700 text-purple-200 hover:bg-slate-600'
              } disabled:opacity-50`}
            >
              <span>{source.icon}</span>
              {source.label}
            </button>
          ))}
        </div>

        {/* Batch Score Button */}
        <button
          onClick={handleBatchScore}
          disabled={isBatchScoring || !resumeContent}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play className="w-5 h-5" />
          {isBatchScoring 
            ? `Scoring... ${batchProgress.current}/${batchProgress.total}` 
            : `Run Batch Analyzer (${getUnscoredJobs().length} unscored)`
          }
        </button>
      </div>

      {/* Score Buckets */}
      <div className="grid grid-cols-4 gap-4">
        {scoreBuckets.map((bucket, index) => {
          const bucketKey = Object.keys(SCORE_BUCKETS)[index]
          const isSelected = selectedBucket === bucketKey
          const colorClasses = {
            green: 'from-green-900/50 to-emerald-900/50 border-green-500/50 text-green-100',
            yellow: 'from-yellow-900/50 to-amber-900/50 border-yellow-500/50 text-yellow-100',
            orange: 'from-orange-900/50 to-red-900/50 border-orange-500/50 text-orange-100',
            red: 'from-red-900/50 to-pink-900/50 border-red-500/50 text-red-100'
          }

          return (
            <button
              key={bucketKey}
              onClick={() => handleBucketClick(bucketKey)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected ? 'ring-4 ring-purple-500/50 scale-105' : ''
              } bg-gradient-to-br ${colorClasses[bucket.color as keyof typeof colorClasses]}`}
            >
              <div className="text-3xl font-bold mb-1">{bucket.count}</div>
              <div className="text-sm font-semibold">{bucket.label}</div>
              <div className="text-xs opacity-75 mt-1">{bucket.min}-{bucket.max}%</div>
            </button>
          )
        })}
      </div>

      {/* Job List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-100 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {selectedBucket ? SCORE_BUCKETS[selectedBucket as keyof typeof SCORE_BUCKETS].label : 'All Jobs'} ({filteredJobs.length})
          </h3>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-purple-300">
            <Search className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <p className="text-lg font-semibold mb-2">No jobs found</p>
            <p className="text-sm text-purple-400">
              Click a source button above to scan for jobs
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="bg-slate-700/50 border border-purple-500/30 rounded-xl p-4 hover:border-purple-400 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-purple-100 text-lg">{job.title}</h4>
                      {job.isNew && (
                        <span className="px-2 py-0.5 bg-green-900/30 text-green-300 rounded text-xs font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-purple-300">{job.company}</div>
                    <div className="text-xs text-purple-400 mt-1">{job.location}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {job.score !== undefined && (
                      <span className={`text-2xl font-bold ${
                        job.score >= 90 ? 'text-green-400' :
                        job.score >= 75 ? 'text-yellow-400' :
                        job.score >= 60 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {job.score}%
                      </span>
                    )}
                    <span className="text-xs text-purple-400 uppercase font-semibold">
                      {job.source}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-purple-500/30 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-purple-100">{selectedJob.title}</h3>
                <p className="text-purple-300">{selectedJob.company}</p>
              </div>
              <button
                onClick={handleCloseJobDetail}
                className="px-4 py-2 bg-slate-700 text-purple-200 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Info */}
              <div className="space-y-2 text-sm text-purple-300">
                <div><strong>Location:</strong> {selectedJob.location}</div>
                {selectedJob.salary && <div><strong>Salary:</strong> {selectedJob.salary}</div>}
                <div><strong>Posted:</strong> {new Date(selectedJob.postedDate).toLocaleDateString()}</div>
                <div><strong>Source:</strong> {selectedJob.source}</div>
                {selectedJob.score !== undefined && (
                  <div><strong>Match Score:</strong> <span className="text-2xl font-bold text-green-400">{selectedJob.score}%</span></div>
                )}
              </div>

              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all inline-flex"
              >
                Apply on {selectedJob.source}
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Analyze Section */}
              <div className="border-t border-purple-500/30 pt-6">
                <JobDescriptionAnalyzer
                  resumeContent={resumeContent}
                  selectedResumeName={selectedResumeName}
                  onAnalysisComplete={setJobAnalysis}
                  onJobDescriptionChange={setCurrentJobDescription}
                />
              </div>

              {/* Tailor Section */}
              {jobAnalysis && currentJobDescription && (
                <div className="border-t border-purple-500/30 pt-6">
                  <ResumeTailor
                    resumeContent={resumeContent}
                    selectedResumeName={selectedResumeName}
                    jobDescription={currentJobDescription}
                    matchScore={jobAnalysis.matchScore}
                    missingKeywords={jobAnalysis.missingKeywords}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
