// Clean Job Scan Pipeline - Phase-based job processing
// Separates gathering, filtering, scoring, verification, and presentation

import { JobPosting } from './jobScanner'
import { gatherAllSecurityJobs as gatherJobs, applyBasicFilters as applyFilters } from './jobBoardIntegrations'
import { smartMatch } from './smartMatcher'
import { verifyAndEnrichJobLink } from './linkVerifier'

export interface PipelineResults {
  highMatches: JobPosting[]
  goodMatches: JobPosting[]
  fairMatches: JobPosting[]
  allJobs: JobPosting[]
  pipelineStats: {
    phase1Raw: number
    phase2Filtered: number
    phase3Scored: number
    phase4Verified: number
    phase5Final: number
    sourceBreakdown: Record<string, number>
    scoreDistribution: Record<string, number>
  }
}

/**
 * PHASE 1: Gather ALL security jobs with maximum coverage (PURE DATA DUMP)
 */
async function gatherAllSecurityJobs(resumeContent: string, location: string): Promise<{rawJobs: JobPosting[], rawCountsBySource: Record<string, number>}> {
  console.warn('🚨 PHASE 1 GATHER: Starting pure data dump...')
  
  // Use new Phase 1 data dump function from jobBoardIntegrations
  const { rawJobs, rawCountsBySource } = await gatherJobs()
  
  // Add basic JobPosting structure to raw jobs
  const structuredJobs = rawJobs.map((job: any, index: number) => ({
    id: job.id || `raw-${index}-${Date.now()}`,
    title: job.title || 'Unknown Title',
    company: job.company || 'Unknown Company',
    location: job.location || 'Unknown Location',
    description: job.description || '',
    url: job.url || '',
    source: job.source || 'unknown',
    postedDate: job.postedDate || new Date().toISOString(),
    matchScore: 0, // Will be set in Phase 3
    salary: job.salary,
    remote: job.remote,
    scannedAt: new Date().toISOString()
  }))
  
  return { rawJobs: structuredJobs, rawCountsBySource }
}

/**
 * PHASE 1.5: Normalize and deduplicate jobs
 */
