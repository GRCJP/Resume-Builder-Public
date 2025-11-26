import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    console.warn("🔍 DEBUG: Checking Gmail email discovery...")
    
    // Import the Gmail fetcher functions
    const { GmailJobEmailFetcher, gatherEmailAlertJobs } = await import('../../../lib/gmailFetcher')
    
    // Create a new instance to test
    const gmail = new GmailJobEmailFetcher()
    await gmail.authenticate()
    
    // Test email discovery with 30 days back
    const emails = await gmail.fetchJobEmails(30)
    
    console.warn(`🔍 DEBUG: Found ${emails.length} emails`)
    
    // Show details of found emails
    const emailDetails = emails.map((email: any, index: number) => ({
      index: index + 1,
      subject: email.subject,
      from: email.from,
      date: email.date,
      bodyLength: email.body.length,
      bodyPreview: email.body.substring(0, 200) + '...',
      hasLinkedInUrl: email.body.includes('linkedin.com/jobs/view'),
      hasIndeedUrl: email.body.includes('indeed.com'),
      hasJobKeywords: email.body.match(/consultant|analyst|engineer|manager|director|specialist/i) ? true : false
    }))
    
    return NextResponse.json({
      status: "debug_complete",
      emailsFound: emails.length,
      emailDetails: emailDetails,
      message: "Check console for detailed parsing logs"
    })
    
  } catch (error) {
    console.error("🔍 DEBUG: Error:", error)
    
    if (error instanceof Error && error.message.includes('Missing env var')) {
      return NextResponse.json({
        status: "credentials missing",
        error: error.message,
        message: "Missing Google OAuth credentials"
      }, { status: 400 })
    }
    
    return NextResponse.json({
      status: "debug failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
