# GRC Resume Builder - Job Search Pipeline Bundle

## 1. Core Pipeline Code

### Main Entry Point - JobDiscoveryDashboard.tsx (excerpt)
```typescript
// Main search orchestration function
const handleSearch = async (source: JobSource) => {
  setIsScanning(true)
  setStatusMessage('🔍 Searching for jobs...')
  
  try {
    let foundJobs: Partial<JobPosting>[] = []
    
    // Generate search queries based on resume
    const searchQueries = generateSearchQueries(resumeContent)
    console.log('🔍 Search queries:', searchQueries)
    
    // Call source adapters
    switch (source) {
      case 'all':
        // Multi-source search with fallback
        foundJobs = await searchAllJobBoards(['GRC', 'Compliance'], 'Remote')
        break
      case 'linkedin':
        foundJobs = await searchLinkedInJobs(['GRC', 'Compliance'], 'Remote')
        break
      case 'indeed':
        foundJobs = await searchIndeedJobs(['GRC', 'Compliance'], 'Remote')
        break
      // ... other sources
    }
    
    // Fallback to curated jobs if no results
    if (foundJobs.length === 0) {
      console.log('🔄 Using curated fallback jobs')
      foundJobs = generateCuratedGRCJobs(searchQueries)
    }
    
    // Normalize and merge results
    const normalizedJobs = foundJobs.map(job => ({
      ...job,
      id: job.id || `${source}-${Date.now()}-${Math.random()}`,
      scannedAt: new Date().toISOString()
    }))
    
    // Batch score all jobs
    setIsBatchScoring(true)
    const scoredJobs = await batchScoreJobs(normalizedJobs, resumeContent)
    
    // Store and update UI
    await addJobs(scoredJobs)
    await saveJobScores(scoredJobs)
    setJobs(scoredJobs)
    
    console.log(`✅ Found ${scoredJobs.length} jobs`)
    
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    setIsScanning(false)
    setIsBatchScoring(false)
  }
}
```

### Pipeline Orchestration - jobScanner.ts
```typescript
export async function scanJobBoards(
  resumeContent: string,
  config: ScanConfig = defaultScanConfig
): Promise<ScanResult> {
  const results: JobPosting[] = []
  
  console.log('🔍 Scanning job boards...')
  console.log(`Keywords: ${config.keywords.join(', ')}`)
  console.log(`Sources: ${config.sources.join(', ')}`)
  
  // 1. SCAN EACH SOURCE
  for (const source of config.sources) {
    try {
      const jobs = await scanSource(source, config)
      
      // 2. SCORE EACH JOB AGAINST RESUME
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
  
  // 3. SORT BY MATCH SCORE
  results.sort((a, b) => b.matchScore - a.matchScore)
  
  // 4. CATEGORIZE RESULTS
  const highMatches = results.filter(j => j.matchScore >= 90)
  const goodMatches = results.filter(j => j.matchScore >= 75 && j.matchScore < 90)
  
  return {
    totalFound: results.length,
    highMatches,
    goodMatches,
    lastScanTime: new Date().toISOString(),
    nextScanTime: new Date(Date.now() + config.scanIntervalHours * 60 * 60 * 1000).toISOString()
  }
}
```

## 2. Source Adapters

