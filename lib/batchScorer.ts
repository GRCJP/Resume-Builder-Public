// Batch job scoring using existing analyze logic

import { JobWithScore } from './jobStorage'
import { smartMatch } from './smartMatcher'
import { classifyRole, assessRoleMatch, extractJobTitle } from './roleClassifier'

export interface BatchScoreResult {
  jobId: string
  score: number
  matchDetails: {
    matchScore: number
    adjustedScore: number
    rolePenalty: number
    missingKeywords: string[]
  }
}

export interface ScoreBucket {
  min: number
  max: number
  label: string
  color: string
  count: number
}

/**
 * Configurable score buckets
 */
export const SCORE_BUCKETS = {
  excellent: { min: 90, max: 100, label: 'Excellent Match', color: 'green' },
  good: { min: 75, max: 89, label: 'Good Match', color: 'yellow' },
  fair: { min: 60, max: 74, label: 'Fair Match', color: 'orange' },
  poor: { min: 0, max: 59, label: 'Poor Match', color: 'red' }
} as const

/**
 * Run batch analysis on multiple jobs
 * Uses existing analyze logic without modification
 */
export async function batchScoreJobs(
  jobs: JobWithScore[],
  resumeContent: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ [jobId: string]: number }> {
  const scores: { [jobId: string]: number } = {}
  
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]
    
    try {
      // Use existing analyze logic
      const score = await scoreJob(job.description, resumeContent)
      scores[job.id] = score
      
      // Report progress
      if (onProgress) {
        onProgress(i + 1, jobs.length)
      }
      
      // Small delay to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 10))
    } catch (error) {
      console.error(`Error scoring job ${job.id}:`, error)
      scores[job.id] = 0
    }
  }
  
  return scores
}

/**
 * Score a single job using existing logic
 * This is the SAME logic from JobDescriptionAnalyzer
 */
async function scoreJob(jobDescription: string, resumeContent: string): Promise<number> {
  if (!jobDescription || !resumeContent) return 0
  
  // Use smart matching (existing algorithm)
  const smartMatchResult = smartMatch(jobDescription, resumeContent)
  
  // Classify role (existing algorithm)
  const jobTitle = extractJobTitle(jobDescription)
  const roleClass = classifyRole(jobTitle, jobDescription)
  const roleMatch = assessRoleMatch(roleClass, resumeContent)
  
  // Adjust score for role mismatch (existing logic)
  let adjustedScore = smartMatchResult.matchScore
  if (roleMatch.shouldApply) {
    adjustedScore = Math.max(0, adjustedScore - roleMatch.scorePenalty)
  }
  
  return Math.round(adjustedScore)
}

/**
 * Get score buckets with counts
 */
export function getScoreBuckets(jobs: JobWithScore[]): ScoreBucket[] {
  const buckets = Object.values(SCORE_BUCKETS).map(bucket => ({
    ...bucket,
    count: 0
  }))
  
  // Count jobs in each bucket
  jobs.forEach(job => {
    if (job.score === undefined) return
    
    for (const bucket of buckets) {
      if (job.score >= bucket.min && job.score <= bucket.max) {
        bucket.count++
        break
      }
    }
  })
  
  return buckets
}

/**
 * Filter jobs by score bucket
 */
export function filterJobsByBucket(
  jobs: JobWithScore[],
  bucketKey: keyof typeof SCORE_BUCKETS
): JobWithScore[] {
  const bucket = SCORE_BUCKETS[bucketKey]
  return jobs.filter(job => {
    if (job.score === undefined) return false
    return job.score >= bucket.min && job.score <= bucket.max
  })
}

/**
 * Get detailed batch results
 */
export async function getBatchScoreDetails(
  jobs: JobWithScore[],
  resumeContent: string
): Promise<BatchScoreResult[]> {
  const results: BatchScoreResult[] = []
  
  for (const job of jobs) {
    try {
      const smartMatchResult = smartMatch(job.description, resumeContent)
      const jobTitle = extractJobTitle(job.description)
      const roleClass = classifyRole(jobTitle, job.description)
      const roleMatch = assessRoleMatch(roleClass, resumeContent)
      
      let adjustedScore = smartMatchResult.matchScore
      if (roleMatch.shouldApply) {
        adjustedScore = Math.max(0, adjustedScore - roleMatch.scorePenalty)
      }
      
      results.push({
        jobId: job.id,
        score: Math.round(adjustedScore),
        matchDetails: {
          matchScore: smartMatchResult.matchScore,
          adjustedScore,
          rolePenalty: roleMatch.shouldApply ? roleMatch.scorePenalty : 0,
          missingKeywords: smartMatchResult.missingKeywords
        }
      })
    } catch (error) {
      console.error(`Error getting details for job ${job.id}:`, error)
    }
  }
  
  return results
}

/**
 * Sort jobs by score (highest first)
 */
export function sortJobsByScore(jobs: JobWithScore[]): JobWithScore[] {
  return [...jobs].sort((a, b) => {
    const scoreA = a.score ?? -1
    const scoreB = b.score ?? -1
    return scoreB - scoreA
  })
}
