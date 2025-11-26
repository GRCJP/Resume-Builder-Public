// Job Scanner - Monitors job boards for matching opportunities

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: 'indeed' | 'linkedin' | 'dice' | 'ziprecruiter' | 'glassdoor' | 'other' | 'curated' | 'adzuna' | 'serpapi' | 'usajobs' | 'emailAlerts' | 'jsearch' | 'linkedin-email' | 'indeed-email' | 'lensa-email'
  postedDate: string
  matchScore: number
  salary?: string
  remote?: boolean
  scannedAt: string
  linkStatus?: number
  verifiedAt?: string
  applyUrl?: string
  requiresLogin?: boolean
}

export interface ScanResult {
  totalFound: number
  highMatches: Partial<JobPosting>[] // 90%+
  goodMatches: Partial<JobPosting>[] // 75-89%
  fairMatches: Partial<JobPosting>[] // 50-74%
  lastScanTime: string
  nextScanTime: string
  pipelineStats?: {
    phase1Raw: number
    phase2Filtered: number
    phase3Scored: number
    phase4Verified: number
    phase5Final: number
    sourceBreakdown: Record<string, number>
    scoreDistribution: Record<string, number>
  }
}

export interface ScanConfig {
  keywords: string[]
  locations: string[]
  remote: boolean
  minMatchScore: number
  sources: string[]
  scanIntervalHours: number
  mockMode?: boolean // Optional mock mode for testing
  // API configuration options
  linkedinPages?: number
  indeedPages?: number
  maxQueriesPerSource?: number
  includeAdzuna?: boolean
  includeSerpApi?: boolean
  includeJSearch?: boolean
  includeUSAJobs?: boolean
  includeEmailAlerts?: boolean
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
  sources: ['linkedin', 'indeed', 'dice', 'ziprecruiter', 'glassdoor', 'momproject', 'usajobs', 'emailAlerts'],
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
 * Scan job boards for GRC positions based on industry job titles (not resume)
 * This searches for common GRC cybersecurity roles first, then scores results
 */
export async function scanGRCJobsByTitles(location: string, config: Partial<ScanConfig> = {}): Promise<ScanResult> {
  const { minMatchScore = 50 } = config
  
  console.log('🚀 Starting GRC title-based job scan...')
  console.log(`📍 Location: ${location}`)
  console.log(`📝 Using GRC industry job titles (no resume required)`)
  
  // GRC industry job titles to search for
  const grcJobTitles = [
    // Vulnerability Management
    'vulnerability management analyst',
    'vulnerability assessment specialist', 
    'penetration testing engineer',
    'security analyst',
    
    // Risk Management & Assessment
    'risk assessment specialist',
    'risk management analyst',
    'cyber risk analyst',
    'information risk manager',
    
    // Compliance & Governance
    'compliance analyst',
    'governance risk compliance analyst',
    'grc analyst',
    'security compliance manager',
    'iso 27001 specialist',
    'soc 2 compliance analyst',
    
    // Audit & Assessment
    'information security auditor',
    'it auditor',
    'cybersecurity auditor',
    'security assessor',
    
    // Control & Framework
    'security controls analyst',
    'control testing specialist',
    'framework specialist',
    'nist specialist',
    
    // Senior Roles
    'senior grc analyst',
    'lead security analyst',
    'cybersecurity manager',
    'information security manager'
  ]
  
  try {
    console.log(`🔍 Searching ${grcJobTitles.length} GRC job titles across job boards...`)
    
    // Import job board integrations
    const { searchAdzunaJobs } = await import('./adzunaAPI')
    const { searchJSearchJobs } = await import('./jsearchAPI') 
    const { searchSerpApiJobs } = await import('./serpapiJobs')
    
    let allJobs: Partial<JobPosting>[] = []
    let highMatches: Partial<JobPosting>[] = []
    let goodMatches: Partial<JobPosting>[] = []
    let fairMatches: Partial<JobPosting>[] = []
    
    // Scan Adzuna
    if (config.includeAdzuna !== false) {
      console.log('📊 Scanning Adzuna for GRC titles...')
      try {
        // Adzuna expects queryBundles (array of arrays)
        const queryBundles = [
          grcJobTitles.slice(0, 5),   // First 5 titles
          grcJobTitles.slice(5, 10),  // Next 5 titles
        ]
        const adzunaJobs = await searchAdzunaJobs(queryBundles, 3) // 3 pages per bundle
        allJobs.push(...adzunaJobs)
        console.log(`✅ Adzuna found ${adzunaJobs.length} GRC jobs`)
      } catch (error) {
        console.warn('⚠️ Adzuna scan failed:', error)
      }
    }
    
    // Scan JSearch
    if (config.includeJSearch !== false) {
      console.log('📊 Scanning JSearch for GRC titles...')
      try {
        // Check JSearch function signature
        const jsearchJobs = await searchJSearchJobs(grcJobTitles.slice(5, 10), 'Remote', 20)
        allJobs.push(...jsearchJobs)
        console.log(`✅ JSearch found ${jsearchJobs.length} GRC jobs`)
      } catch (error) {
        console.warn('⚠️ JSearch scan failed:', error)
      }
    }
    
    // Scan SerpApi
    if (config.includeSerpApi !== false) {
      console.log('📊 Scanning SerpApi for GRC titles...')
      try {
        // Check SerpApi function signature
        const serpApiJobs = await searchSerpApiJobs(grcJobTitles.slice(10, 15), 'Remote', 20)
        allJobs.push(...serpApiJobs)
        console.log(`✅ SerpApi found ${serpApiJobs.length} GRC jobs`)
      } catch (error) {
        console.warn('⚠️ SerpApi scan failed:', error)
      }
    }
    
    // Remove duplicates and score jobs
    console.log(`🔄 Processing ${allJobs.length} total GRC jobs...`)
    
    // Simple scoring based on title relevance (can be enhanced later)
    allJobs.forEach(job => {
      const title = job.title?.toLowerCase() || ''
      let score = 50 // Base score
      
      // Higher scores for senior roles
      if (title.includes('senior') || title.includes('lead') || title.includes('manager')) {
        score += 20
      }
      
      // Higher scores for specific GRC keywords
      if (title.includes('grc') || title.includes('governance') || title.includes('compliance')) {
        score += 15
      }
      
      if (title.includes('vulnerability') || title.includes('risk') || title.includes('assessment')) {
        score += 10
      }
      
      if (title.includes('iso') || title.includes('soc') || title.includes('nist')) {
        score += 10
      }
      
      // Assign score and categorize
      job.matchScore = Math.min(score, 100)
      
      if (job.matchScore >= 85) {
        highMatches.push(job)
      } else if (job.matchScore >= 70) {
        goodMatches.push(job)
      } else {
        fairMatches.push(job)
      }
    })
    
    console.log(`✅ GRC title-based scan completed!`)
    console.log(`📊 Results: ${highMatches.length} high, ${goodMatches.length} good, ${fairMatches.length} fair matches`)
    
    return {
      totalFound: allJobs.length,
      highMatches,
      goodMatches,
      fairMatches,
      lastScanTime: new Date().toISOString(),
      nextScanTime: new Date(Date.now() + (config.scanIntervalHours || 24) * 60 * 60 * 1000).toISOString()
    }
    
  } catch (error) {
    console.error('❌ GRC title-based scan failed:', error)
    return {
      totalFound: 0,
      highMatches: [],
      goodMatches: [],
      fairMatches: [],
      lastScanTime: new Date().toISOString(),
      nextScanTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }
}

/**
 * Scan job boards for matching positions
 * Note: This is a framework - actual implementation requires API keys
 */
export async function scanJobBoards(resumeContent: string, location: string, config: Partial<ScanConfig> = {}): Promise<ScanResult> {
  const { minMatchScore = 50 } = config
  
  console.log('🚀 Starting job board scan with clean pipeline...')
  console.log(`📍 Location: ${location}`)
  console.log(`📝 Resume content length: ${resumeContent.length} characters`)
  
  try {
    // Use the new clean pipeline
    const { cleanJobScanPipeline } = await import('./cleanPipeline')
    const pipelineResults = await cleanJobScanPipeline(resumeContent, location)
    
    console.log('✅ Clean pipeline completed successfully')
    console.log(`📊 Pipeline stats:`, pipelineResults.pipelineStats)
    
    // Return results in the expected ScanResult format
    return {
      totalFound: pipelineResults.allJobs.length,
      highMatches: pipelineResults.highMatches,
      goodMatches: pipelineResults.goodMatches,
      fairMatches: pipelineResults.fairMatches,
      lastScanTime: new Date().toISOString(),
      nextScanTime: new Date(Date.now() + (config.scanIntervalHours || 24) * 60 * 60 * 1000).toISOString(),
      pipelineStats: pipelineResults.pipelineStats // Add pipeline stats for debugging
    }
    
  } catch (error) {
    console.error('❌ Clean pipeline failed:', error)
    
    // Fallback to old method if pipeline fails
    console.log('🔄 Falling back to legacy scan method...')
    return await legacyScanJobBoards(resumeContent, location, config)
  }
}

/**
 * Legacy scan method (fallback)
 */
async function legacyScanJobBoards(resumeContent: string, location: string, config: Partial<ScanConfig> = {}): Promise<ScanResult> {
  const { minMatchScore = 50 } = config
  
  console.log('🔍 Starting job board scan...')
  console.log(`📝 Resume content length: ${resumeContent.length}`)
  console.log(`📍 Location: ${location}`)
  console.log(`📊 Full config:`, config)
  
  // MOCK MODE: Return realistic mock data immediately
  if (config.mockMode) {
    console.log('🎭 MOCK MODE: Returning realistic mock scan results')
    
    const mockJobs = [
      {
        id: 'mock-1',
        title: 'Senior GRC Analyst',
        company: 'Defense Information Systems Agency',
        location: 'Washington DC',
        url: 'https://www.usajobs.gov/job/12345',
        source: 'other' as const, // Use valid JobPosting source type
        description: 'Senior GRC Analyst position responsible for compliance management and risk assessment...',
        postedDate: new Date().toISOString(),
        matchScore: 95,
        scannedAt: new Date().toISOString()
      },
      {
        id: 'mock-2', 
        title: 'Cybersecurity Compliance Manager',
        company: 'Booz Allen Hamilton',
        location: 'Remote',
        url: 'https://boozallen.com/careers/67890',
        source: 'other' as const, // Use valid JobPosting source type
        description: 'Leading cybersecurity compliance initiatives for federal clients...',
        postedDate: new Date().toISOString(),
        matchScore: 88,
        scannedAt: new Date().toISOString()
      },
      {
        id: 'mock-3',
        title: 'FedRAMP Compliance Engineer',
        company: 'Accenture Federal Services',
        location: 'Arlington, VA',
        url: 'https://accenture.com/federal/careers/11111',
        source: 'other' as const, // Use valid JobPosting source type
        description: 'FedRAMP compliance engineering role working with cloud security frameworks...',
        postedDate: new Date().toISOString(),
        matchScore: 82,
        scannedAt: new Date().toISOString()
      }
    ]
    
    // Score and categorize mock jobs
    const highMatches = mockJobs.filter(job => job.matchScore >= 90)
    const goodMatches = mockJobs.filter(job => job.matchScore >= 75 && job.matchScore < 90)
    const fairMatches = mockJobs.filter(job => job.matchScore >= (config.minMatchScore || 50) && job.matchScore < 75)
    
    return {
      totalFound: mockJobs.length,
      highMatches,
      goodMatches,
      fairMatches,
      lastScanTime: new Date().toISOString(),
      nextScanTime: new Date(Date.now() + (config.scanIntervalHours || 24) * 60 * 60 * 1000).toISOString()
    }
  }
    
  // Normal API flow (when not in mock mode)
  const { searchAllJobBoards } = await import('./jobBoardIntegrations')
  const { smartMatch } = await import('./smartMatcher')
  
  const jobs = await searchAllJobBoards(resumeContent, location || 'Remote', {
    linkedinPages: 6,        // Increased from 2
    indeedPages: 6,         // Increased from 2  
    includeUSAJobs: true,
    maxQueriesPerSource: 8,  // Balanced for speed and coverage
    includeAdzuna: true,      // ENABLED - working in email pipeline
    includeSerpApi: true,     // ENABLED - confirmed functional
    includeJSearch: true,       // ENABLED - working again
    includeEmailAlerts: true  // ENABLED - email job fetching
  })
  
  console.log(`✅ Job board search completed: ${jobs.length} raw jobs collected`)
  
  // Fetch jobs from email alerts (Lensa, LinkedIn, Indeed, etc.) - ENABLED
  let emailJobs: any[] = []
  console.log('📧 Fetching jobs from email alerts...')
  
  try {
    console.log('📧 Connecting to Gmail to fetch job alert emails...')
    const { gmailFetcher } = await import('./gmailFetcher')
    
    // Note: This will require OAuth2 setup to work properly
    // For now, we'll try to fetch but handle gracefully if not configured
    emailJobs = await gmailFetcher.extractJobsFromEmails(7) // Last 7 days
    console.log(`✅ Email job fetch completed: ${emailJobs.length} jobs from emails`)
  } catch (emailError) {
    console.log('⚠️ Email job fetch failed (this is expected if Gmail OAuth not configured):', emailError)
    console.log('💡 To enable email job fetching, set up Gmail OAuth2 credentials')
    // Continue without email jobs - this is optional
  }
  
  // Combine API jobs and email jobs
  const allJobs = [...jobs, ...emailJobs]
  console.log(`📊 Total jobs collected: ${allJobs.length} (${jobs.length} from APIs + ${emailJobs.length} from emails)`)
  
  // TRUTH TEST: Check if jobs have real descriptions before scoring
  console.log(
    "🔍 JOB SAMPLE BEFORE SCORING:",
    allJobs.slice(0, 3).map((j: any) => ({
      title: j.title,
      source: j.source,
      url: j.url,
      descLen: j.description?.length || 0,
      verifiedAt: j.verifiedAt,
      linkStatus: j.linkStatus
    }))
  )
  
  console.log('🎯 Starting job scoring...')
  
  // Import and score jobs (only after description enrichment)
  const scoredJobs = allJobs.map((job: any) => {
    const matchResult = smartMatch(job.description || '', resumeContent)
    
    // Log scoring comparison for USAJobs
    if (job.source === 'other' && job.url?.includes('usajobs.gov')) {
      console.log(`🔍 USAJobs Scoring Comparison: ${job.title}`)
      console.log(`  - Search Score: ${job.matchScore || 'N/A'}%`)
      console.log(`  - ATS Score: ${matchResult.matchScore}%`)
      console.log(`  - Description Length: ${job.description?.length || 0} chars`)
      console.log(`  - Found Keywords: ${matchResult.foundKeywords.length}`)
      console.log(`  - Missing Keywords: ${matchResult.missingKeywords.length}`)
    }
    
    return {
      id: job.id || `job-${Date.now()}-${Math.random()}`,
      title: job.title || 'Unknown Title',
      company: job.company || 'Unknown Company',
      location: job.location || 'Unknown Location',
      description: job.description || '',
      url: job.url || '',
      source: job.source || 'other',
      postedDate: job.postedDate || new Date().toISOString(),
      matchScore: matchResult.matchScore,
      matchReasons: matchResult.foundKeywords,
      salary: job.salary,
      remote: job.remote,
      scannedAt: new Date().toISOString()
    }
  })
  
  console.log(`✅ Job scoring completed: ${scoredJobs.length} jobs scored`)
  
  // DEBUG: Track source breakdown after scoring
  const sourcesAfterScoring = scoredJobs.reduce((acc: Record<string, number>, job: any) => {
    acc[job.source] = (acc[job.source] || 0) + 1
    return acc
  }, {})
  console.log(`📊 Source breakdown after scoring:`, sourcesAfterScoring)
  
  // Filter by score bands and minimum relevance
  const highMatches = scoredJobs.filter((job: any) => (job.matchScore ?? 0) >= 90)
  const goodMatches = scoredJobs.filter((job: any) => (job.matchScore ?? 0) >= 75 && (job.matchScore ?? 0) < 90)
  const fairMatches = scoredJobs.filter((job: any) => (job.matchScore ?? 0) >= 30 && (job.matchScore ?? 0) < 75) // Increased from config.minMatchScore
  
  // DEBUG: Track source breakdown in each bucket
  const highSources = highMatches.reduce((acc: Record<string, number>, job: any) => {
    acc[job.source] = (acc[job.source] || 0) + 1
    return acc
  }, {})
  const goodSources = goodMatches.reduce((acc: Record<string, number>, job: any) => {
    acc[job.source] = (acc[job.source] || 0) + 1
    return acc
  }, {})
  const fairSources = fairMatches.reduce((acc: Record<string, number>, job: any) => {
    acc[job.source] = (acc[job.source] || 0) + 1
    return acc
  }, {})
  
  console.log(`📊 HIGH MATCHES (90%+): ${highMatches.length} jobs`, highSources)
  console.log(`📊 GOOD MATCHES (75-89%): ${goodMatches.length} jobs`, goodSources)
  console.log(`📊 FAIR MATCHES (30-74%): ${fairMatches.length} jobs`, fairSources)
  
  // Filter out completely irrelevant jobs (score < 30)
  const irrelevantJobs = scoredJobs.filter((job: any) => (job.matchScore ?? 0) < 30)
  
  console.log('📊 Score distribution:', {
    total: scoredJobs.length,
    high: highMatches.length,
    good: goodMatches.length,
    fair: fairMatches.length,
    irrelevant: irrelevantJobs.length,
    threshold: 30
  })
  
  if (irrelevantJobs.length > 0) {
    console.log(`❌ Filtered out ${irrelevantJobs.length} irrelevant jobs (score < 30):`)
    console.log(`  Sample irrelevant jobs:`, irrelevantJobs.slice(0, 3).map(j => ({
      title: j.title,
      company: j.company,
      score: j.matchScore
    })))
  }
  
  // EMAIL ALERTS: Send email if high matches found and email configured
  if ((highMatches.length > 0 || goodMatches.length > 0) && process.env.JOBS_EMAIL_USER) {
    try {
      const emailJobs = [...highMatches, ...goodMatches]
      const emailResponse = await fetch('/api/email-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobs: emailJobs,
          subject: `🎯 ${emailJobs.length} New Job Matches Found - ${new Date().toLocaleDateString()}`
        })
      })
      
      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('✅ Email alerts sent successfully:', emailResult.messageId)
      } else {
        const error = await emailResponse.text()
        console.error('❌ Email alerts failed:', error)
      }
    } catch (emailError) {
      console.error('❌ Email alert error:', emailError)
    }
  } else {
    if (!process.env.JOBS_EMAIL_USER) {
      console.log('📧 Email alerts not configured (set JOBS_EMAIL_USER environment variable)')
    } else {
      console.log('📧 No high-quality matches for email alerts')
    }
  }
  
  const result: ScanResult = {
    totalFound: scoredJobs.length,
    highMatches,
    goodMatches,
    fairMatches,
    lastScanTime: new Date().toISOString(),
    nextScanTime: new Date(Date.now() + (config.scanIntervalHours || 24) * 60 * 60 * 1000).toISOString()
  }
  
  console.log('✅ Job scan completed successfully')
  return result
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
    // Keep keywords as array for function calls that expect array
    
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
          keyword: config.keywords.join(' OR '), // USAJobs expects string
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
          source: 'other' as const, // Use valid JobPosting source type
          postedDate: job.posted,
          matchScore: 0,
          scannedAt: new Date().toISOString()
        }))
      
      case 'all':
        return await searchAllJobBoards(config.keywords.join(' OR '), location, {})
      
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
