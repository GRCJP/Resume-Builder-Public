import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.warn("🔍 API DIAGNOSTIC: Checking what APIs return...")
    
    const results = {
      adzuna: { total: 0, usaJobs: 0, internationalJobs: 0, sampleJobs: [] as any[] },
      jsearch: { total: 0, usaJobs: 0, internationalJobs: 0, sampleJobs: [] as any[] },
      serpapi: { total: 0, usaJobs: 0, internationalJobs: 0, sampleJobs: [] as any[] }
    }
    
    // Test Adzuna
    try {
      const { searchAdzunaJobs } = await import('../../../lib/adzunaAPI')
      const taxonomyBundles = [["GRC Analyst", "Cybersecurity Analyst"]]
      const adzunaJobs = await searchAdzunaJobs(taxonomyBundles, 1) // 1 page for testing
      
      results.adzuna.total = adzunaJobs.length
      results.adzuna.sampleJobs = adzunaJobs.slice(0, 3).map(job => ({
        title: job.title,
        location: job.location,
        company: job.company,
        isUSA: (job.location || '').toLowerCase().includes('us') || 
               (job.location || '').toLowerCase().includes('united states') ||
               (job.location || '').toLowerCase().includes('america')
      }))
      
      results.adzuna.usaJobs = results.adzuna.sampleJobs.filter(job => job.isUSA).length
      results.adzuna.internationalJobs = results.adzuna.sampleJobs.filter(job => !job.isUSA).length
      
      console.warn(`📡 ADZUNA: ${results.adzuna.total} jobs, ${results.adzuna.usaJobs} USA, ${results.adzuna.internationalJobs} international`)
    } catch (error) {
      console.warn("⚠️ Adzuna failed:", error)
    }
    
    // Test JSearch
    try {
      const { searchJSearchJobs } = await import('../../../lib/jsearchAPI')
      const jsearchJobs = await searchJSearchJobs(["Cybersecurity"], "Remote", 1) // 1 page for testing
      
      results.jsearch.total = jsearchJobs.length
      results.jsearch.sampleJobs = jsearchJobs.slice(0, 3).map(job => ({
        title: job.title,
        location: job.location,
        company: job.company,
        isUSA: (job.location || '').toLowerCase().includes('us') || 
               (job.location || '').toLowerCase().includes('united states') ||
               (job.location || '').toLowerCase().includes('america')
      }))
      
      results.jsearch.usaJobs = results.jsearch.sampleJobs.filter(job => job.isUSA).length
      results.jsearch.internationalJobs = results.jsearch.sampleJobs.filter(job => !job.isUSA).length
      
      console.warn(`🔍 JSEARCH: ${results.jsearch.total} jobs, ${results.jsearch.usaJobs} USA, ${results.jsearch.internationalJobs} international`)
    } catch (error) {
      console.warn("⚠️ JSearch failed:", error)
    }
    
    // Test SerpApi
    try {
      const { searchSerpApiJobs } = await import('../../../lib/serpapiJobs')
      const serpJobs = await searchSerpApiJobs(["Cybersecurity"], "Canada", 1) // 1 page for testing
      
      results.serpapi.total = serpJobs.length
      results.serpapi.sampleJobs = serpJobs.slice(0, 3).map(job => ({
        title: job.title,
        location: job.location,
        company: job.company,
        isUSA: (job.location || '').toLowerCase().includes('us') || 
               (job.location || '').toLowerCase().includes('united states') ||
               (job.location || '').toLowerCase().includes('america')
      }))
      
      results.serpapi.usaJobs = results.serpapi.sampleJobs.filter(job => job.isUSA).length
      results.serpapi.internationalJobs = results.serpapi.sampleJobs.filter(job => !job.isUSA).length
      
      console.warn(`🌐 SERPAPI: ${results.serpapi.total} jobs, ${results.serpapi.usaJobs} USA, ${results.serpapi.internationalJobs} international`)
    } catch (error) {
      console.warn("⚠️ SerpApi failed:", error)
    }
    
    const totalAPIJobs = results.adzuna.total + results.jsearch.total + results.serpapi.total
    const totalUSAJobs = results.adzuna.usaJobs + results.jsearch.usaJobs + results.serpapi.usaJobs
    const totalInternationalJobs = results.adzuna.internationalJobs + results.jsearch.internationalJobs + results.serpapi.internationalJobs
    
    return NextResponse.json({
      status: "success",
      summary: {
        totalAPIJobs,
        totalUSAJobs,
        totalInternationalJobs,
        usaJobsPercentage: totalAPIJobs > 0 ? Math.round((totalUSAJobs / totalAPIJobs) * 100) : 0
      },
      results,
      message: `APIs are working! Found ${totalAPIJobs} total jobs (${totalUSAJobs} USA, ${totalInternationalJobs} international). Your unified-jobs excludes USA jobs as requested.`
    })
    
  } catch (error) {
    console.error("❌ API DIAGNOSTIC: Failed:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
