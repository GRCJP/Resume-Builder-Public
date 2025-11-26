// Multi-Source Job Board Integrations
// Practical implementations for LinkedIn, Indeed, The Mom Project, and others

import { JobPosting } from './jobScanner'
import { generateSearchQueries } from './searchQueryBuilder'
import { searchFederalGRCJobs } from './usajobsAPI'
import { searchAdzunaJobs } from './adzunaAPI'
import { searchSerpApiJobs } from './serpapiJobs'
import { searchJSearchJobs } from './jsearchAPI'

/**
 * LinkedIn Jobs Integration with Pagination
 * Uses LinkedIn's public job search (no API required)
 */
export async function searchLinkedInJobs(keywords: string[], location: string, maxPages: number = 6): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  const RESULTS_PER_PAGE = 25
  
  console.log(`🔍 LinkedIn: Searching ${keywords.join(', ')} in ${location}`)
  
  for (let page = 0; page < maxPages; page++) {
    const start = page * RESULTS_PER_PAGE
    const encodedKeywords = keywords.join('%20')
    const encodedLocation = encodeURIComponent(location)
    
    // Use jobs-guest endpoint for actual job cards
    const searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedKeywords}&location=${encodedLocation}&f_TPR=r86400&start=${start}`
    
    console.log(`📄 LinkedIn page ${page + 1}/${maxPages} (start=${start})`)
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        console.warn(`LinkedIn page ${page + 1} failed: ${response.status}`)
        break
      }
      
      const html = await response.text()
      
      // Extract job cards from guest API response
      const jobCardRegex = /<div[^>]*class="base-card[^>]*"[^>]*data-occludable-job-id="([^"]*)"[^>]*>(.*?)<\/div>/gs
      const cardMatches = html.match(jobCardRegex) || []
      
      console.log(`📊 LinkedIn page ${page + 1}: Found ${cardMatches.length} job cards`)
      
      if (cardMatches.length === 0) {
        console.log(`🔚 LinkedIn page ${page + 1}: No jobs found, stopping pagination`)
        break
      }
      
      let pageJobCount = 0
      
      for (const jobHtml of cardMatches) {
        // Extract job ID from data attribute
        const jobIdMatch = jobHtml.match(/data-occludable-job-id="([^"]*)"/)
        const jobId = jobIdMatch ? jobIdMatch[1] : ''
        
        // Extract title
        const titleMatch = jobHtml.match(/<h3[^>]*class="base-search-card__title"[^>]*>(.*?)<\/h3>/s)
        const title = titleMatch ? cleanHtml(titleMatch[1]) : ''
        
        // Extract company
        const companyMatch = jobHtml.match(/<h4[^>]*class="base-search-card__subtitle"[^>]*>(.*?)<\/h4>/s)
        const company = companyMatch ? cleanHtml(companyMatch[1]) : ''
        
        // Extract location
        const locationMatch = jobHtml.match(/<span[^>]*class="job-search-card__location"[^>]*>(.*?)<\/span>/s)
        const jobLocation = locationMatch ? cleanHtml(locationMatch[1]) : location
        
        // Extract posted date
        const dateMatch = jobHtml.match(/<time[^>]*datetime="([^"]*)"/)
        const postedDate = dateMatch ? dateMatch[1] : new Date().toISOString()
        
        if (title && company && jobId) {
          // Build canonical view URL - ignore tracking hrefs
          const canonicalUrl = `https://www.linkedin.com/jobs/view/${jobId}/`
          
          jobs.push({
            id: `linkedin-${jobId}`,
            title: cleanHtml(title),
            company: cleanHtml(company),
            location: cleanHtml(jobLocation),
            url: canonicalUrl,
            source: 'linkedin' as any,
            postedDate,
            description: '' // Will be fetched by verifier
          })
          pageJobCount++
        }
      }
      
      console.log(`✅ LinkedIn page ${page + 1}: Added ${pageJobCount} jobs`)
      
      // Stop if this page had no valid jobs
      if (pageJobCount === 0) {
        console.log(`🔚 LinkedIn: No valid jobs on page ${page + 1}, stopping pagination`)
        break
      }
    } catch (error) {
      console.error(`❌ LinkedIn page ${page + 1} error:`, error)
      break
    }
  }
  
  console.log(`✅ LinkedIn: Found ${jobs.length} total jobs`)
  return jobs
}

