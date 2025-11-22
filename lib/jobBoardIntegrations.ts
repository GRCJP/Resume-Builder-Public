// Multi-Source Job Board Integrations
// Practical implementations for LinkedIn, Indeed, The Mom Project, and others

import { JobPosting } from './jobScanner'

/**
 * LinkedIn Jobs Integration
 * Uses LinkedIn's public job search (no API required)
 */
export async function searchLinkedInJobs(keywords: string[], location: string): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    // LinkedIn allows RSS feeds for job searches
    // Format: https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=GRC&location=Washington%20DC
    
    const keywordString = keywords.join(' OR ')
    const encodedKeywords = encodeURIComponent(keywordString)
    const encodedLocation = encodeURIComponent(location)
    
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedKeywords}&location=${encodedLocation}&f_TPR=r86400&start=0`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('LinkedIn fetch error:', response.status)
      return jobs
    }
    
    const html = await response.text()
    
    // Parse HTML to extract job listings
    const jobMatches = html.matchAll(/<li[^>]*data-occludable-job-id="(\d+)"[^>]*>(.*?)<\/li>/gs)
    
    for (const match of jobMatches) {
      const jobId = match[1]
      const jobHtml = match[2]
      
      // Extract title
      const titleMatch = jobHtml.match(/<h3[^>]*class="base-search-card__title"[^>]*>(.*?)<\/h3>/s)
      const title = titleMatch ? titleMatch[1].trim() : ''
      
      // Extract company
      const companyMatch = jobHtml.match(/<h4[^>]*class="base-search-card__subtitle"[^>]*>(.*?)<\/h4>/s)
      const company = companyMatch ? companyMatch[1].trim() : ''
      
      // Extract location
      const locationMatch = jobHtml.match(/<span[^>]*class="job-search-card__location"[^>]*>(.*?)<\/span>/s)
      const jobLocation = locationMatch ? locationMatch[1].trim() : location
      
      // Extract posted date
      const dateMatch = jobHtml.match(/<time[^>]*datetime="([^"]*)"/)
      const postedDate = dateMatch ? dateMatch[1] : new Date().toISOString()
      
      if (title && company) {
        jobs.push({
          id: `linkedin-${jobId}`,
          title: cleanHtml(title),
          company: cleanHtml(company),
          location: cleanHtml(jobLocation),
          url: `https://www.linkedin.com/jobs/view/${jobId}`,
          source: 'linkedin' as any,
          postedDate,
          description: '' // Will be fetched separately if needed
        })
      }
    }
    
    console.log(`LinkedIn: Found ${jobs.length} jobs`)
    return jobs
  } catch (error) {
    console.error('LinkedIn search error:', error)
    return jobs
  }
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
 * Indeed Jobs Integration
 * Uses Indeed's public job search
 */
export async function searchIndeedJobs(keywords: string[], location: string): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    // Indeed allows direct search URLs
    const keywordString = keywords.join(' ')
    const encodedKeywords = encodeURIComponent(keywordString)
    const encodedLocation = encodeURIComponent(location)
    
    const url = `https://www.indeed.com/jobs?q=${encodedKeywords}&l=${encodedLocation}&fromage=1&sort=date`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('Indeed fetch error:', response.status)
      return jobs
    }
    
    const html = await response.text()
    
    // Parse job cards
    const jobMatches = html.matchAll(/<div[^>]*class="job_seen_beacon"[^>]*>(.*?)<\/div>/gs)
    
    for (const match of jobMatches) {
      const jobHtml = match[1]
      
      // Extract job key
      const keyMatch = jobHtml.match(/data-jk="([^"]*)"/)
      const jobKey = keyMatch ? keyMatch[1] : ''
      
      // Extract title
      const titleMatch = jobHtml.match(/<h2[^>]*class="jobTitle"[^>]*>.*?<span[^>]*title="([^"]*)"/)
      const title = titleMatch ? titleMatch[1] : ''
      
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
        jobs.push({
          id: `indeed-${jobKey}`,
          title,
          company,
          location: jobLocation,
          url: `https://www.indeed.com/viewjob?jk=${jobKey}`,
          source: 'indeed' as any,
          postedDate: new Date().toISOString(),
          salary,
          description: '' // Will be fetched separately if needed
        })
      }
    }
    
    console.log(`Indeed: Found ${jobs.length} jobs`)
    return jobs
  } catch (error) {
    console.error('Indeed search error:', error)
    return jobs
  }
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
 * Search all job boards
 */
export async function searchAllJobBoards(
  keywords: string[],
  location: string
): Promise<Partial<JobPosting>[]> {
  console.log('🔍 Searching all job boards...')
  
  const results = await Promise.allSettled([
    searchLinkedInJobs(keywords, location),
    searchIndeedJobs(keywords, location),
    searchDiceJobs(keywords, location),
    searchZipRecruiterJobs(keywords, location),
    searchGlassdoorJobs(keywords, location),
    searchMomProjectJobs(keywords)
  ])
  
  const allJobs: Partial<JobPosting>[] = []
  
  results.forEach((result, index) => {
    const sources = ['LinkedIn', 'Indeed', 'Dice', 'ZipRecruiter', 'Glassdoor', 'Mom Project']
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value)
      console.log(`✅ ${sources[index]}: ${result.value.length} jobs`)
    } else {
      console.error(`❌ ${sources[index]} failed:`, result.reason)
    }
  })
  
  // Remove duplicates based on title + company
  const uniqueJobs = Array.from(
    new Map(
      allJobs.map(job => [`${job.title}-${job.company}`, job])
    ).values()
  )
  
  console.log(`📊 Total unique jobs found: ${uniqueJobs.length}`)
  return uniqueJobs
}