async function normalizeAndDedupe(rawJobs: JobPosting[]): Promise<JobPosting[]> {
  console.log('🔍 PHASE 1.5: Normalizing and deduplicating jobs...')
  
  const originalCount = rawJobs.length
  
  // Normalize job data
  const normalized = rawJobs.map(job => ({
    ...job,
    title: job.title.trim(),
    company: job.company.trim(),
    url: job.url.trim().toLowerCase(),
    description: (job.description || '').trim()
  }))
  
  // Deduplicate by URL (primary key)
  const urlMap = new Map<string, JobPosting>()
  
  for (const job of normalized) {
    const normalizedUrl = job.url
      .replace(/\?.*$/, '') // Remove query parameters
      .replace(/#.*$/, '')  // Remove hash fragments
      .replace(/\/$/, '')   // Remove trailing slash
    
    // Keep the job with the best description (longest)
    const existing = urlMap.get(normalizedUrl)
    if (!existing || (job.description?.length || 0) > (existing.description?.length || 0)) {
      urlMap.set(normalizedUrl, job)
    }
  }
  
  const deduped = Array.from(urlMap.values())
  
  // Also check for near-duplicate titles from same company (within 3 days)
  const titleCompanyMap = new Map<string, JobPosting>()
  const finalJobs: JobPosting[] = []
  
  for (const job of deduped) {
    const titleCompanyKey = `${job.company.toLowerCase()}::${job.title.toLowerCase()}`
    const existing = titleCompanyMap.get(titleCompanyKey)
    
    if (!existing) {
      titleCompanyMap.set(titleCompanyKey, job)
      finalJobs.push(job)
    } else {
      // Check if posted within 3 days of each other
      const daysDiff = Math.abs(
        new Date(job.postedDate).getTime() - new Date(existing.postedDate).getTime()
      ) / (1000 * 60 * 60 * 24)
      
      if (daysDiff > 3) {
        // Different posting, keep both
        finalJobs.push(job)
      } else {
        // Likely duplicate, keep the one with better description
        if ((job.description?.length || 0) > (existing.description?.length || 0)) {
          // Replace existing with better one
          const existingIndex = finalJobs.indexOf(existing)
          if (existingIndex !== -1) {
            finalJobs[existingIndex] = job
          }
          titleCompanyMap.set(titleCompanyKey, job)
        }
      }
    }
  }
  
  const duplicatesRemoved = originalCount - finalJobs.length
  console.log(`🔍 Deduplication: ${originalCount} → ${finalJobs.length} jobs (removed ${duplicatesRemoved} duplicates)`)
  console.log(`✅ PHASE 1.5 COMPLETE: ${finalJobs.length} unique jobs`)
  
  return finalJobs
}

/**
 * PHASE 2: Apply basic hard filters (location, date, job type)
 */
async function applyBasicFilters(rawJobs: JobPosting[], location: string): Promise<JobPosting[]> {
  console.log('🔍 PHASE 2: Applying basic filters (location, date, job type)...')
  
  let filtered = [...rawJobs]
  const originalCount = filtered.length
  
  // Location filter - more permissive for non-federal sources
  const locationKeywords = getLocationKeywords(location)
  filtered = filtered.filter(job => {
    const jobLocation = (job.location || '').toLowerCase()
    const isFederal = job.source?.toLowerCase() === 'usajobs'
    
    // For federal jobs, keep all (they have their own filters)
    // For non-federal, accept remote OR location match OR keep if no location specified
    if (isFederal) return true
    
    return jobLocation.includes('remote') || 
           locationKeywords.some(keyword => jobLocation.includes(keyword.toLowerCase())) ||
           !jobLocation // Keep jobs with no location
  })
  console.log(`📍 Location filter: ${filtered.length}/${originalCount} jobs remain (permissive for non-federal)`)
  
  // Date filter (last 14 days) - widened from 5 days to stabilize volume
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  
  const beforeDateFilter = filtered.length
  filtered = filtered.filter(job => {
    const postedDate = new Date(job.postedDate)
    return postedDate >= fourteenDaysAgo
  })
  console.log(`📅 Date filter (last 14 days): ${filtered.length}/${beforeDateFilter} jobs remain`)
  
  // Basic security job type filter
  const securityKeywords = [
    'security', 'cybersecurity', 'grc', 'governance', 'risk', 'compliance',
    'information security', 'it security', 'network security', 'application security',
    'security analyst', 'security engineer', 'security consultant', 'security architect',
    'penetration testing', 'vulnerability', 'threat', 'audit', 'assessment',
    'nist', 'iso', 'soc', 'pci', 'hipaa', 'fedramp', 'fisma', 'rmf'
  ]
  
  const beforeJobTypeFilter = filtered.length
  filtered = filtered.filter(job => {
    const title = (job.title || '').toLowerCase()
    const description = (job.description || '').toLowerCase()
    const combined = title + ' ' + description
    
    return securityKeywords.some(keyword => combined.includes(keyword))
  })
  console.log(`🔒 Security job type filter: ${filtered.length}/${beforeJobTypeFilter} jobs remain`)
  
  console.log(`✅ PHASE 2 COMPLETE: ${filtered.length}/${originalCount} jobs after basic filtering`)
  return filtered
}

/**
 * PHASE 3: Score jobs against resume (personalized matching)
 */
async function scoreAgainstResume(filteredJobs: JobPosting[], resumeContent: string): Promise<JobPosting[]> {
  console.log('🔍 PHASE 3: Scoring jobs against resume...')
  
  const scoredJobs = filteredJobs.map(job => {
    const matchResult = smartMatch(job.description || '', resumeContent)
    
    return {
      ...job,
      matchScore: matchResult.matchScore,
      foundKeywords: matchResult.foundKeywords,
      missingKeywords: matchResult.missingKeywords,
      criticalMissing: matchResult.criticalMissing
    }
  })
  
  // Calculate score distribution
  const scoreDistribution = scoredJobs.reduce((acc: Record<string, number>, job) => {
    const score = job.matchScore || 0
    if (score >= 90) acc['90%+'] = (acc['90%+'] || 0) + 1
    else if (score >= 75) acc['75-89%'] = (acc['75-89%'] || 0) + 1
    else if (score >= 50) acc['50-74%'] = (acc['50-74%'] || 0) + 1
    else acc['<50%'] = (acc['<50%'] || 0) + 1
    return acc
  }, {})
  
  console.log(`✅ PHASE 3 COMPLETE: ${scoredJobs.length} jobs scored`)
  console.log('📊 Score distribution:', scoreDistribution)
  
  return scoredJobs
}

/**
 * PHASE 4: Verify URLs are reachable
 */
async function verifyUrls(scoredJobs: JobPosting[]): Promise<JobPosting[]> {
  console.log('🔍 PHASE 4: Verifying URLs are reachable...')
  
  const verifiedJobs = []
  let verifiedCount = 0
  let unverifiedCount = 0
  
  for (const job of scoredJobs) {
    if (!job.url || job.url === '') {
      console.warn(`⚠️ Empty URL for job: ${job.title} - keeping as unverified`)
      // Keep job even without URL, mark as unverified
      verifiedJobs.push({
        ...job,
        linkStatus: 0,
        verifiedAt: new Date().toISOString()
      })
      unverifiedCount++
      continue
    }
    
    try {
      const verifiedJob = await verifyAndEnrichJobLink(job)
      if (verifiedJob && verifiedJob.id && verifiedJob.title) {
        // Ensure the verified job has all required JobPosting fields
        const completeJob: JobPosting = {
          id: verifiedJob.id,
          title: verifiedJob.title || job.title,
          company: verifiedJob.company || job.company,
          location: verifiedJob.location || job.location,
          description: verifiedJob.description || job.description,
          url: verifiedJob.url || job.url,
          source: verifiedJob.source || job.source,
          postedDate: verifiedJob.postedDate || job.postedDate,
          matchScore: job.matchScore,
          salary: job.salary,
          remote: job.remote,
          scannedAt: job.scannedAt
        }
        verifiedJobs.push(completeJob)
        verifiedCount++
      } else {
        // Keep job even if verification failed - mark as unverified
        console.warn(`⚠️ URL verification failed: ${job.url} (${job.title}) - keeping as unverified`)
        verifiedJobs.push({
          ...job,
          linkStatus: 0,
          verifiedAt: new Date().toISOString()
        })
        unverifiedCount++
      }
    } catch (error) {
      // Don't drop job on CORS or verification error - keep as unverified
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`⚠️ URL check error: ${job.url} (${errorMsg}) - keeping as unverified`)
      verifiedJobs.push({
        ...job,
        linkStatus: 0,
        verifiedAt: new Date().toISOString()
      })
      unverifiedCount++
    }
  }
  
  console.log(`✅ PHASE 4 COMPLETE: ${verifiedCount} URLs verified, ${unverifiedCount} kept as unverified, 0 dropped`)
  return verifiedJobs
}