/**
 * Get LinkedIn job details
 */
export async function getLinkedInJobDetails(jobId: string): Promise<string> {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) return ''
    
    const html = await response.text()
    
    // Extract description
    const descMatch = html.match(/<div[^>]*class="show-more-less-html__markup"[^>]*>(.*?)<\/div>/s)
    return descMatch ? cleanHtml(descMatch[1]) : ''
  } catch (error) {
    console.error('LinkedIn details error:', error)
    return ''
  }
}

/**
 * Indeed Jobs Integration with Pagination
 * Uses Indeed's public job search (no API required)
 */
export async function searchIndeedJobs(keywords: string[], location: string, maxPages: number = 6): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  const RESULTS_PER_PAGE = 10
  
  console.log(`🔍 Indeed: Searching ${keywords.join(', ')} in ${location}`)
  
  for (let page = 0; page < maxPages; page++) {
    const start = page * RESULTS_PER_PAGE
    const searchUrl = `https://www.indeed.com/jobs?q=${keywords.join('+')}&l=${location}&start=${start}&sort=date&filter=0`
    
    console.log(`📄 Indeed page ${page + 1}/${maxPages} (start=${start})`)
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        console.warn(`Indeed page ${page + 1} failed: ${response.status}`)
        break
      }
      
      const html = await response.text()
      
      // Extract job cards using Indeed's job card structure
      const jobCardRegex = /<div[^>]*class="job_seen_beacon"[^>]*>(.*?)<\/div>/gs
      const cardMatches = html.match(jobCardRegex) || []
      
      console.log(`📊 Indeed page ${page + 1}: Found ${cardMatches.length} job cards`)
      
      if (cardMatches.length === 0) {
        console.log(`🔚 Indeed page ${page + 1}: No jobs found, stopping pagination`)
        break
      }
      
      let pageJobCount = 0
      
      for (const jobHtml of cardMatches) {
        // Extract real href from card
        const hrefMatch = jobHtml.match(/<a[^>]*href="([^"]+)"[^>]*class="jcs-JobTitle[^"]*"/)
        const rawHref = hrefMatch ? hrefMatch[1] : ''
        
        // Extract job key from URL
        const jobKeyMatch = rawHref.match(/jk=([^&]+)/)
        const jobKey = jobKeyMatch ? jobKeyMatch[1] : ''
        
        // Build canonical view URL - ignore tracking URLs
        const jobUrl = jobKey
          ? `https://www.indeed.com/viewjob?jk=${jobKey}` 
          : (rawHref.startsWith('http') ? rawHref : `https://www.indeed.com${rawHref}`)
        
        // Extract title
        const titleMatch = jobHtml.match(/<h2[^>]*class="jobTitle"[^>]*>(.*?)<\/h2>/s)
        const title = titleMatch ? cleanHtml(titleMatch[1]) : ''
        
        // Extract company
        const companyMatch = jobHtml.match(/<span[^>]*class="companyName"[^>]*>(.*?)<\/span>/s)
        const company = companyMatch ? cleanHtml(companyMatch[1]) : ''
        
        // Extract location
        const locationMatch = jobHtml.match(/<div[^>]*class="companyLocation"[^>]*>(.*?)<\/div>/s)
        const jobLocation = locationMatch ? cleanHtml(locationMatch[1]) : location
        
        // Extract salary if available
        const salaryMatch = jobHtml.match(/<div[^>]*class="salary-snippet"[^>]*>(.*?)<\/div>/s)
        const salary = salaryMatch ? cleanHtml(salaryMatch[1]) : undefined
        
        if (jobKey && title && company) {
          // Validate job key format (Indeed job keys are alphanumeric)
          if (!/^[a-zA-Z0-9]+$/.test(jobKey) || jobKey.length < 5) {
            console.warn(`Invalid Indeed job key: ${jobKey}`)
            continue
          }
          
          jobs.push({
            id: `indeed-${jobKey}`,
            title,
            company,
            location: jobLocation,
            url: jobUrl,
            source: 'indeed' as any,
            postedDate: new Date().toISOString(),
            salary,
            description: '' // Will be fetched by verifier
          })
          pageJobCount++
        }
      }
      
      console.log(`✅ Indeed page ${page + 1}: Added ${pageJobCount} jobs`)
      
      // Stop if this page had no valid jobs
      if (pageJobCount === 0) {
        console.log(`🔚 Indeed page ${page + 1}: No valid jobs, stopping pagination`)
        break
      }
      
    } catch (error) {
      console.error(`Indeed page ${page + 1} error:`, error)
      break
    }
  }
  
  console.log(`📈 Indeed total: ${jobs.length} jobs from ${Math.min(Math.ceil(jobs.length / RESULTS_PER_PAGE), maxPages)} pages`)
  return jobs
}