### LinkedIn Adapter - jobBoardIntegrations.ts
```typescript
export async function searchLinkedInJobs(keywords: string[], location: string): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    // REQUEST SETUP
    const keywordString = keywords.join(' OR ')
    const encodedKeywords = encodeURIComponent(keywordString)
    const encodedLocation = encodeURIComponent(location)
    
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedKeywords}&location=${encodedLocation}&f_TPR=r86400&start=0`
    
    // API CALL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('LinkedIn fetch error:', response.status)
      return jobs
    }
    
    // PARSE RESPONSE
    const html = await response.text()
    const jobMatches = html.matchAll(/<li[^>]*data-occludable-job-id="(\d+)"[^>]*>(.*?)<\/li>/gs)
    
    for (const match of jobMatches) {
      const jobId = match[1]
      const jobHtml = match[2]
      
      // EXTRACT FIELDS
      const titleMatch = jobHtml.match(/<h3[^>]*class="base-search-card__title"[^>]*>(.*?)<\/h3>/s)
      const title = titleMatch ? titleMatch[1].trim() : ''
      
      const companyMatch = jobHtml.match(/<h4[^>]*class="base-search-card__subtitle"[^>]*>(.*?)<\/h4>/s)
      const company = companyMatch ? companyMatch[1].trim() : ''
      
      const locationMatch = jobHtml.match(/<span[^>]*class="job-search-card__location"[^>]*>(.*?)<\/span>/s)
      const jobLocation = locationMatch ? locationMatch[1].trim() : location
      
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
          description: ''
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
```

### Indeed Adapter - jobBoardIntegrations.ts
```typescript
export async function searchIndeedJobs(keywords: string[], location: string): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  
  try {
    // REQUEST SETUP
    const keywordString = keywords.join(' ')
    const encodedKeywords = encodeURIComponent(keywordString)
    const encodedLocation = encodeURIComponent(location)
    
    const url = `https://www.indeed.com/jobs?q=${encodedKeywords}&l=${encodedLocation}&fromage=1&sort=date`
    
    // API CALL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error('Indeed fetch error:', response.status)
      return jobs
    }
    
    // PARSE RESPONSE
    const html = await response.text()
    const jobMatches = html.matchAll(/<div[^>]*class="job_seen_beacon"[^>]*>(.*?)<\/div>/gs)
    
    for (const match of jobMatches) {
      const jobHtml = match[1]
      
      // EXTRACT FIELDS
      const keyMatch = jobHtml.match(/data-jk="([^"]*)"/)
      const jobKey = keyMatch ? keyMatch[1] : ''
      
      const titleMatch = jobHtml.match(/<h2[^>]*class="jobTitle"[^>]*>.*?<span[^>]*title="([^"]*)"/)
      const title = titleMatch ? titleMatch[1] : ''
      
      const companyMatch = jobHtml.match(/<span[^>]*class="companyName"[^>]*>(.*?)<\/span>/s)
      const company = companyMatch ? cleanHtml(companyMatch[1]) : ''
      
      const locationMatch = jobHtml.match(/<div[^>]*class="companyLocation"[^>]*>(.*?)<\/div>/s)
      const jobLocation = locationMatch ? cleanHtml(locationMatch[1]) : location
      
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
          description: ''
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
```

### USAJobs Adapter - usajobsAPI.ts
```typescript
export async function searchUSAJobs(params: USAJobsSearchParams): Promise<USAJob[]> {
  const apiKey = process.env.NEXT_PUBLIC_USAJOBS_API_KEY || process.env.USAJOBS_API_KEY
  const email = process.env.NEXT_PUBLIC_USAJOBS_EMAIL || process.env.USAJOBS_EMAIL
  
  if (!apiKey || !email) {
    console.warn('USAJobs API credentials not configured')
    return []
  }
  
  try {
    // BUILD QUERY PARAMETERS
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
    
    // API REQUEST
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
    
    // PARSE RESULTS
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
```

## 3. Schema/Normalization

### Job Schema - jobScanner.ts
```typescript
export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: 'indeed' | 'linkedin' | 'dice' | 'ziprecruiter' | 'glassdoor' | 'other' | 'curated'
  postedDate: string
  matchScore: number
  salary?: string
  remote?: boolean
  scannedAt: string
}
```

### Normalization - jobBoardIntegrations.ts
```typescript
// Clean HTML tags and entities
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

// Merge and dedupe results
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
  
  // DEDUPE BASED ON TITLE + COMPANY
  const uniqueJobs = Array.from(
    new Map(
      allJobs.map(job => [`${job.title}-${job.company}`, job])
    ).values()
  )
  
  console.log(`📊 Total unique jobs found: ${uniqueJobs.length}`)
  return uniqueJobs
}
```

## 4. Filtering and Matching Logic

### Keyword Matching - smartMatcher.ts
```typescript
export const federalGRCKeywords: KeywordGroup[] = [
  // Critical Federal Terms
  {
    primary: 'fedramp',
    synonyms: ['fed ramp', 'federal risk and authorization management program'],
    weight: 4,
    category: 'framework'
  },
  {
    primary: 'ato',
    synonyms: ['authorization to operate', 'authority to operate', 'ato process'],
    weight: 4,
    category: 'authorization'
  },
  {
    primary: 'poam',
    synonyms: ['poa&m', 'plan of action and milestones', 'plan of actions and milestones', 'poams'],
    weight: 4,
    category: 'documentation'
  },
  // ... more keywords
]

