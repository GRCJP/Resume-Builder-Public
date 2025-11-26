// USAJobs API Integration - Free federal job board API

export interface USAJobsSearchParams {
  keyword?: string
  location?: string
  remote?: boolean
  page?: number
  resultsPerPage?: number
}

import type { JobPosting } from "./jobScanner"

export interface USAJob {
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

/**
 * Search USAJobs API via server route to avoid CORS issues
 */
export async function searchUSAJobs(params: USAJobsSearchParams, options?: { signal?: AbortSignal }): Promise<USAJob[]> {
  try {
    const qs = new URLSearchParams({
      keyword: params.keyword || "cybersecurity",
      location: params.location || "Remote",
      page: params.page?.toString() || "1"
    })

    console.log(`🔍 USAJobs API Request: /api/usajobs?${qs.toString()}`)

    const res = await fetch(`/api/usajobs?${qs.toString()}`, options)
    
    console.log(`📊 USAJobs RESPONSE: Status ${res.status} ${res.statusText}`)
    
    if (!res.ok) {
      console.error(`❌ USAJobs server route error: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    
    if (data.error) {
      console.error(`❌ USAJobs API error: ${data.error}`)
      return []
    }

    const jobs = data.SearchResult?.SearchResultItems || []
    console.log(`✅ USAJobs: Found ${jobs.length} jobs`)
    
    return jobs.map((item: any) => {
      // Extract comprehensive job description including Duties
      const jobSummary = item.MatchedObjectDescriptor.UserArea?.Details?.JobSummary || ""
      const duties = item.MatchedObjectDescriptor.UserArea?.Details?.Duties || ""
      const qualifications = item.MatchedObjectDescriptor.UserArea?.Details?.Qualifications || ""
      
      // Combine all relevant content for better ATS matching
      const fullDescription = [
        jobSummary,
        duties ? `\n\nDuties:\n${duties}` : "",
        qualifications ? `\n\nQualifications:\n${qualifications}` : ""
      ].filter(Boolean).join("")
      
      // Log description length for debugging
      console.log(`📋 USAJob Description: ${item.MatchedObjectDescriptor.PositionTitle}`)
      console.log(`  - JobSummary: ${jobSummary.length} chars`)
      console.log(`  - Duties: ${duties.length} chars`)
      console.log(`  - Full Description: ${fullDescription.length} chars`)
      
      return {
        id: item.MatchedObjectId,
        title: item.MatchedObjectDescriptor.PositionTitle,
        organization: item.MatchedObjectDescriptor.OrganizationName,
        location: item.MatchedObjectDescriptor.PositionLocation?.[0]?.LocationName || "Remote",
        description: fullDescription || jobSummary, // Fallback to JobSummary if nothing else
        url: item.MatchedObjectDescriptor.PositionURI || "",
        salary: {
          min: item.MatchedObjectDescriptor.PositionRemuneration?.[0]?.MinimumRange || 0,
          max: item.MatchedObjectDescriptor.PositionRemuneration?.[0]?.MaximumRange || 0
        },
        posted: item.MatchedObjectDescriptor.PublicationStartDate || new Date().toISOString(),
        closes: item.MatchedObjectDescriptor.ApplicationCloseDate || "",
        clearance: item.MatchedObjectDescriptor.UserArea?.Details?.SecurityClearanceRequired || "",
        remote: item.MatchedObjectDescriptor.PositionLocation?.some((loc: any) => 
          loc.LocationName?.toLowerCase().includes('remote')
        ) || false
      }
    })
  } catch (error) {
    console.error('❌ USAJobs search error:', error)
    return []
  }
}

/**
 * PHASE 1: PURE DATA DUMP - Maximum federal jobs, no filters
 */
export async function searchUSAJobsDataDump(): Promise<Partial<JobPosting>[]> {
  console.warn('🚨 PHASE 1 USAJOBS: Starting pure federal data dump - no filters')
  
  // Broad federal keywords for maximum coverage
  const federalKeywords = [
    'cybersecurity',
    'security', 
    'information security',
    'risk management',
    'compliance',
    'audit',
    'governance',
    'grc',
    'privacy',
    'controls',
    'information technology',
    'it'
  ]
  
  // Major federal hubs + no location filter
  const locations = ['Washington DC', 'Remote', '']
  const allJobs: USAJob[] = []
  
  for (const keyword of federalKeywords) {
    for (const location of locations) {
      try {
        console.warn(`📄 USAJobs Data Dump: "${keyword}" in "${location || 'ALL LOCATIONS'}"`)
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        
        const jobs = await searchUSAJobs({ 
          keyword, 
          location: location || undefined,
          page: 1
        }, { signal: controller.signal })
        
        clearTimeout(timeoutId)
        
        if (jobs.length > 0) {
          console.warn(`✅ USAJobs Data Dump: ${jobs.length} jobs for "${keyword}"`)
          allJobs.push(...jobs)
        }
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 300))
        
      } catch (error) {
        console.warn(`❌ USAJobs Data Dump failed for "${keyword}":`, error)
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('⏰ USAJobs request timed out after 15 seconds')
        }
      }
    }
  }
  
  console.warn(`🚨 PHASE 1 USAJOBS COMPLETE: ${allJobs.length} federal jobs collected`)
  
  // Convert USAJob[] to Partial<JobPosting>[]
  return allJobs.map((job: USAJob) => ({
    id: `usajobs-${job.id}`,
    title: job.title,
    company: job.organization,
    location: job.location,
    description: job.description,
    url: job.url,
    source: 'usajobs',
    postedDate: job.posted,
    matchScore: 0,
    salary: job.salary ? `${job.salary.min}-${job.salary.max}` : undefined,
    remote: job.remote,
    scannedAt: new Date().toISOString()
  }))
}

/**
 * Search for GRC-specific federal jobs with better keywords
 */
export async function searchFederalGRCJobs(): Promise<USAJob[]> {
  const keywords = [
    'cybersecurity',
    'information security',
    'risk management framework',
    'RMF',
    'FedRAMP',
    'NIST',
    'ISSO',
    'security compliance',
    'information assurance',
    'security analyst'
  ]

  const allJobs: USAJob[] = []
  
  // Try major federal employment hubs (reduced for speed)
  const locations = ['Washington DC', 'Remote'] // Reduced from 5 to 2 locations
  
  for (const keyword of keywords) {
    for (const location of locations) {
      try {
        console.log(`🔍 USAJobs: Searching "${keyword}" in "${location}"`)
        const jobs = await searchUSAJobs({ 
          keyword, 
          location,
          resultsPerPage: 10
        })
        allJobs.push(...jobs)
        
        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // If we found jobs in this location, move to next keyword
        if (jobs.length > 0) break
      } catch (error) {
        console.error(`❌ USAJobs search failed for "${keyword}" in "${location}":`, error)
      }
    }
  }

  // Remove duplicates based on ID
  const uniqueJobs = allJobs.filter((job, index, arr) => 
    arr.findIndex(j => j.id === job.id) === index
  )

  console.log(`✅ USAJobs: Found ${uniqueJobs.length} unique federal GRC jobs`)
  return uniqueJobs
}

/**
 * Get job details by ID
 */
export async function getUSAJobDetails(jobId: string): Promise<USAJob | null> {
  const apiKey = process.env.NEXT_PUBLIC_USAJOBS_API_KEY || process.env.USAJOBS_API_KEY
  const email = process.env.NEXT_PUBLIC_USAJOBS_EMAIL || process.env.USAJOBS_EMAIL
  
  if (!apiKey || !email) {
    console.warn('USAJobs API credentials not configured')
    return null
  }
  
  try {
    const response = await fetch(
      `https://data.usajobs.gov/api/search?PositionID=${jobId}`,
      {
        headers: {
          'Host': 'data.usajobs.gov',
          'User-Agent': email,
          'Authorization-Key': apiKey
        }
      }
    )
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    const items = data.SearchResult?.SearchResultItems || []
    
    if (items.length === 0) {
      return null
    }
    
    const job = items[0].MatchedObjectDescriptor
    
    return {
      id: job.PositionID,
      title: job.PositionTitle,
      organization: job.OrganizationName,
      location: job.PositionLocationDisplay,
      description: job.UserArea?.Details?.JobSummary || job.QualificationSummary || '',
      url: job.PositionURI,
      salary: {
        min: job.PositionRemuneration?.[0]?.MinimumRange || 0,
        max: job.PositionRemuneration?.[0]?.MaximumRange || 0
      },
      posted: job.PublicationStartDate,
      closes: job.ApplicationCloseDate,
      clearance: job.SecurityClearance || undefined,
      remote: job.PositionOfferingType?.some((t: any) => 
        t.Name === 'Telework' || t.Name === 'Remote'
      ) || false
    }
  } catch (error) {
    console.error('Error fetching job details:', error)
    return null
  }
}

/**
 * Format salary range
 */
export function formatSalary(min: number, max: number): string {
  if (min === 0 && max === 0) return 'Not specified'
  
  const formatNum = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }
  
  if (min === max) return formatNum(min)
  return `${formatNum(min)} - ${formatNum(max)}`
}

/**
 * Check if API is configured
 */
export function isUSAJobsConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_USAJOBS_API_KEY || process.env.USAJOBS_API_KEY
  const email = process.env.NEXT_PUBLIC_USAJOBS_EMAIL || process.env.USAJOBS_EMAIL
  return !!(apiKey && email)
}