/**
 * Get Indeed job details
 */
export async function getIndeedJobDetails(jobKey: string): Promise<string> {
  try {
    const url = `https://www.indeed.com/viewjob?jk=${jobKey}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) return ''
    
    const html = await response.text()
    
    // Extract description
    const descMatch = html.match(/<div[^>]*id="jobDescriptionText"[^>]*>(.*?)<\/div>/s)
    return descMatch ? cleanHtml(descMatch[1]) : ''
  } catch (error) {
    console.error('Indeed details error:', error)
    return ''
  }
}

/**
 * The Mom Project Integration
 */
export async function searchMomProjectJobs(keywords: string[]): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    // The Mom Project has a public job board
    const keywordString = keywords.join(' ')
    const encodedKeywords = encodeURIComponent(keywordString)
    
    const url = `https://themomproject.com/job-search?keywords=${encodedKeywords}&remote=true`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('Mom Project fetch error:', response.status)
      return jobs
    }
    
    const html = await response.text()
    
    // Parse job listings
    const jobMatches = html.matchAll(/<div[^>]*class="job-card"[^>]*>(.*?)<\/div>/gs)
    
    for (const match of jobMatches) {
      const jobHtml = match[1]
      
      // Extract job ID from link
      const linkMatch = jobHtml.match(/href="\/jobs\/([^"]*)"/)
      const jobId = linkMatch ? linkMatch[1] : ''
      
      // Extract title
      const titleMatch = jobHtml.match(/<h3[^>]*>(.*?)<\/h3>/s)
      const title = titleMatch ? cleanHtml(titleMatch[1]) : ''
      
      // Extract company
      const companyMatch = jobHtml.match(/<div[^>]*class="company"[^>]*>(.*?)<\/div>/s)
      const company = companyMatch ? cleanHtml(companyMatch[1]) : ''
      
      if (jobId && title) {
        jobs.push({
          id: `momproject-${jobId}`,
          title,
          company: company || 'The Mom Project',
          location: 'Remote',
          url: `https://themomproject.com/jobs/${jobId}`,
          source: 'other' as any,
          postedDate: new Date().toISOString(),
          remote: true,
          description: ''
        })
      }
    }
    
    console.log(`Mom Project: Found ${jobs.length} jobs`)
    return jobs
  } catch (error) {
    console.error('Mom Project search error:', error)
    return jobs
  }
}

/**
 * Dice Jobs Integration (Tech-focused)
 */