/**
 * PHASE 5: Final sorting and presentation
 */
async function finalSorting(verifiedJobs: JobPosting[]): Promise<{
  highMatches: JobPosting[]
  goodMatches: JobPosting[]
  fairMatches: JobPosting[]
  allJobs: JobPosting[]
}> {
  console.log('🔍 PHASE 5: Final sorting and presentation...')
  
  // Sort by match score (high to low), then by posting date (newest first)
  const sortedJobs = verifiedJobs.sort((a, b) => {
    // First by match score
    const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0)
    if (scoreDiff !== 0) return scoreDiff
    
    // Then by posting date (newest first)
    return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
  })
  
  // Create score buckets
  const highMatches = sortedJobs.filter(job => (job.matchScore || 0) >= 90)
  const goodMatches = sortedJobs.filter(job => (job.matchScore || 0) >= 75 && (job.matchScore || 0) < 90)
  const fairMatches = sortedJobs.filter(job => (job.matchScore || 0) >= 50 && (job.matchScore || 0) < 75)
  
  console.log(`✅ PHASE 5 COMPLETE: Final sorting done`)
  console.log(`📊 Final results: ${highMatches.length} high (90%+), ${goodMatches.length} good (75-89%), ${fairMatches.length} fair (50-74%)`)
  
  return { highMatches, goodMatches, fairMatches, allJobs: sortedJobs }
}

/**
 * PHASE 6: Store feedback signals for future tuning
 */
async function storeFeedbackSignals(finalResults: {
  highMatches: JobPosting[]
  goodMatches: JobPosting[]
  fairMatches: JobPosting[]
  allJobs: JobPosting[]
}, pipelineStats: any): Promise<void> {
  console.log('🔍 PHASE 6: Storing feedback signals for future tuning...')
  
  try {
    // Store feedback signals in localStorage for analysis
    const feedbackSignals = {
      timestamp: new Date().toISOString(),
      pipelineStats,
      jobStats: {
        totalJobs: finalResults.allJobs.length,
        highMatches: finalResults.highMatches.length,
        goodMatches: finalResults.goodMatches.length,
        fairMatches: finalResults.fairMatches.length
      },
      sourceEffectiveness: pipelineStats.sourceBreakdown,
      scoreDistribution: pipelineStats.scoreDistribution,
      // Track which keywords are most common in high-scoring jobs
      topKeywordsInHighMatches: extractTopKeywords(finalResults.highMatches),
      // Track which sources provide the best matches
      sourceQuality: calculateSourceQuality(finalResults.allJobs)
    }
    
    // Append to feedback history (keep last 10 scans)
    const feedbackHistory = JSON.parse(localStorage.getItem('pipelineFeedbackHistory') || '[]')
    feedbackHistory.push(feedbackSignals)
    
    // Keep only last 10 scans
    if (feedbackHistory.length > 10) {
      feedbackHistory.shift()
    }
    
    localStorage.setItem('pipelineFeedbackHistory', JSON.stringify(feedbackHistory))
    
    console.log('✅ PHASE 6 COMPLETE: Feedback signals stored')
    console.log('📊 Feedback signals:', {
      totalJobs: feedbackSignals.jobStats.totalJobs,
      topKeywords: feedbackSignals.topKeywordsInHighMatches.slice(0, 5),
      bestSource: Object.entries(feedbackSignals.sourceQuality)
        .sort(([,a], [,b]) => (b as any).avgScore - (a as any).avgScore)[0]
    })
  } catch (error) {
    console.error('❌ Failed to store feedback signals:', error)
    // Don't fail the pipeline if feedback storage fails
  }
}

