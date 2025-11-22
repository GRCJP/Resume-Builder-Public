// Job Scanner - Monitors job boards for matching opportunities

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: 'indeed' | 'linkedin' | 'dice' | 'ziprecruiter' | 'glassdoor' | 'other'
  postedDate: string
  matchScore: number
  salary?: string
  remote?: boolean
  scannedAt: string
}

export interface ScanResult {
  totalFound: number
  highMatches: JobPosting[] // 90%+
  goodMatches: JobPosting[] // 75-89%
  lastScanTime: string
  nextScanTime: string
}

export interface ScanConfig {
  keywords: string[]
  locations: string[]
  remote: boolean
  minMatchScore: number
  sources: string[]
  scanIntervalHours: number
}

/**
 * Default scan configuration for GRC roles
 */
export const defaultScanConfig: ScanConfig = {
  keywords: [
    'GRC Engineer',
    'GRC Analyst',
    'Compliance Engineer',
    'Security Compliance',
    'Risk Management',
    'FedRAMP',
    'NIST',
    'Cybersecurity Compliance'
  ],
  locations: [
    'Washington DC',
    'Remote',
    'Virginia',
    'Maryland'
  ],
  remote: true,
  minMatchScore: 75,
  sources: ['linkedin', 'indeed', 'dice', 'ziprecruiter', 'glassdoor', 'momproject', 'usajobs'],
  scanIntervalHours: 6
}

/**
 * Job board API configurations
 * Note: Most job boards require API keys or have rate limits
 */
export const jobBoardAPIs = {
  indeed: {
    // Indeed doesn't have a public API, would need to use Indeed Publisher API
    // or web scraping (which violates TOS)
    apiUrl: 'https://api.indeed.com/ads/apisearch',
    requiresAuth: true,
    note: 'Requires Indeed Publisher API key'
  },
  linkedin: {
    // LinkedIn requires OAuth and has strict rate limits
    apiUrl: 'https://api.linkedin.com/v2/jobs',
    requiresAuth: true,
    note: 'Requires LinkedIn API access (difficult to obtain)'
  },
  dice: {
    // Dice has a public API
    apiUrl: 'https://api.dice.com/v1/jobs',
    requiresAuth: false,
    note: 'Public API available'
  },
  ziprecruiter: {
    // ZipRecruiter has an API for partners
    apiUrl: 'https://api.ziprecruiter.com/jobs',
    requiresAuth: true,
    note: 'Requires partner API key'
  },
  usajobs: {
    // USAJobs has a public API (great for federal jobs!)
    apiUrl: 'https://data.usajobs.gov/api/search',
    requiresAuth: true,
    note: 'Free API key available - excellent for federal GRC roles'
  }
}

/**
 * Scan job boards for matching positions
 * Note: This is a framework - actual implementation requires API keys
 */
