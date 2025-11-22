// Job storage and persistence with last seen tracking

import { JobPosting } from './jobScanner'

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'

export interface JobWithScore extends JobPosting {
  score?: number
  isNew?: boolean
  analyzedAt?: string
  status?: ApplicationStatus
  notes?: string
  appliedDate?: string
  lastUpdated?: string
}

export interface JobStorage {
  jobs: JobWithScore[]
  scores: { [jobId: string]: number }
  lastSeen: { [source: string]: string }
  lastBatchRun?: string
}

const STORAGE_KEY = 'jobDiscoveryData'
const LAST_SEEN_KEY = 'jobLastSeen'

/**
 * Update job status and notes
 */
export function updateJobStatus(jobId: string, status: ApplicationStatus, notes?: string): void {
  const storage = getJobStorage()
  
  storage.jobs = storage.jobs.map(job => {
    if (job.id === jobId) {
      return {
        ...job,
        status,
        notes: notes !== undefined ? notes : job.notes,
        appliedDate: status === 'applied' && !job.appliedDate ? new Date().toISOString() : job.appliedDate,
        lastUpdated: new Date().toISOString()
      }
    }
    return job
  })
  
  saveJobStorage(storage)
}

/**
 * Get jobs by status
 */
export function getJobsByStatus(status: ApplicationStatus): JobWithScore[] {
  const storage = getJobStorage()
  return storage.jobs.filter(job => job.status === status)
}

/**
 * Get all tracked jobs (any status other than undefined)
 */
export function getTrackedJobs(): JobWithScore[] {
  const storage = getJobStorage()
  return storage.jobs.filter(job => job.status !== undefined)
}

/**
 * Get all stored jobs
 */
export function getStoredJobs(): JobWithScore[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    
    const storage: JobStorage = JSON.parse(data)
    return storage.jobs || []
  } catch (error) {
    console.error('Error loading jobs:', error)
    return []
  }
}

/**
 * Save jobs to storage
 */
export function saveJobs(jobs: JobWithScore[]): void {
  try {
    const existing = getJobStorage()
    const storage: JobStorage = {
      ...existing,
      jobs,
      lastSeen: existing.lastSeen
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Error saving jobs:', error)
  }
}

/**
 * Get full job storage
 */
export function getJobStorage(): JobStorage {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return {
        jobs: [],
        scores: {},
        lastSeen: {}
      }
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading storage:', error)
    return {
      jobs: [],
      scores: {},
      lastSeen: {}
    }
  }
}

/**
 * Save full job storage
 */
export function saveJobStorage(storage: JobStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Error saving storage:', error)
  }
}

/**
 * Get last seen timestamp for a source
 */
export function getLastSeen(source: string): string | null {
  const storage = getJobStorage()
  return storage.lastSeen[source] || null
}

/**
 * Update last seen timestamp for a source
 */
export function updateLastSeen(source: string): void {
  const storage = getJobStorage()
  storage.lastSeen[source] = new Date().toISOString()
  saveJobStorage(storage)
}

/**
 * Mark new jobs since last visit
 */
export function markNewJobs(jobs: JobPosting[], source: string): JobWithScore[] {
  const lastSeen = getLastSeen(source)
  
  if (!lastSeen) {
    // First visit - all jobs are "new" but don't mark them
    return jobs.map(job => ({ ...job, isNew: false }))
  }
  
  const lastSeenDate = new Date(lastSeen)
  
  return jobs.map(job => {
    const postedDate = new Date(job.postedDate)
    const isNew = postedDate > lastSeenDate
    return { ...job, isNew }
  })
}

/**
 * Add or update jobs in storage
 */
export function addJobs(newJobs: JobWithScore[], source: string): void {
  const storage = getJobStorage()
  const existingJobs = storage.jobs
  
  // Mark new jobs
  const markedJobs = markNewJobs(newJobs, source)
  
  // Merge with existing (avoid duplicates)
  const jobMap = new Map<string, JobWithScore>()
  
  // Add existing jobs
  existingJobs.forEach(job => {
    jobMap.set(job.id, job)
  })
  
  // Add/update new jobs
  markedJobs.forEach(job => {
    const existing = jobMap.get(job.id)
    if (existing) {
      // Keep score if already analyzed
      jobMap.set(job.id, {
        ...job,
        score: existing.score,
        analyzedAt: existing.analyzedAt,
        isNew: job.isNew || existing.isNew // Keep new flag if either is new
      })
    } else {
      jobMap.set(job.id, job)
    }
  })
  
  storage.jobs = Array.from(jobMap.values())
  saveJobStorage(storage)
}

/**
 * Save job scores from batch analysis
 */
export function saveJobScores(scores: { [jobId: string]: number }): void {
  const storage = getJobStorage()
  
  // Update scores
  storage.scores = { ...storage.scores, ...scores }
  
  // Update jobs with scores
  storage.jobs = storage.jobs.map(job => ({
    ...job,
    score: scores[job.id] !== undefined ? scores[job.id] : job.score,
    analyzedAt: scores[job.id] !== undefined ? new Date().toISOString() : job.analyzedAt
  }))
  
  storage.lastBatchRun = new Date().toISOString()
  saveJobStorage(storage)
}

/**
 * Get jobs by score bucket
 */
export function getJobsByScoreBucket(min: number, max: number): JobWithScore[] {
  const storage = getJobStorage()
  return storage.jobs.filter(job => {
    if (job.score === undefined) return false
    return job.score >= min && job.score <= max
  })
}

/**
 * Get jobs by source
 */
export function getJobsBySource(source: string): JobWithScore[] {
  const storage = getJobStorage()
  return storage.jobs.filter(job => job.source === source)
}

/**
 * Get new jobs count
 */
export function getNewJobsCount(): number {
  const storage = getJobStorage()
  return storage.jobs.filter(job => job.isNew).length
}

/**
 * Clear new flags (after user views)
 */
export function clearNewFlags(): void {
  const storage = getJobStorage()
  storage.jobs = storage.jobs.map(job => ({ ...job, isNew: false }))
  saveJobStorage(storage)
}

/**
 * Get unscored jobs
 */
export function getUnscoredJobs(): JobWithScore[] {
  const storage = getJobStorage()
  return storage.jobs.filter(job => job.score === undefined)
}

/**
 * Clear all jobs
 */
export function clearAllJobs(): void {
  localStorage.removeItem(STORAGE_KEY)
}
