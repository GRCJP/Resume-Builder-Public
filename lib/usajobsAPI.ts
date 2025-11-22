// USAJobs API Integration - Free federal job board API

export interface USAJobsSearchParams {
  keyword?: string
  location?: string
  remote?: boolean
  page?: number
  resultsPerPage?: number
}

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
 * Search USAJobs API
 * API Documentation: https://developer.usajobs.gov/API-Reference/GET-api-Search
 */
export async function searchUSAJobs(params: USAJobsSearchParams): Promise<USAJob[]> {
  const apiKey = process.env.NEXT_PUBLIC_USAJOBS_API_KEY || process.env.USAJOBS_API_KEY
  const email = process.env.NEXT_PUBLIC_USAJOBS_EMAIL || process.env.USAJOBS_EMAIL
  
  if (!apiKey || !email) {
    console.warn('USAJobs API credentials not configured')
    return []
  }
  
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()
    
    if (params.keyword) {
      queryParams.append('Keyword', params.keyword)
    }
    
    if (params.location) {
      queryParams.append('LocationName', params.location)
    }
    
    if (params.remote) {
      queryParams.append('RemoteIndicator', 'true')
    }
    
    queryParams.append('ResultsPerPage', (params.resultsPerPage || 50).toString())
    queryParams.append('Page', (params.page || 1).toString())
    
    // Make API request
    const response = await fetch(
      `https://data.usajobs.gov/api/search?${queryParams.toString()}`,
      {
        headers: {
          'Host': 'data.usajobs.gov',
          'User-Agent': email,
          'Authorization-Key': apiKey
        }
      }
    )
    
    if (!response.ok) {
      console.error('USAJobs API error:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    
    // Parse results
    const jobs: USAJob[] = (data.SearchResult?.SearchResultItems || []).map((item: any) => {
      const job = item.MatchedObjectDescriptor
      
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
    })
    
    return jobs
  } catch (error) {
    console.error('Error fetching USAJobs:', error)
    return []
  }
}

/**
 * Search for GRC-specific federal jobs
 */
export async function searchFederalGRCJobs(): Promise<USAJob[]> {
  const keywords = [
    'GRC',
    'Governance Risk Compliance',
    'FedRAMP',
    'NIST',
    'Cybersecurity Compliance',
    'Information System Security Officer',
    'ISSO',
    'Security Controls'
  ]
  
  const allJobs: USAJob[] = []
  
  // Search for each keyword
  for (const keyword of keywords) {
    const jobs = await searchUSAJobs({
      keyword,
      location: 'Washington, DC',
      remote: true,
      resultsPerPage: 25
    })
    
    allJobs.push(...jobs)
  }
  
  // Remove duplicates
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.id, job])).values()
  )
  
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
