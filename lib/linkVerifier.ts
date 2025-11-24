// Job Link Verification and Enrichment
// Verifies job URLs, extracts canonical URLs, and enriches with real descriptions

import { JobPosting } from './jobScanner'

const UA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

/**
 * Detect tracker URLs that are not real job detail pages
 */
function isTrackerUrl(url: string): boolean {
  const u = url.toLowerCase()
  return u.includes('/rc/clk') ||
         u.includes('/pagead/clk') ||
         u.includes('trackingid=') ||
         u.includes('currentjobid=') ||
         u.includes('/jobs/search/') ||
         u.includes('oracle.taleo.net') ||
         u.includes('taleo.net') ||
         u.includes('workday.com') ||
         u.includes('icims.com') ||
         u.includes('careers.microsoft.com') || // Microsoft careers often has issues
         u.includes('/errorpages/') ||
         u.includes('/errorpage') ||
         u.includes('/404.html')
}

/**
 * Check if job looks like a real detail page with actual content
 */
function isValidJob(job: Partial<JobPosting>): boolean {
  return !!job.description && 
         job.description.length > 50 && 
         (job.linkStatus !== 404 && job.linkStatus !== 410)
}

export async function verifyAndEnrichJobLink(job: Partial<JobPosting>): Promise<Partial<JobPosting> | null> {
  if (!job.url) {
    console.warn('❌ Job has no URL:', job.id, job.title)
    return null // Drop jobs without URLs - they should have them!
  }

  // Skip URL verification for USAJobs due to CORS blocking
  if (job.url.includes('usajobs.gov')) {
    console.log(`⏭️ Skipping USAJobs URL verification due to CORS: ${job.url}`)
    return {
      ...job,
      linkStatus: 200, // Assume valid
      verifiedAt: new Date().toISOString()
    }
  }

  // Pre-filter tracker URLs immediately
  if (isTrackerUrl(job.url)) {
    console.warn('❌ Tracker URL detected, dropping:', job.url)
    return null
  }

  try {
    console.log(`🔍 Verifying URL: ${job.url}`)
    
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // Reduced from 8000 to 5000
    
    const res = await fetch(job.url, { 
      headers: UA_HEADERS, 
      redirect: 'follow',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const finalUrl = res.url
    const status = res.status

    if (!res.ok) {
      console.warn(`❌ URL verification failed: ${job.url} - Status: ${status}`)
      return null // Drop job on 404, 410, etc.
    }

    const html = await res.text()

    // Soft-404 detection for branded error pages
    if (isSoft404(html, finalUrl)) {
      console.warn("❌ Soft 404 detected, dropping:", finalUrl)
      return null
    }

    // Shell page detection - drop pages that don't look like real job details
    if (job.source === 'linkedin') {
      const looksLikeJob =
        html.includes('show-more-less-html__markup') ||
        html.includes('jobs/view/') ||
        finalUrl.includes('/jobs/view/')

      if (!looksLikeJob) {
        console.warn('❌ LinkedIn shell page, dropping:', finalUrl)
        return null
      }
    }
    
    if (job.source === 'indeed') {
      const looksLikeJob =
        html.includes('jobDescriptionText') ||
        html.includes('jobsearch-JobInfoHeader') ||
        finalUrl.includes('/viewjob?jk=')

      if (!looksLikeJob) {
        console.warn('❌ Indeed shell page, dropping:', finalUrl)
        return null
      }
    }

    // LinkedIn login wall detection
    const requiresLogin =
      finalUrl.includes('/login') ||
      finalUrl.includes('/checkpoint') ||
      finalUrl.includes('authwall') ||
      finalUrl.includes('signin')

    // Extract canonical url if present
    const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)
    const canonical = canonicalMatch?.[1] || finalUrl

    // Extract real description from detail page
    let description = job.description || ''
    
    // LinkedIn description extraction
    if (job.source === 'linkedin') {
      const descMatch = html.match(/<div[^>]*class="show-more-less-html__markup"[^>]*>(.*?)<\/div>/s)
      description = descMatch ? cleanHtml(descMatch[1]) : description
    }
    
    // Indeed description extraction
    if (job.source === 'indeed') {
      const descMatch = html.match(/<div[^>]*id="jobDescriptionText"[^>]*>(.*?)<\/div>/s)
      description = descMatch ? cleanHtml(descMatch[1]) : description
    }

    // CRITICAL: If no real description extracted, drop the job
    if (!description || description.length < 200) {
      console.warn(`❌ No real description (length: ${description.length}), dropping:`, canonical)
      return null
    }

    console.log(`✅ URL verified: ${canonical} | Description: ${description.length} chars | Login: ${requiresLogin}`)

    const verifiedJob = {
      ...job,
      url: canonical,
      applyUrl: canonical, // Use canonical URL instead of apply tracking URLs
      requiresLogin,
      verifiedAt: new Date().toISOString(),
      linkStatus: status,
      description // Enriched with real description
    }

    // Final validity check - must look like a real detail page
    if (!isValidJob(verifiedJob)) {
      console.warn('❌ Job does not look like real detail page, dropping:', canonical)
      return null
    }

    return verifiedJob
  } catch (error) {
    console.warn(`❌ URL verification error: ${job.url} - ${error}`)
    return null // Drop job on verification errors
  }
}

/**
 * Detect soft 404 pages that return HTTP 200 but are actually error pages
 */
function isSoft404(html: string, finalUrl: string): boolean {
  const h = html.toLowerCase()
  const u = finalUrl.toLowerCase()

  if (u.includes("/404") || u.includes("errorpage") || u.includes("notfound") || u.includes("/errorpages/")) return true

  const phrases = [
    "page not found",
    "job not found", 
    "no longer available",
    "position has been filled",
    "not accepting applications",
    "job you are looking for has expired",
    "this job is no longer available",
    "the position you're looking for",
    "job has expired",
    "job posting has been removed",
    "sorry, this job is no longer available",
    "we couldn't find the job you're looking for",
    "the job you requested is not available",
    "this position is no longer open",
    "careers home", // Many error pages redirect to careers home
    "back to careers", // Common on error pages
    "search all jobs", // Error pages often show this
    "explore opportunities", // Generic error page text
    "page not available",
    "resource not found",
    "url not found",
    "invalid job id",
    "job id not found",
    "position not found"
  ]

  return phrases.some(p => h.includes(p))
}

/**
 * Batch verify jobs with rate limiting
 */
export async function batchVerifyJobs(jobs: Partial<JobPosting>[], topN?: number): Promise<Partial<JobPosting>[]> {
  // Verify ALL jobs if no topN specified, otherwise limit
  const toVerify = topN ? jobs.slice(0, topN) : jobs
  
  // If too many jobs, limit to prevent getting stuck
  const maxVerify = Math.min(toVerify.length, 25) // Further reduced from 50 to 25
  const limitedJobs = toVerify.slice(0, maxVerify)
  
  console.log(`🔍 Verifying ${limitedJobs.length}/${jobs.length} job URLs (capped at 25 for speed)...`)
  
  // Source health tracking
  const sourceStats: Record<string, { raw: number; verified: number; dropped: number }> = {}
  
  // Initialize source stats
  jobs.forEach(job => {
    const source = job.source || 'unknown'
    if (!sourceStats[source]) {
      sourceStats[source] = { raw: 0, verified: 0, dropped: 0 }
    }
    sourceStats[source].raw++
  })
  
  // Verify with very conservative concurrency to avoid rate limiting
  const CONCURRENT_LIMIT = 1 // Reduced from 2 to 1 for maximum stability
  const verified: Partial<JobPosting>[] = []
  let droppedCount = 0
  
  console.log(`🚀 Starting verification: ${limitedJobs.length} jobs, 1 at a time, 3s delays`)
  
  for (let i = 0; i < limitedJobs.length; i += CONCURRENT_LIMIT) {
    const currentJob = i + 1
    const totalJobs = limitedJobs.length
    const progress = Math.round((currentJob / totalJobs) * 100)
    
    console.log(`🔍 [${progress}%] Verifying job ${currentJob}/${totalJobs}...`)
    
    const batch = limitedJobs.slice(i, i + CONCURRENT_LIMIT)
    
    // Add timeout for the entire batch
    const batchPromise = Promise.allSettled(
      batch.map(job => 
        Promise.race([
          verifyAndEnrichJobLink(job),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Job verification timeout')), 6000)
          )
        ])
      )
    )
    
    let verifiedSettled
    try {
      verifiedSettled = await batchPromise
    } catch (error) {
      console.warn(`⚠️ Job ${currentJob} timed out, skipping...`)
      continue // Skip this job and continue
    }
    
    const batchVerified = verifiedSettled
      .filter(r => {
        if (r.status === 'fulfilled' && r.value) {
          return true
        } else {
          // Track dropped jobs by source
          const jobIndex = verifiedSettled.indexOf(r)
          const job = batch[jobIndex]
          const source = job?.source || 'unknown'
          if (sourceStats[source]) {
            sourceStats[source].dropped++
          }
          droppedCount++
          return false
        }
      })
      .map(r => (r as PromiseFulfilledResult<Partial<JobPosting>>).value)
    
    verified.push(...batchVerified)
    
    // Longer delay between jobs to be very respectful
    if (i + CONCURRENT_LIMIT < limitedJobs.length) {
      console.log(`⏳ Waiting 3s before next job...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }
  
  // Update verified counts
  verified.forEach(job => {
    const source = job.source || 'unknown'
    if (sourceStats[source]) {
      sourceStats[source].verified++
    }
  })
  
  console.log(`✅ Verified ${verified.length}/${toVerify.length} URLs, dropped ${droppedCount} dead links`)
  
  // Source health debug log
  console.log('📊 Source Health Report:')
  Object.entries(sourceStats).forEach(([source, stats]) => {
    console.log(`  ${source}: ${stats.raw} raw → ${stats.verified} verified → ${stats.dropped} dropped`)
  })
  
  // Return only verified jobs (no unverified tail for dead links)
  return verified
}

/**
 * Clean HTML text content
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove scripts
    .replace(/<style[^>]*>.*?<\/style>/gs, '') // Remove styles
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}
