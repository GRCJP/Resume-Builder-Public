import type { JobPosting } from "./jobScanner"

export async function searchJSearchJobs(
  keywords: string[],
  location: string,
  maxPages = 2
): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  const query = `${keywords.join(" OR ")} ${location || "remote"}` 

  console.log(`🔍 JSearch: Searching "${query}" (${maxPages} pages)`)

  try {
    // JSearch uses page numbers starting from 1
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(
        `/api/jsearch?query=${encodeURIComponent(query)}&page=${page}&num_pages=1&country=us` 
      )
      
      console.log(`📡 JSearch: Page ${page} response status: ${res.status}`)
      
      if (!res.ok) {
        const errorBody = await res.text()
        console.error(`❌ JSearch: Page ${page} failed with status ${res.status}`)
        console.error(`❌ JSearch: Response body:`, errorBody)
        
        try {
          const errorData = JSON.parse(errorBody)
          // Check for subscription issue
          if (errorData.error?.includes('not subscribed') || errorData.subscriptionRequired) {
            console.warn(`⚠️ JSearch API subscription required - skipping remaining pages`)
            break
          }
        } catch {
          // Not JSON, just continue
        }
        
        console.warn(`⚠️ JSearch: Continuing to next page despite error...`)
        continue
      }

      const data = await res.json()
      
      if (data.error) {
        console.error(`❌ JSearch: Page ${page} API returned error:`, data.error)
        console.warn(`⚠️ JSearch: Continuing to next page despite error...`)
        continue
      }

      const results = data?.data || []
      if (!results.length) {
        console.log(`📄 JSearch page ${page}: No results`)
        break
      }

      console.log(`📄 JSearch page ${page}: ${results.length} jobs`)

      for (const r of results) {
        jobs.push({
          id: `jsearch-${r.job_id || r.job_title}-${page}`,
          title: r.job_title,
          company: r.employer_name || "Unknown Company",
          location: r.job_location || location || "Remote",
          url: r.job_apply_link, // job detail link
          source: "jsearch" as any,
          postedDate: r.job_posted_at_datetime_utc || new Date().toISOString(),
          description: r.job_description || "",
          salary: r.job_salary || r.job_min_salary || r.job_max_salary ? 
            `${r.job_min_salary || ''} - ${r.job_max_salary || ''}`.trim() : undefined,
          remote: r.job_is_remote
        })
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ JSearch fetch exception:`, errorMsg)
    console.warn(`⚠️ JSearch: Returning ${jobs.length} jobs collected before error`)
  }

  console.log(`✅ JSearch: Found ${jobs.length} total jobs`)
  
  if (jobs.length === 0) {
    console.warn(`⚠️ JSearch: No jobs found - this may indicate an API issue`)
  }
  
  return jobs
}