export async function searchDiceJobs(keywords: string[], location: string): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    const keywordString = keywords.join(' ')
    const encodedKeywords = encodeURIComponent(keywordString)
    const encodedLocation = encodeURIComponent(location)
    
    const url = `https://www.dice.com/jobs?q=${encodedKeywords}&location=${encodedLocation}&radius=30&radiusUnit=mi&page=1&pageSize=50`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('Dice fetch error:', response.status)
      return jobs
    }
    
    const html = await response.text()
    
    // Parse job cards
    const jobMatches = html.matchAll(/<div[^>]*data-cy="card-summary"[^>]*>(.*?)<\/div>/gs)
    
    for (const match of jobMatches) {
      const jobHtml = match[1]
      
      // Extract job ID from link
      const linkMatch = jobHtml.match(/href="\/job-detail\/([^"]*)"/)
      const jobId = linkMatch ? linkMatch[1] : ''
      
      // Extract title
      const titleMatch = jobHtml.match(/<a[^>]*data-cy="card-title-link"[^>]*>(.*?)<\/a>/s)
      const title = titleMatch ? cleanHtml(titleMatch[1]) : ''
      
      // Extract company
      const companyMatch = jobHtml.match(/<a[^>]*data-cy="card-company"[^>]*>(.*?)<\/a>/s)
      const company = companyMatch ? cleanHtml(companyMatch[1]) : ''
      
      // Extract location
      const locationMatch = jobHtml.match(/<span[^>]*data-cy="card-location"[^>]*>(.*?)<\/span>/s)
      const jobLocation = locationMatch ? cleanHtml(locationMatch[1]) : location
      
      if (jobId && title && company) {
        jobs.push({
          id: `dice-${jobId}`,
          title,
          company,
          location: jobLocation,
          url: `https://www.dice.com/job-detail/${jobId}`,
          source: 'dice' as any,
          postedDate: new Date().toISOString(),
          description: ''
        })
      }
    }
    
    console.log(`Dice: Found ${jobs.length} jobs`)
    return jobs
  } catch (error) {
    console.error('Dice search error:', error)
    return jobs
  }
}

/**
 * ZipRecruiter Integration
 */
export async function searchZipRecruiterJobs(keywords: string[], location: string): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    const keywordString = keywords.join(' ')
    const encodedKeywords = encodeURIComponent(keywordString)
    const encodedLocation = encodeURIComponent(location)
    
    const url = `https://www.ziprecruiter.com/jobs-search?search=${encodedKeywords}&location=${encodedLocation}&days=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('ZipRecruiter fetch error:', response.status)
      return jobs
    }
    
    const html = await response.text()
    
    // Parse job listings
    const jobMatches = html.matchAll(/<article[^>]*class="job_result"[^>]*>(.*?)<\/article>/gs)
    
    for (const match of jobMatches) {
      const jobHtml = match[1]
      
      // Extract job ID
      const idMatch = jobHtml.match(/data-job-id="([^"]*)"/)
      const jobId = idMatch ? idMatch[1] : ''
      
      // Extract title
      const titleMatch = jobHtml.match(/<h2[^>]*class="title"[^>]*>.*?<a[^>]*>(.*?)<\/a>/s)
      const title = titleMatch ? cleanHtml(titleMatch[1]) : ''
      
      // Extract company
      const companyMatch = jobHtml.match(/<a[^>]*class="company_name"[^>]*>(.*?)<\/a>/s)
      const company = companyMatch ? cleanHtml(companyMatch[1]) : ''
      
      // Extract location
      const locationMatch = jobHtml.match(/<a[^>]*class="job_location"[^>]*>(.*?)<\/a>/s)
      const jobLocation = locationMatch ? cleanHtml(locationMatch[1]) : location
      
      if (jobId && title && company) {
        jobs.push({
          id: `ziprecruiter-${jobId}`,
          title,
          company,
          location: jobLocation,
          url: `https://www.ziprecruiter.com/c/job/${jobId}`,
          source: 'ziprecruiter' as any,
          postedDate: new Date().toISOString(),
          description: ''
        })
      }
    }
    
    console.log(`ZipRecruiter: Found ${jobs.length} jobs`)
    return jobs
  } catch (error) {
    console.error('ZipRecruiter search error:', error)
    return jobs
  }
}

/**
 * Glassdoor Integration
 */