export async function scanJobBoards(
  resumeContent: string,
  config: ScanConfig = defaultScanConfig
): Promise<ScanResult> {
  const results: JobPosting[] = []
  
  // In production, this would call actual APIs
  // For now, this is a framework showing how it would work
  
  console.log('🔍 Scanning job boards...')
  console.log(`Keywords: ${config.keywords.join(', ')}`)
  console.log(`Sources: ${config.sources.join(', ')}`)
  
  // Scan each source
  for (const source of config.sources) {
    try {
      const jobs = await scanSource(source, config)
      
      // Score each job against resume
      for (const job of jobs) {
        if (!job.description || !job.id) continue
        
        const score = await scoreJobMatch(job.description, resumeContent)
        
        if (score >= config.minMatchScore) {
          results.push({
            id: job.id,
            title: job.title || 'Unknown Title',
            company: job.company || 'Unknown Company',
            location: job.location || 'Unknown Location',
            description: job.description,
            url: job.url || '',
            source: (job.source as any) || 'other',
            postedDate: job.postedDate || new Date().toISOString(),
            matchScore: score,
            salary: job.salary,
            remote: job.remote,
            scannedAt: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error(`Error scanning ${source}:`, error)
    }
  }
  
  // Sort by match score
  results.sort((a, b) => b.matchScore - a.matchScore)
  
  const highMatches = results.filter(j => j.matchScore >= 90)
  const goodMatches = results.filter(j => j.matchScore >= 75 && j.matchScore < 90)
  
  const now = new Date()
  const nextScan = new Date(now.getTime() + config.scanIntervalHours * 60 * 60 * 1000)
  
  return {
    totalFound: results.length,
    highMatches,
    goodMatches,
    lastScanTime: now.toISOString(),
    nextScanTime: nextScan.toISOString()
  }
}

/**
 * Scan a specific job source
 */
async function scanSource(source: string, config: ScanConfig): Promise<Partial<JobPosting>[]> {
  console.log(`Scanning ${source}...`)
  
  try {
    // Import job board integrations
    const {
      searchLinkedInJobs,
      searchIndeedJobs,
      searchDiceJobs,
      searchZipRecruiterJobs,
      searchGlassdoorJobs,
      searchMomProjectJobs,
      searchAllJobBoards
    } = await import('./jobBoardIntegrations')
    
    const { searchUSAJobs } = await import('./usajobsAPI')
    
    const location = config.locations[0] || 'Remote'
    
    switch (source.toLowerCase()) {
      case 'linkedin':
        return await searchLinkedInJobs(config.keywords, location)
      
      case 'indeed':
        return await searchIndeedJobs(config.keywords, location)
      
      case 'dice':
        return await searchDiceJobs(config.keywords, location)
      
      case 'ziprecruiter':
        return await searchZipRecruiterJobs(config.keywords, location)
      
      case 'glassdoor':
        return await searchGlassdoorJobs(config.keywords, location)
      
      case 'momproject':
      case 'the mom project':
        return await searchMomProjectJobs(config.keywords)
      
      case 'usajobs':
        const usaJobs = await searchUSAJobs({
          keyword: config.keywords.join(' OR '),
          location,
          remote: config.remote,
          resultsPerPage: 50
        })
        return usaJobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.organization,
          location: job.location,
          description: job.description,
          url: job.url,
          source: 'usajobs' as any,
          postedDate: job.posted,
          salary: `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`,
          remote: job.remote
        }))
      
      case 'all':
        return await searchAllJobBoards(config.keywords, location)
      
      default:
        console.warn(`Unknown source: ${source}`)
        return []
    }
  } catch (error) {
    console.error(`Error scanning ${source}:`, error)
    return []
  }
}

/**
 * Score a job posting against resume
 * Uses the same smart matching algorithm
 */
async function scoreJobMatch(jobDescription: string, resumeContent: string): Promise<number> {
  // Import smart matcher
  const { smartMatch } = await import('./smartMatcher')
  const { validateAgainstIndustryATS } = await import('./atsValidator')
  const { classifyRole, assessRoleMatch } = await import('./roleClassifier')
  
  // Use smart matching
  const matchResult = smartMatch(jobDescription, resumeContent)
  
  // Check role classification
  const roleClass = classifyRole('', jobDescription)
  const roleMatch = assessRoleMatch(roleClass, resumeContent)
  
  // Adjust score for role mismatch
  let score = matchResult.matchScore
  if (roleMatch.shouldApply) {
    score = Math.max(0, score - roleMatch.scorePenalty)
  }
  
  return score
}

/**
 * Save scan results to localStorage
 */
export function saveScanResults(results: ScanResult): void {
  const existing = getScanHistory()
  existing.unshift({
    ...results,
    id: Date.now().toString()
  })
  
  // Keep last 50 scans
  const trimmed = existing.slice(0, 50)
  localStorage.setItem('jobScanHistory', JSON.stringify(trimmed))
}

/**
 * Get scan history
 */
export function getScanHistory(): any[] {
  const stored = localStorage.getItem('jobScanHistory')
  return stored ? JSON.parse(stored) : []
}

/**
 * Get saved jobs (user bookmarked)
 */
export function getSavedJobs(): JobPosting[] {
  const stored = localStorage.getItem('savedJobs')
  return stored ? JSON.parse(stored) : []
}

/**
 * Save a job for later
 */
export function saveJob(job: JobPosting): void {
  const saved = getSavedJobs()
  if (!saved.find(j => j.id === job.id)) {
    saved.push(job)
    localStorage.setItem('savedJobs', JSON.stringify(saved))
  }
}

/**
 * Remove saved job
 */
export function removeSavedJob(jobId: string): void {
  const saved = getSavedJobs()
  const filtered = saved.filter(j => j.id !== jobId)
  localStorage.setItem('savedJobs', JSON.stringify(filtered))
}

/**
 * Check if it's time for next scan
 */
export function shouldScan(config: ScanConfig): boolean {
  const history = getScanHistory()
  if (history.length === 0) return true
  
  const lastScan = new Date(history[0].lastScanTime)
  const now = new Date()
  const hoursSinceLastScan = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60)
  
  return hoursSinceLastScan >= config.scanIntervalHours
}

/**
 * Format job posting for display
 */
export function formatJobPosting(job: JobPosting): string {
  return `
${job.title} at ${job.company}
Location: ${job.location}
Match Score: ${job.matchScore}%
Source: ${job.source}
Posted: ${new Date(job.postedDate).toLocaleDateString()}
${job.salary ? `Salary: ${job.salary}` : ''}
${job.remote ? '🏠 Remote' : ''}

Apply: ${job.url}
  `.trim()
}
