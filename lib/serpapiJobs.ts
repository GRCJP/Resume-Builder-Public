import type { JobPosting } from "./jobScanner"

export async function searchSerpApiJobs(
  keywords: string[],
  location: string,
  maxPages = 2
): Promise<Partial<JobPosting>[]> {
  const jobs: Partial<JobPosting>[] = []
  const query = `${keywords.join(" OR ")} ${location || "remote"}` 

  console.log(`🔍 SerpApi: Searching "${query}" (${maxPages} pages)`)

  for (let page = 0; page < maxPages; page++) {
    try {
      // Remove deprecated start parameter - use single page request
      const res = await fetch(
        `/api/serpapi?q=${encodeURIComponent(query)}&location=United%20States&gl=us&hl=en` 
      )
      
      if (!res.ok) {
        console.warn(`❌ SerpApi API error: ${res.status}`)
        break
      }

      const data = await res.json()
      
      if (data.error) {
        console.warn(`❌ SerpApi API error: ${data.error}`)
        break
      }

      const results = data?.jobs_results || []
      if (!results.length) {
        console.log(`📄 SerpApi page ${page}: No results`)
        break
      }

      console.log(`📄 SerpApi page ${page}: ${results.length} jobs`)

      for (const r of results) {
        // Debug URL extraction
        console.log('🔍 SerpAPI job structure:', {
          title: r.title,
          hasLink: !!r.link,
          hasApplyOptions: !!r.apply_options?.length,
          hasRelatedLinks: !!r.related_links?.length,
          link: r.link,
          applyOptions: r.apply_options?.slice(0, 2),
          relatedLinks: r.related_links?.slice(0, 2)
        })
        
        // Try to get URL from apply_options first, then fallback to link
        const applyUrl = r.apply_options?.find((opt: any) => opt.link)?.link
        const jobUrl = applyUrl || r.related_links?.[0]?.link || r.link
        
        console.log('🔍 Extracted URL:', jobUrl)
        
        jobs.push({
          id: `serpapi-${r.job_id || r.link}-${page}`,
          title: r.title,
          company: r.company_name || "Unknown Company",
          location: r.location || location || "Remote",
          url: jobUrl,
          source: "serpapi" as any,
          postedDate: r.detected_extensions?.posted_at || new Date().toISOString(),
          description: r.description || ""
        })
      }
    } catch (error) {
      console.error(`❌ SerpApi fetch error on page ${page}:`, error)
      break
    }
  }

  console.log(`✅ SerpApi: Found ${jobs.length} total jobs`)
  return jobs
}