export async function searchGlassdoorJobs(keywords: string[], location: string): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    const keywordString = keywords.join(' ')
    const encodedKeywords = encodeURIComponent(keywordString)
    const encodedLocation = encodeURIComponent(location)
    
    const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedKeywords}&locT=C&locId=1138213&locKeyword=${encodedLocation}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('Glassdoor fetch error:', response.status)
      return jobs
    }
    
    const html = await response.text()
    
    // Glassdoor uses React/JSON in script tags
    const dataMatch = html.match(/window\.gdPageData\s*=\s*({.*?});/s)
    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1])
        const jobListings = data.jobListings || []
        
        for (const job of jobListings) {
          jobs.push({
            id: `glassdoor-${job.jobview?.job?.listingId}`,
            title: job.jobview?.job?.jobTitleText || '',
            company: job.jobview?.header?.employerNameFromSearch || '',
            location: job.jobview?.header?.locationName || location,
            url: `https://www.glassdoor.com/job-listing/${job.jobview?.job?.listingId}`,
            source: 'glassdoor' as any,
            postedDate: job.jobview?.header?.posted || new Date().toISOString(),
            salary: job.jobview?.header?.payPercentile50 || undefined,
            description: ''
          })
        }
      } catch (parseError) {
        console.error('Glassdoor parse error:', parseError)
      }
    }
    
    console.log(`Glassdoor: Found ${jobs.length} jobs`)
    return jobs
  } catch (error) {
    console.error('Glassdoor search error:', error)
    return jobs
  }
}

/**
 * Clean HTML tags and entities
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

 /**
 * Search all job boards using static GRC taxonomy (broad net approach)
 * Resume is used for SCORING jobs, not generating search queries
 * Runs multiple taxonomy terms per source for maximum coverage
 */
