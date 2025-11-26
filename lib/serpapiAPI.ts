import type { JobPosting } from "./jobScanner"

export async function searchSerpApiJobs(
  keywords: string[],
  location: string,
  maxPages = 2
): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []

  console.warn(`🔍 SerpApi: Using ${keywords.length} keywords, location: "${location || 'ALL'}"`)

  try {
    for (const keyword of keywords) {
      try {
        console.warn(`📄 SerpApi: Query "${keyword}"...`)
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        // Use ONLY SerpApi route - NO CROSS WIRING
        const res = await fetch(
          `/api/serpapi?q=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location || 'United States')}&start=0`,
          { signal: controller.signal }
        )
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.warn(`⚠️ SerpApi: Query "${keyword}" failed - ${res.status}: ${errorText}`)
          
          // If it's a credential error, show clear message
          if (errorText.includes('credentials') || errorText.includes('key missing')) {
            console.error('❌ SerpApi credentials missing - check SERPAPI_API_KEY in .env.local')
          }
          continue
        }

        const data = await res.json()
        
        if (data.error) {
          console.warn(`❌ SerpApi: API error for "${keyword}": ${data.error}`)
          continue
        }
        
        const results = data.jobs_results || []
        
        if (results.length > 0) {
          console.warn(`✅ SerpApi: ${results.length} jobs for "${keyword}"`)
          
          // Debug URLs
          const urlCount = results.filter((job: any) => job.link || job.apply_link).length
          console.warn(`🔗 SerpApi: ${urlCount}/${results.length} jobs have URLs`)
          
          jobs.push(...results.map((job: any) => ({
            id: job.job_id || `serpapi-${Date.now()}-${Math.random()}`,
            title: job.title,
            company: job.company_name,
            location: job.location,
            description: job.description,
            url: job.link || job.apply_link || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company_name + ' jobs')}`,
            source: 'serpapi',
            postedDate: job.detected_extensions?.posted_at || new Date().toISOString(),
            matchScore: 0,
            salary: job.detected_extensions?.salary || undefined,
            remote: job.detected_extensions?.work_from_home || false,
            scannedAt: new Date().toISOString()
          }))) // Keep all jobs - descriptions matter most
        } else {
          console.warn(`📭 SerpApi: No results for "${keyword}"`)
        }
        
      } catch (err) {
        console.warn(`❌ SerpApi query "${keyword}" failed:`, err)
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn('⏰ SerpApi query timed out after 10 seconds')
        }
      }
    }
  } catch (error) {
    console.error('❌ SerpApi search failed:', error)
    throw error
  }

  console.warn(`✅ SerpApi: TOTAL - ${jobs.length} jobs from ${keywords.length} queries`)
  
  // Phase 1 rule: Don't swallow "all zero"
  if (jobs.length === 0) {
    console.warn(`[PHASE 1] SERPAPI returned 0 jobs. Treating as retrieval failure.`)
  }
  
  return jobs
}
