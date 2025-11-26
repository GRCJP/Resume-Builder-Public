import type { JobPosting } from "./jobScanner"

// PHASE 1: PURE DATA DUMP - No filters, no shaping, maximum volume
export async function searchAdzunaJobs(
  queryBundles: string[][], // Bundles of 5-8 terms each
  maxPages = 5 // Minimum 5 pages per bundle
): Promise<Partial<JobPosting>[]> {
  const allRawJobs: Partial<JobPosting>[] = []
  
  console.warn('🚨 PHASE 1 ADZUNA: STARTING PURE DATA DUMP')
  console.warn(`📦 Query bundles: ${queryBundles.length} bundles`)
  console.warn(`📄 Pages per bundle: ${maxPages}`)
  
  for (let bundleIndex = 0; bundleIndex < queryBundles.length; bundleIndex++) {
    const bundle = queryBundles[bundleIndex]
    const what = bundle.join(" OR ") // Bundle format for API
    
    console.warn(`🔍 BUNDLE ${bundleIndex + 1}: "${what}"`)
    
    for (let page = 1; page <= maxPages; page++) {
      try {
        console.warn(`📄 Bundle ${bundleIndex + 1}, Page ${page}...`)
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        
        // NO LOCATION FILTER - Pure data dump
        const res = await fetch(
          `/api/adzuna?what=${encodeURIComponent(what)}&page=${page}`,
          { signal: controller.signal }
        )
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          console.warn(`⚠️ Bundle ${bundleIndex + 1}, Page ${page} failed: ${res.status}`)
          continue // Don't break - gather what we can
        }

        const data = await res.json()
        const results = data.results || []
        
        if (results.length > 0) {
          console.warn(`✅ Bundle ${bundleIndex + 1}, Page ${page}: ${results.length} jobs`)
          allRawJobs.push(...results)
        } else {
          console.warn(`📭 Bundle ${bundleIndex + 1}, Page ${page}: No results`)
        }
        
      } catch (error) {
        console.warn(`❌ Bundle ${bundleIndex + 1}, Page ${page} error:`, error)
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('⏰ Adzuna request timed out after 15 seconds')
        }
        continue // Don't break - gather what we can
      }
    }
  }
  
  console.warn(`🚨 PHASE 1 ADZUNA: RAW DATA DUMP COMPLETE`)
  console.warn(`📊 Total raw jobs collected: ${allRawJobs.length}`)
  
  return allRawJobs
}