/**
 * Helper: Extract top keywords from high-scoring jobs
 */
function extractTopKeywords(jobs: JobPosting[]): string[] {
  const keywordCounts: Record<string, number> = {}
  
  jobs.forEach(job => {
    // Extract keywords from job description
    const keywords = extractKeywordsFromDescription(job.description || '')
    
    keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
    })
  })
  
  return Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([keyword]) => keyword)
}

/**
 * Helper: Extract keywords from job description
 */
function extractKeywordsFromDescription(description: string): string[] {
  const keywords = [
    'aws', 'azure', 'gcp', 'python', 'terraform', 'kubernetes',
    'nist', 'iso 27001', 'soc 2', 'fedramp', 'fisma',
    'cissp', 'cisa', 'cism', 'security+', 'comptia',
    'risk assessment', 'compliance', 'audit', 'governance'
  ]
  
  const desc = description.toLowerCase()
  return keywords.filter(keyword => desc.includes(keyword))
}

/**
 * Helper: Calculate source quality metrics
 */
function calculateSourceQuality(jobs: JobPosting[]): Record<string, { count: number, avgScore: number }> {
  const sourceMetrics: Record<string, { total: number, sumScore: number }> = {}
  
  jobs.forEach(job => {
    if (!sourceMetrics[job.source]) {
      sourceMetrics[job.source] = { total: 0, sumScore: 0 }
    }
    sourceMetrics[job.source].total++
    sourceMetrics[job.source].sumScore += job.matchScore || 0
  })
  
  const result: Record<string, { count: number, avgScore: number }> = {}
  Object.entries(sourceMetrics).forEach(([source, metrics]) => {
    result[source] = {
      count: metrics.total,
      avgScore: Math.round(metrics.sumScore / metrics.total)
    }
  })
  
  return result
}

/**
 * Helper function to get location keywords
 */
function getLocationKeywords(location: string): string[] {
  const locationLower = location.toLowerCase()
  
  if (locationLower.includes('washington dc')) return ['washington dc', 'dc', 'maryland', 'virginia', 'nova']
  if (locationLower.includes('remote')) return ['remote', 'work from home', 'wfh', 'telecommute']
  if (locationLower.includes('new york')) return ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens']
  if (locationLower.includes('california')) return ['california', 'ca', 'san francisco', 'los angeles', 'san diego']
  if (locationLower.includes('texas')) return ['texas', 'tx', 'austin', 'dallas', 'houston']
  
  return [location] // Return the location as-is if no specific mapping
}

/**
 * Main clean pipeline function
 */
