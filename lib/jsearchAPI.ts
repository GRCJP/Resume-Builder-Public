import type { JobPosting } from "./jobScanner"

export async function searchJSearchJobs(
  keywords: string[],
  location: string,
  maxPages = 2
): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []

  console.warn(`🔍 JSearch: Using ${keywords.length} keywords, location: "${location || 'ALL'}"`)

  try {
    for (const keyword of keywords) {
      try {
        console.warn(`📄 JSearch: Query "${keyword}"...`)
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        // Use ONLY JSearch route - NO CROSS WIRING
        const res = await fetch(
          `/api/jsearch?query=${encodeURIComponent(keyword)}&page=1&num_pages=1&country=us`,
          { signal: controller.signal }
        )
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.warn(`⚠️ JSearch: Query "${keyword}" failed - ${res.status}: ${errorText}`)
          
          // If it's a credential error, show clear message
          if (errorText.includes('credentials') || errorText.includes('key missing') || errorText.includes('unauthorized')) {
            console.error('❌ JSearch credentials missing - check JSEARCH_RAPIDAPI_KEY in .env.local')
          }
          continue
        }

        const data = await res.json()
        
        if (data.error) {
          console.warn(`❌ JSearch: API error for "${keyword}": ${data.error}`)
          continue
        }
        
        const results = data.data || []
        
        if (results.length > 0) {
          console.warn(`✅ JSearch: ${results.length} jobs for "${keyword}"`)
          
          // Debug URLs
          const urlCount = results.filter((job: any) => job.job_apply_link).length
          console.warn(`🔗 JSearch: ${urlCount}/${results.length} jobs have URLs`)
          
          jobs.push(...results.map((job: any) => ({
            id: job.job_id || `jsearch-${Date.now()}-${Math.random()}`,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city || job.job_country,
            description: job.job_description,
            url: job.job_apply_link || `https://www.google.com/search?q=${encodeURIComponent(job.job_title + ' ' + job.employer_name + ' jobs')}`,
            source: 'jsearch',
            postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
            matchScore: 0,
            salary: job.job_max_salary || job.job_min_salary ? `${job.job_min_salary}-${job.job_max_salary}` : undefined,
            remote: job.job_is_remote || false,
            scannedAt: new Date().toISOString()
          }))) // Keep all jobs - descriptions matter most
        } else {
          console.warn(`📭 JSearch: No results for "${keyword}"`)
        }
        
      } catch (err) {
        console.warn(`❌ JSearch query "${keyword}" failed:`, err)
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn('⏰ JSearch query timed out after 10 seconds')
        }
      }
    }
  } catch (error) {
    console.error('❌ JSearch search failed:', error)
    throw error
  }

  console.warn(`✅ JSearch: TOTAL - ${jobs.length} jobs from ${keywords.length} queries`)
  
  // Phase 1 rule: Don't swallow "all zero"
  if (jobs.length === 0) {
    console.warn(`[PHASE 1] JSEARCH returned 0 jobs. Treating as retrieval failure.`)
  }
  
  return jobs
}