// ================================================================
// PHASE 1: PURE DATA DUMP - Gather massive pool from all sources
export async function gatherAllSecurityJobs(): Promise<{
  rawJobs: Partial<JobPosting>[]
  rawCountsBySource: Record<string, number>
  failedSources: string[]
}> {
  console.warn('🚨 PHASE 1 GATHER: STARTING PURE DATA DUMP FROM ALL SOURCES')
  
  // PREFLIGHT CHECK - Validate all credentials before starting
  console.warn('🔍 PHASE 1 PREFLIGHT: Checking credentials...')
  try {
    const preflightRes = await fetch('/api/preflight')
    const preflight = await preflightRes.json()
    
    if (!preflight.ok) {
      console.error('❌ PREFLIGHT FAILED:', preflight.errors)
      throw new Error(`Preflight failed: ${preflight.errors.join(', ')}`)
    }
    
    console.warn('✅ PREFLIGHT PASSED: All credentials validated')
  } catch (error) {
    console.error('🚨 PREFLIGHT ERROR:', error)
    throw new Error(`Preflight check failed: ${error instanceof Error ? error.message : String(error)}`)
  }
      
  // Add global timeout to prevent emergency timeouts
  const controller = new AbortController()
  const globalTimeoutId = setTimeout(() => {
    controller.abort()
    console.error('🚨 EMERGENCY: Global scan timeout after 5 minutes - aborting!')
  }, 300000) // 5 minute global timeout
      
  try {
    const allRawJobs: Partial<JobPosting>[] = []
    const rawCountsBySource: Record<string, number> = {}
    const failedSources: string[] = []
    
    // TAXONOMY BUNDLES - 5-8 terms per bundle for API efficiency
    const taxonomyBundles = [
      // Bundle 1: GRC Core
      ["GRC Analyst", "GRC Engineer", "Security Compliance", "Compliance Analyst", "Risk Analyst", "Risk Manager"],
          
      // Bundle 2: Audit & Controls  
      ["Security Auditor", "IT Auditor", "Controls Analyst", "SOX", "Internal Controls", "Internal Auditor"],
          
      // Bundle 3: Privacy & Third Party
      ["Privacy Analyst", "Data Privacy", "Third Party Risk", "Vendor Risk", "TPRM", "Vendor Management"],
          
      // Bundle 4: Federal & Regulated
      ["FedRAMP", "RMF", "ATO", "POAM", "ISSO", "ISSE", "NIST 800-53"],
          
      // Bundle 5: General Cyber (high volume)
      ["Cybersecurity Analyst", "Security Analyst", "Security Engineer", "Information Security", "IT Security"],
          
      // Bundle 6: Advanced Cyber
      ["Information Assurance", "Cybersecurity Engineer", "Security Manager", "CISO", "Security Program Manager"]
    ]
  
    console.warn(`📦 TAXONOMY: ${taxonomyBundles.length} bundles, 5-8 terms each`)
    console.warn(`📊 Bundle 1 sample:`, taxonomyBundles[0])
  
    // PHASE 1: Execute all sources in parallel with bundled taxonomy
    console.warn('🚀 PHASE 1: Starting parallel source execution...')
    
    const sourcePromises: Promise<{ source: string; jobs: Partial<JobPosting>[] }>[] = []
  
    // ADZUNA - Pure data dump with bundles
    sourcePromises.push(
      (async () => {
        try {
          console.warn('📡 PHASE 1 ADZUNA: Starting bundled data dump...')
          const { searchAdzunaJobs } = await import('./adzunaAPI')
          const adzunaJobs = await searchAdzunaJobs(taxonomyBundles, 5) // 5 pages per bundle
          console.warn(`✅ PHASE 1 ADZUNA: ${adzunaJobs.length} raw jobs collected`)
          return { source: 'adzuna', jobs: adzunaJobs }
        } catch (error) {
          console.error('❌ PHASE 1 ADZUNA FAILED:', error)
          // Let server-side API routes handle credential errors
          return { source: 'adzuna', jobs: [] }
        }
      })()
    )
  
  // EMAIL ALERTS - Gather from Gmail job alert emails
  sourcePromises.push(
    (async () => {
      try {
        console.warn(' PHASE 1 EMAIL ALERTS: Starting Gmail job extraction...')
        
        const { gatherEmailAlertJobs } = await import('./gmailFetcher')
        const emailJobs = await gatherEmailAlertJobs()
        
        console.warn(` PHASE 1 EMAIL ALERTS: ${emailJobs.length} jobs extracted from Gmail`)
        return { source: 'email', jobs: emailJobs }
      } catch (error) {
        console.error(' PHASE 1 EMAIL ALERTS FAILED:', error)
        
        if (error instanceof Error && error.message.includes('Missing env var')) {
          console.warn(' EMAIL ALERTS: Disabled. Missing Google OAuth credentials')
          console.warn('   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN')
        }
        
        // Don't crash the scan - return empty array
        return { source: 'email', jobs: [] }
      }
    })()
  )
  
  // USAJOBS - Pure data dump (federal source)
  sourcePromises.push(
    (async () => {
      try {
        console.warn(' PHASE 1 USAJOBS: Starting federal data dump...')
        const { searchUSAJobsDataDump } = await import('./usajobsAPI')
        const usajobsResults = await searchUSAJobsDataDump() // No filters for data dump
        console.warn(`✅ PHASE 1 USAJOBS: ${usajobsResults.length} raw jobs collected`)
        return { source: 'usajobs', jobs: usajobsResults }
      } catch (error) {
        console.error('❌ PHASE 1 USAJOBS FAILED:', error)
        // Let server-side API routes handle credential errors
        return { source: 'usajobs', jobs: [] }
      }
    })()
  )
  
  // SERPAPI - Pure data dump with bundled taxonomy
  sourcePromises.push(
    (async () => {
      try {
        console.warn('🔍 PHASE 1 SERPAPI: Starting bundled data dump...')
        
        // Convert taxonomy bundles to simple queries for SerpApi
        const serpQueries = taxonomyBundles.flat().slice(0, 8) // Use first 8 terms
        
        const { searchSerpApiJobs } = await import('./serpapiAPI') // CORRECT: Import from serpapiAPI
        const serpJobs: Partial<JobPosting>[] = []
        for (const query of serpQueries) {
          try {
            console.warn(`📄 SerpApi: Query "${query}"...`)
            const results = await searchSerpApiJobs([query], '', 2) // No location filter
            serpJobs.push(...results)
            console.warn(`✅ SerpApi: ${results.length} jobs for "${query}"`)
          } catch (err) {
            console.warn(`❌ SerpApi query "${query}" failed:`, err)
            // Let server-side API routes handle credential errors
          }
        }
        
        console.warn(`✅ PHASE 1 SERPAPI: ${serpJobs.length} raw jobs collected`)
        return { source: 'serpapi', jobs: serpJobs }
      } catch (error) {
        console.error('❌ PHASE 1 SERPAPI FAILED:', error)
        // Let server-side API routes handle credential errors
        return { source: 'serpapi', jobs: [] }
      }
    })()
  )
  
  // JSEARCH - Pure data dump with bundled taxonomy
  sourcePromises.push(
    (async () => {
      try {
        console.warn('🔍 PHASE 1 JSEARCH: Starting bundled data dump...')
        
        // Convert taxonomy bundles to simple queries for JSearch
        const jsearchQueries = taxonomyBundles.flat().slice(0, 8) // Use first 8 terms
        
        const { searchJSearchJobs } = await import('./jsearchAPI') // CORRECT: Import from jsearchAPI
        const jsearchJobs: Partial<JobPosting>[] = []
        for (const query of jsearchQueries) {
          try {
            console.warn(`📄 JSearch: Query "${query}"...`)
            const results = await searchJSearchJobs([query], '', 2) // No location filter
            jsearchJobs.push(...results)
            console.warn(`✅ JSearch: ${results.length} jobs for "${query}"`)
          } catch (err) {
            console.warn(`❌ JSearch query "${query}" failed:`, err)
            // Let server-side API routes handle credential errors
          }
        }
        
        console.warn(`✅ PHASE 1 JSEARCH: ${jsearchJobs.length} raw jobs collected`)
        return { source: 'jsearch', jobs: jsearchJobs }
      } catch (error) {
        console.error('❌ PHASE 1 JSEARCH FAILED:', error)
        // Let server-side API routes handle credential errors
        return { source: 'jsearch', jobs: [] }
      }
    })()
  )
  
  // Wait for ALL Phase 1 sources to complete
  console.warn('⏳ PHASE 1: Waiting for ALL sources to complete...')
  const sourceResults = await Promise.all(sourcePromises) // All 5 sources: adzuna, email, serpapi, jsearch, usajobs
  
  // Merge all raw results and track failed sources
    for (const result of sourceResults) {
      allRawJobs.push(...result.jobs)
      rawCountsBySource[result.source] = result.jobs.length
      
      // Track sources that returned 0 jobs (treated as failure)
      if (result.jobs.length === 0) {
        failedSources.push(result.source)
        console.warn(`[PHASE 1] ${result.source} returned 0 jobs. Treating as retrieval failure.`)
      }
    }
  
  // DEDUPLICATION (only after gather)
  console.warn(' PHASE 1: Deduplicating raw jobs...')
  const deduplicatedJobs = deduplicateJobs(allRawJobs)
  const duplicateCount = allRawJobs.length - deduplicatedJobs.length
  
  // PHASE 1 COMPLETE - Logging required by contract
  console.warn(' PHASE 1 GATHER: COMPLETE')
  console.warn(' RAW JOB COUNTS BY SOURCE:')
  Object.entries(rawCountsBySource).forEach(([source, count]) => {
    console.warn(`  ${source}: ${count} jobs`)
  })
  console.warn(` TOTAL RAW JOBS: ${allRawJobs.length} (before deduplication)`)
  console.warn(` DEDUPLICATED JOBS: ${deduplicatedJobs.length} (removed ${duplicateCount} duplicates)`)
  
  clearTimeout(globalTimeoutId)
    
    // Show failed sources in UI
    if (failedSources.length > 0) {
      console.warn(`⚠️ PHASE 1 SOURCES WITH ISSUES: ${failedSources.join(', ')}`)
    }
    
    return { rawJobs: deduplicatedJobs, rawCountsBySource, failedSources }
  
  } catch (error) {
    clearTimeout(globalTimeoutId)
    console.error(' PHASE 1 CRITICAL ERROR:', error)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Scan timed out after 5 minutes - try reducing the number of queries or pages')
    }
    throw error
  }
}