export function smartMatch(jobDescription: string, resumeContent: string): MatchResult {
  const foundKeywords: string[] = []
  const missingKeywords: string[] = []
  let totalScore = 0
  let maxScore = 0
  
  // CHECK EACH KEYWORD GROUP
  for (const group of federalGRCKeywords) {
    maxScore += group.weight * 5 // Max 5 points per keyword
    
    const allTerms = [group.primary, ...group.synonyms]
    let found = false
    
    // CHECK IN JOB DESCRIPTION
    for (const term of allTerms) {
      if (jobDescription.toLowerCase().includes(term.toLowerCase())) {
        foundKeywords.push(group.primary)
        totalScore += group.weight * 5
        found = true
        break
      }
    }
    
    // CHECK IN RESUME
    if (!found) {
      for (const term of allTerms) {
        if (resumeContent.toLowerCase().includes(term.toLowerCase())) {
          found = true
          break
        }
      }
    }
    
    if (!found) {
      missingKeywords.push(group.primary)
    }
  }
  
  // CALCULATE PERCENTAGE SCORE
  const matchScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  
  return {
    matchScore,
    foundKeywords,
    missingKeywords,
    recommendations: generateRecommendations(missingKeywords)
  }
}
```

### Hard Filters - jobScanner.ts
```typescript
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
  minMatchScore: 75, // THRESHOLD FOR KEEPING JOBS
  sources: ['linkedin', 'indeed', 'dice', 'ziprecruiter', 'glassdoor', 'momproject', 'usajobs'],
  scanIntervalHours: 6
}
```

## 5. Dedupe Logic

### Current Dedupe - jobBoardIntegrations.ts
```typescript
// DEDUPE KEY: title + company combination
const uniqueJobs = Array.from(
  new Map(
    allJobs.map(job => [`${job.title}-${job.company}`, job])
  ).values()
)
```

### Enhanced Dedupe (suggested improvement)
```typescript
// More sophisticated dedupe with fuzzy matching
function dedupeJobs(jobs: Partial<JobPosting>[]): Partial<JobPosting>[] {
  const seen = new Set<string>()
  const deduped: Partial<JobPosting>[] = []
  
  for (const job of jobs) {
    // CREATE DEDUPE KEY
    const titleKey = job.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    const companyKey = job.company.toLowerCase().replace(/[^a-z0-9]/g, '')
    const locationKey = job.location.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    const dedupeKey = `${titleKey}-${companyKey}-${locationKey}`
    
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey)
      deduped.push(job)
    }
  }
  
  return deduped
}
```

## 6. Sample Run Log

```bash
🔍 Searching all job boards...
✅ LinkedIn: 12 jobs
✅ Indeed: 8 jobs
✅ Dice: 5 jobs
❌ ZipRecruiter failed: Network error
✅ Glassdoor: 3 jobs
✅ Mom Project: 7 jobs
📊 Total unique jobs found: 28

🔍 Scoring jobs against resume...
Batch scoring: 28/28 jobs
✅ Scoring complete

📊 RESULTS:
- Raw jobs per source: LinkedIn(12), Indeed(8), Dice(5), Glassdoor(3), Mom Project(7)
- Total raw jobs merged: 35
- Total after normalization: 35
- Total after dedupe: 28
- Total after filters (minMatchScore >= 75): 18
- Total after match threshold: 18
- Final jobs returned: 18

SCORE BREAKDOWN:
- 90%+ matches: 3 jobs
- 75-89% matches: 15 jobs
- Below 75%: 10 jobs (filtered out)
```

## 7. Raw Payload Examples

### LinkedIn Raw Response (excerpt)
```html
<li data-occludable-job-id="123456789">
  <div class="base-search-card__info">
    <h3 class="base-search-card__title">
      <a href="/jobs/view/123456789">Senior GRC Analyst</a>
    </h3>
    <h4 class="base-search-card__subtitle">Microsoft</h4>
    <span class="job-search-card__location">Remote</span>
    <time datetime="2024-01-15">2 days ago</time>
  </div>
</li>
```

### LinkedIn Parsed Job
```typescript
{
  id: 'linkedin-123456789',
  title: 'Senior GRC Analyst',
  company: 'Microsoft',
  location: 'Remote',
  url: 'https://www.linkedin.com/jobs/view/123456789',
  source: 'linkedin',
  postedDate: '2024-01-15',
  description: ''
}
```

### Indeed Raw Response (excerpt)
```html
<div class="job_seen_beacon" data-jk="abc123xyz">
  <h2 class="jobTitle">
    <a href="/viewjob?jk=abc123xyz" title="Cybersecurity Compliance Manager">
      Cybersecurity Compliance Manager
    </a>
  </h2>
  <span class="companyName">Amazon Web Services</span>
  <div class="companyLocation">Seattle, WA</div>
  <div class="salary-snippet">$140,000 - $180,000 a year</div>
</div>
```

### Indeed Parsed Job
```typescript
{
  id: 'indeed-abc123xyz',
  title: 'Cybersecurity Compliance Manager',
  company: 'Amazon Web Services',
  location: 'Seattle, WA',
  url: 'https://www.indeed.com/viewjob?jk=abc123xyz',
  source: 'indeed',
  postedDate: '2024-01-14',
  salary: '$140,000 - $180,000 a year',
  description: ''
}
```

---

## Summary

This bundle shows a complete job search pipeline with:

1. **Multi-source job discovery** (LinkedIn, Indeed, USAJobs, etc.)
2. **Smart fallback system** (curated jobs when APIs fail)
3. **Resume-based matching** using keyword analysis
4. **Deduplication** based on title/company
5. **Score-based filtering** with configurable thresholds
6. **Real-time processing** with progress tracking

The pipeline follows the standard flow: FETCH → NORMALIZE → DEDUPE → SCORE → FILTER → RANK → OUTPUT