export async function cleanJobScanPipeline(resumeContent: string, location: string): Promise<PipelineResults> {
  console.log('🚨 CLEAN PIPELINE STARTED')
  console.log('📍 Resume length:', resumeContent.length)
  console.log('📍 Location:', location)
  
  const startTime = Date.now()
  
  const pipelineStats: any = {
    phase1Raw: 0,
    phase2Filtered: 0,
    phase3Scored: 0,
    phase4Verified: 0,
    phase5Final: 0,
    sourceBreakdown: {},
    scoreDistribution: {},
    phase1_5Deduped: 0,
    duplicatesRemoved: 0
  }
  
  try {
    console.log('🔍 PHASE 1: About to gather all security jobs...')
    // PHASE 1: Gather all jobs
    // PHASE 1: PURE DATA DUMP
    console.warn('🚨 PHASE 1: Starting pure data dump - no filters, maximum volume')
    const { rawJobs, rawCountsBySource } = await gatherAllSecurityJobs(resumeContent, location)
    
    // PHASE 1 COMPLETE - Contract required logging
    console.warn('🚨 PHASE 1 GATHER: COMPLETE')
    console.warn('📊 RAW JOB COUNTS BY SOURCE:')
    Object.entries(rawCountsBySource).forEach(([source, count]) => {
      console.warn(`   ${source}: ${count} jobs`)
    })
    console.warn(`📊 Total raw jobs collected: ${rawJobs.length}`)
    
    if (rawJobs.length === 0) {
      console.error('🚨 PHASE 1 RETURNED 0 JOBS - Pipeline will fail')
    }
    
    pipelineStats.phase1Raw = rawJobs.length
    
    // PHASE 2: BASIC FILTERS
    console.warn('🚨 PHASE 2: Starting basic filters - location, recency, job type')
    const filteredJobs = await applyFilters(rawJobs, location, true)
    pipelineStats.phase2Filtered = filteredJobs.length
    
    // PHASE 2 COMPLETE - Contract required logging
    console.warn(`📊 PHASE 2 OUTPUT: ${filteredJobs.length} jobs after filtering`)
    
    // PHASE 3: RESUME SCORING
    console.warn('🚨 PHASE 3: Starting resume scoring - smart matching')
    const scoredJobs = await scoreAgainstResume(filteredJobs as any[], resumeContent)
    pipelineStats.phase3Scored = scoredJobs.length
    
    // PHASE 3 COMPLETE - Contract required logging
    const scoreDistribution = scoredJobs.reduce((acc: Record<string, number>, job: any) => {
      const score = job.matchScore || 0
      let bucket = '0-20'
      if (score >= 80) bucket = '80-100'
      else if (score >= 60) bucket = '60-80'
      else if (score >= 40) bucket = '40-60'
      else if (score >= 20) bucket = '20-40'
      acc[bucket] = (acc[bucket] || 0) + 1
      return acc
    }, {})
    
    console.warn('📊 SCORE DISTRIBUTION:')
    Object.entries(scoreDistribution).forEach(([bucket, count]) => {
      console.warn(`   ${bucket}: ${count} jobs`)
    })
    
    // PHASE 4: URL VERIFICATION
    console.warn('🚨 PHASE 4: Starting URL verification - only for scored jobs')
    const verifiedJobs = await verifyUrls(scoredJobs as any[])
    pipelineStats.phase4Verified = verifiedJobs.length
    
    // PHASE 4 COMPLETE - Contract required logging
    const verifiedCount = verifiedJobs.filter(job => (job as any).verifiedAt).length
    const unverifiedCount = verifiedJobs.length - verifiedCount
    console.warn(`📊 VERIFICATION RESULTS: ${verifiedCount} verified, ${unverifiedCount} unverified`)
    
    // PHASE 5: FINAL SORTING
    const finalResults = await finalSorting(verifiedJobs as any[])
    pipelineStats.phase5Final = finalResults.allJobs.length
    
    // Calculate source breakdown for final results
    pipelineStats.sourceBreakdown = finalResults.allJobs.reduce((acc: Record<string, number>, job) => {
      acc[job.source] = (acc[job.source] || 0) + 1
      return acc
    }, {})
    
    // Calculate final score distribution
    pipelineStats.scoreDistribution = {
      '90%+': finalResults.highMatches.length,
      '75-89%': finalResults.goodMatches.length,
      '50-74%': finalResults.fairMatches.length,
      '<50%': 0 // Jobs below 50% are excluded
    }
    
    // PHASE 6: Store feedback signals
    await storeFeedbackSignals(finalResults, pipelineStats)
    
    const elapsed = Date.now() - startTime
    console.log(`🎉 CLEAN PIPELINE COMPLETE in ${elapsed}ms!`)
    console.log(`📊 FINAL SUMMARY:`, {
      totalGathered: pipelineStats.phase1Raw,
      duplicatesRemoved: pipelineStats.duplicatesRemoved,
      afterDedup: pipelineStats.phase1_5Deduped,
      afterFilters: pipelineStats.phase2Filtered,
      afterScoring: pipelineStats.phase3Scored,
      afterVerification: pipelineStats.phase4Verified,
      finalJobs: pipelineStats.phase5Final,
      highMatches: finalResults.highMatches.length,
      goodMatches: finalResults.goodMatches.length,
      fairMatches: finalResults.fairMatches.length
    })
    
    return {
      ...finalResults,
      pipelineStats
    }
    
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`❌ Pipeline failed after ${elapsed}ms:`, error)
    throw error
  }
}
