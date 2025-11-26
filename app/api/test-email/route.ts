import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.warn("🧪 TEST: Quick email alerts test...")
    
    // Test the Gmail fetcher directly
    const { gatherEmailAlertJobs } = await import('../../../lib/gmailFetcher')
    
    console.warn("🧪 TEST: Starting email job extraction...")
    const jobs = await gatherEmailAlertJobs()
    
    console.warn(`🧪 TEST: Extracted ${jobs.length} jobs from emails`)
    
    // Show sample jobs
    if (jobs.length > 0) {
      console.warn("🧪 TEST: Sample jobs:", jobs.slice(0, 3).map((job: any) => ({
        title: job.title,
        company: job.company,
        source: job.source,
        url: job.url ? 'has URL' : 'no URL'
      })))
    }
    
    return NextResponse.json({
      status: "success",
      message: "Email alerts test completed",
      jobsExtracted: jobs.length,
      sampleJobs: jobs.slice(0, 3).map((job: any) => ({
        title: job.title,
        company: job.company,
        source: job.source,
        url: job.url ? 'has URL' : 'no URL'
      })),
      allJobs: jobs
    })
    
  } catch (error) {
    console.error("🧪 TEST: Email alerts test failed:", error)
    
    if (error instanceof Error && error.message.includes('Missing env var')) {
      return NextResponse.json({
        status: "credentials missing",
        error: error.message,
        message: "Email alerts disabled. Missing Google OAuth credentials",
        required: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "GOOGLE_REFRESH_TOKEN"]
      }, { status: 400 })
    }
    
    return NextResponse.json({
      status: "test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
