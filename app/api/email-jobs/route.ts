import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.warn("📧 EMAIL JOBS: Fetching email jobs...")
    
    // Import and use the Gmail fetcher
    const { gmailFetcher } = await import('../../../lib/gmailFetcher')
    
    try {
      const jobs = await gmailFetcher.extractJobsFromEmails(30) // Last 30 days
      
      console.warn(`✅ EMAIL JOBS: Fetched ${jobs.length} jobs from emails`)
      
      return NextResponse.json({
        status: "success",
        jobs: jobs,
        count: jobs.length,
        lastRefresh: new Date().toISOString(),
        message: `Found ${jobs.length} jobs from email alerts`
      })
      
    } catch (error) {
      console.error("❌ EMAIL JOBS: Fetch failed:", error)
      
      if (error instanceof Error && error.message.includes('Missing env var')) {
        return NextResponse.json({
          status: "credentials missing",
          error: error.message,
          message: "Email jobs disabled. Missing Google OAuth credentials"
        }, { status: 400 })
      }
      
      return NextResponse.json({
        status: "fetch failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("❌ EMAIL JOBS: Request failed:", error)
    return NextResponse.json({ 
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
