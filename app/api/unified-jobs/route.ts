import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.warn("🔄 UNIFIED: Fetching unified jobs (email + API, excluding USA)...")
    
    // Step 1: Get email jobs (high quality)
    let emailJobs: any[] = []
    try {
      const { gmailFetcher } = await import('../../../lib/gmailFetcher')
      emailJobs = await gmailFetcher.extractJobsFromEmails(30) // Last 30 days
      console.warn(`📧 UNIFIED: Found ${emailJobs.length} email jobs`)
    } catch (error) {
      console.warn("⚠️ UNIFIED: Email jobs failed, continuing with API jobs:", error)
    }
    
    // Step 2: Get API jobs (excluding USA)
    let apiJobs: any[] = []
    try {
      // Get jobs from individual API sources
      const apiSources = []
      
      // Adzuna
      try {
        const { searchAdzunaJobs } = await import('../../../lib/adzunaAPI')
        const taxonomyBundles = [
          ["GRC Analyst", "GRC Engineer", "Security Compliance", "Compliance Analyst", "Risk Analyst"],
          ["Cybersecurity Analyst", "Security Analyst", "Security Engineer", "Information Security"],
          ["Privacy Analyst", "Data Privacy", "Third Party Risk", "Vendor Risk"],
          ["Security Auditor", "IT Auditor", "Controls Analyst", "SOX", "Internal Auditor"]
        ]
        const adzunaJobs = await searchAdzunaJobs(taxonomyBundles, 2) // 2 pages per bundle for speed
        apiSources.push(...adzunaJobs)
        console.warn(`📡 UNIFIED: Got ${adzunaJobs.length} jobs from Adzuna`)
      } catch (error) {
        console.warn("⚠️ UNIFIED: Adzuna failed:", error)
      }
      
      // JSearch
      try {
        const { searchJSearchJobs } = await import('../../../lib/jsearchAPI')
        const jsearchJobs = await searchJSearchJobs(["GRC", "Cybersecurity", "Security Analyst", "Risk Manager"], "Remote", 3)
        apiSources.push(...jsearchJobs)
        console.warn(`🔍 UNIFIED: Got ${jsearchJobs.length} jobs from JSearch`)
      } catch (error) {
        console.warn("⚠️ UNIFIED: JSearch failed:", error)
      }
      
      // SerpApi - Try international locations
      try {
        const { searchSerpApiJobs } = await import('../../../lib/serpapiJobs')
        const serpJobs = await searchSerpApiJobs(["GRC Analyst", "Cybersecurity Analyst", "Risk Analyst"], "Canada", 2)
        apiSources.push(...serpJobs)
        console.warn(`🌐 UNIFIED: Got ${serpJobs.length} jobs from SerpApi (Canada)`)
      } catch (error) {
        console.warn("⚠️ UNIFIED: SerpApi failed:", error)
      }
      
      // Filter out USA jobs and keep only international/remote
      apiJobs = apiSources.filter(job => {
        const location = (job.location || '').toLowerCase()
        const title = (job.title || '').toLowerCase()
        const description = (job.description || '').toLowerCase()
        
        // Exclude USA-specific jobs
        const isUSA = location.includes('usa') || 
                     location.includes('united states') ||
                     location.includes('america') ||
                     location.includes('us ') ||
                     title.includes('usa') ||
                     description.includes('usa') ||
                     description.includes('united states') ||
                     description.includes('america')
        
        return !isUSA
      })
      
      console.warn(`🌍 UNIFIED: Found ${apiJobs.length} non-USA API jobs from ${apiSources.length} total`)
    } catch (error) {
      console.warn("⚠️ UNIFIED: API jobs failed, continuing with email jobs:", error)
    }
    
    // Step 3: Combine and deduplicate jobs
    const allJobs = [...emailJobs, ...apiJobs]
    
    // Simple deduplication by title + company
    const seen = new Set()
    const deduplicatedJobs = allJobs.filter(job => {
      const key = `${job.title?.toLowerCase()}|${job.company?.toLowerCase()}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
    
    console.warn(`🔄 UNIFIED: Combined to ${deduplicatedJobs.length} unique jobs`)
    
    // Step 4: Score jobs against resume (if resume available)
    // For now, we'll add basic scoring - you can enhance this later
    const scoredJobs = deduplicatedJobs.map(job => {
      let score = 50 // Base score
      
      // Boost email jobs (they're higher quality)
      if (job.source?.includes('email')) {
        score += 20
      }
      
      // Boost jobs with relevant keywords
      const relevantKeywords = [
        'cybersecurity', 'security', 'grc', 'risk', 'compliance',
        'audit', 'iso', 'soc', 'nist', 'pci', 'hipaa',
        'consultant', 'analyst', 'engineer', 'manager'
      ]
      
      const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase()
      const keywordMatches = relevantKeywords.filter(keyword => jobText.includes(keyword))
      score += keywordMatches.length * 3
      
      // Boost recent jobs
      if (job.postedDate) {
        const daysOld = Math.floor((Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24))
        if (daysOld < 7) score += 10
        else if (daysOld < 30) score += 5
      }
      
      // Boost jobs with valid URLs
      if (job.url && !job.requiresLogin) {
        score += 5
      }
      
      return {
        ...job,
        score: Math.min(100, Math.max(0, score)), // Clamp between 0-100
        scoreReasons: {
          emailSource: job.source?.includes('email') ? 20 : 0,
          keywordMatches: keywordMatches.length * 3,
          recency: job.postedDate ? (Date.now() - new Date(job.postedDate).getTime() < 7 * 24 * 60 * 60 * 1000 ? 10 : 5) : 0,
          validUrl: (job.url && !job.requiresLogin) ? 5 : 0
        }
      }
    })
    
    // Sort by score (highest first)
    scoredJobs.sort((a, b) => (b.score || 0) - (a.score || 0))
    
    // Step 5: Return results
    const emailJobCount = scoredJobs.filter(job => job.source?.includes('email')).length
    const apiJobCount = scoredJobs.filter(job => !job.source?.includes('email')).length
    
    return NextResponse.json({
      status: "success",
      jobs: scoredJobs,
      stats: {
        total: scoredJobs.length,
        emailJobs: emailJobCount,
        apiJobs: apiJobCount,
        averageScore: scoredJobs.reduce((sum, job) => sum + (job.score || 0), 0) / scoredJobs.length
      },
      sources: {
        emailJobs: emailJobs.length,
        apiJobs: apiJobs.length,
        originalTotal: allJobs.length,
        duplicatesRemoved: allJobs.length - deduplicatedJobs.length
      },
      message: `Combined ${emailJobCount} email jobs + ${apiJobCount} API jobs (excluding USA), scored and sorted by relevance`
    })
    
  } catch (error) {
    console.error("❌ UNIFIED: Failed to fetch unified jobs:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