// Simple deduplication by title + company + location normalization
function deduplicateJobs(jobs: Partial<JobPosting>[]): Partial<JobPosting>[] {
  const seen = new Set<string>()
  const unique: Partial<JobPosting>[] = []
  
  for (const job of jobs) {
    // Only deduplicate if we have the required fields
    if (!job.title || !job.company) continue
    
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}|${(job.location || '').toLowerCase().trim()}`
    
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(job)
    }
  }
  
  return unique
}

// ================================================================
// PHASE 2: BASIC FILTERS - Location, recency, job type
// ================================================================

export async function applyBasicFilters(
  rawJobs: Partial<JobPosting>[],
  location: string,
  remote: boolean = true
): Promise<Partial<JobPosting>[]> {
  
  console.warn('� PHASE 2 FILTERS: Starting basic filtering...')
  console.warn(`📊 Input: ${rawJobs.length} raw jobs`)
  
  // Location filter (if specified)
  let filteredJobs = rawJobs
  
  if (location && location !== 'Remote') {
    console.warn(`📍 Applying location filter: ${location}`)
    filteredJobs = filteredJobs.filter(job => {
      const jobLocation = (job.location || '').toLowerCase()
      return jobLocation.includes(location.toLowerCase()) || 
             jobLocation.includes('remote') ||
             jobLocation.includes('united states') ||
             jobLocation.includes('us')
    })
  }
  
  // Remote filter
  if (remote) {
    console.warn('🏠 Including remote opportunities...')
    filteredJobs = filteredJobs.filter(job => {
      const jobLocation = (job.location || '').toLowerCase()
      return jobLocation.includes('remote') || 
             !jobLocation.includes('in office') ||
             job.title?.toLowerCase().includes('remote')
    })
  }
  
  // Recency filter (14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  
  console.warn(`📅 Applying recency filter: since ${fourteenDaysAgo.toISOString().split('T')[0]}`)
  filteredJobs = filteredJobs.filter(job => {
    const postedDate = new Date(job.postedDate || '')
    return postedDate >= fourteenDaysAgo || !job.postedDate // Include if no date
  })
  
  // Job type filter (security/GRC related)
  console.warn('🔍 Applying security/GRC keyword filter...')
  const securityKeywords = [
    'security', 'cyber', 'grc', 'compliance', 'risk', 'audit', 
    'governance', 'privacy', 'controls', 'iso', 'nist', 'sox',
    'information security', 'it security', 'cybersecurity'
  ]
  
  filteredJobs = filteredJobs.filter(job => {
    const title = (job.title || '').toLowerCase()
    const description = (job.description || '').toLowerCase()
    
    return securityKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    )
  })
  
  console.warn(`📊 PHASE 2 OUTPUT: ${filteredJobs.length} jobs after filtering`)
  
  return filteredJobs
}

// ================================================================
// BACKWARD COMPATIBILITY - Legacy function wrapper
// ================================================================

/**
 * Legacy wrapper for backward compatibility
 * Uses new Phase 1-4 architecture internally
 */
export async function searchAllJobBoards(
  resumeContent: string,
  location: string,
  options: any = {}
): Promise<Partial<JobPosting>[]> {
  
  // Use new Phase 1-4 architecture
  const { rawJobs, failedSources } = await gatherAllSecurityJobs()
  const filteredJobs = await applyBasicFilters(rawJobs, location, true)
  
  // Show toast for failed sources if any
  if (failedSources.length > 0) {
    console.warn(`⚠️ Some sources had issues: ${failedSources.join(', ')}`)
    // TODO: Add UI toast here
  }
  
  // TODO: Add Phase 3 scoring and Phase 4 verification here if needed
  
  return filteredJobs
}
