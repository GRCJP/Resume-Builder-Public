import type { JobPosting } from "./jobScanner"

export async function searchAdzunaJobs(
  keywords: string[],
  location: string,
  maxPages = 3
): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  const what = keywords.join(" OR ")
  const where = location || "Remote"

  console.log(`🔍 Adzuna: Searching "${what}" in ${where} (${maxPages} pages)`)

  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`📄 Adzuna: Fetching page ${page}...`)
      const res = await fetch(
        `/api/adzuna?what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&page=${page}` 
      )
      
      console.log(`📡 Adzuna: Page ${page} response status: ${res.status}`)
      
      if (!res.ok) {
        const errorBody = await res.text()
        console.error(`❌ Adzuna: Page ${page} failed with status ${res.status}`)
        console.error(`❌ Adzuna: Response body:`, errorBody)
        console.warn(`⚠️ Adzuna: Continuing to next page despite error...`)
        continue // Warn and continue instead of breaking
      }

      const data = await res.json()
      console.log(`📊 Adzuna: Page ${page} received ${data.results?.length || 0} jobs`)
      
      if (data.error) {
        console.error(`❌ Adzuna: Page ${page} API error:`, data.error)
        console.warn(`⚠️ Adzuna: Continuing to next page despite error...`)
        continue // Warn and continue instead of breaking
      }

      const results = data.results || []
      if (!results.length) {
        console.log(`📄 Adzuna: Page ${page} no results, stopping`)
        break
      }

      for (const job of results) {
        jobs.push({
          id: `adzuna-${job.id}`,
          title: job.title,
          company: job.company?.display_name || "Unknown Company",
          location: job.location?.display_name || where,
          url: job.redirect_url,
          source: "adzuna" as any,
          postedDate: job.created || new Date().toISOString(),
          description: job.description || ""
        })
      }
      
      console.log(`✅ Adzuna: Page ${page} processed ${results.length} jobs`)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Adzuna: Page ${page} fetch error:`, errorMsg)
      console.warn(`⚠️ Adzuna: Continuing to next page despite error...`)
      continue // Warn and continue instead of breaking
    }
  }

  console.log(`✅ Adzuna: TOTAL - ${jobs.length} jobs from ${maxPages} pages`)
  
  if (jobs.length === 0) {
    console.warn(`⚠️ Adzuna: No jobs found - this may indicate an API issue`)
  }
  
  return jobs
}
