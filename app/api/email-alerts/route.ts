import { NextResponse } from "next/server"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var: ${name}`)
  }
  return value
}

export async function GET(req: Request) {
  try {
    console.warn("📧 EMAIL ALERTS: Testing Gmail OAuth configuration...")
    
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const shouldFetch = searchParams.get('fetch') === 'true'
    const shouldProcess = searchParams.get('process') === 'true'
    
    console.warn("🔍 EMAIL ALERTS: Query parameters:", { fetch: shouldFetch, process: shouldProcess })
    
    // Check for required Gmail OAuth environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

    console.warn("🔐 EMAIL ALERTS: OAuth config check:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri,
      hasRefreshToken: !!refreshToken
    })

    // If fetch and process are requested, actually fetch and process emails
    if (shouldFetch && shouldProcess) {
      console.warn("🔄 EMAIL ALERTS: Fetching and processing emails...")
      
      try {
        // Import and use gmailFetcher to extract jobs
        const { gmailFetcher } = await import('../../../lib/gmailFetcher')
        
        // First, let's see what emails we can find
        console.warn("🔍 EMAIL ALERTS: Checking for job alert emails...")
        const emails = await gmailFetcher.fetchJobEmails(30) // Last 30 days
        console.warn(`📧 EMAIL ALERTS: Found ${emails.length} job alert emails`)
        
        if (emails.length > 0) {
          console.warn("📧 EMAIL ALERTS: Sample emails found:")
          emails.slice(0, 3).forEach((email: any, index: number) => {
            console.warn(`  ${index + 1}. From: ${email.from} | Subject: ${email.subject}`)
          })
        }
        
        // Now extract jobs from those emails
        const emailJobs = await gmailFetcher.extractJobsFromEmails(30) // Last 30 days
        
        console.warn(`📧 EMAIL ALERTS: Processed ${emailJobs.length} jobs from emails`)
        
        if (emailJobs.length > 0) {
          console.warn("📧 EMAIL ALERTS: Sample jobs with URLs:")
          emailJobs.slice(0, 3).forEach((job: any, index: number) => {
            console.warn(`  ${index + 1}. ${job.title} at ${job.company} | URL: ${job.url || 'NO URL'}`)
          })
        }
        
        return NextResponse.json({
          status: "Email processing complete",
          service: "gmail-oauth",
          authenticated: true,
          emailsProcessed: 30, // Days processed
          emailsFound: emails.length,
          jobsFound: emailJobs.length,
          jobs: emailJobs.slice(0, 5), // Return first 5 jobs as sample
          message: `Found ${emails.length} emails, extracted ${emailJobs.length} jobs`
        })
        
      } catch (error) {
        console.error("❌ EMAIL ALERTS: Email processing failed:", error)
        return NextResponse.json({
          status: "Email processing failed",
          service: "gmail-oauth",
          authenticated: true,
          error: error instanceof Error ? error.message : "Unknown error",
          message: "Failed to fetch or process emails"
        })
      }
    }

    // Test authentication if refresh token is available
    if (refreshToken) {
      try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: requireEnv('GOOGLE_CLIENT_ID'),
            client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        })

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          console.warn("✅ EMAIL ALERTS: OAuth authentication successful")
          
          // Test a simple Gmail API call
          const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`
            }
          })

          if (profileResponse.ok) {
            const profile = await profileResponse.json()
            console.warn("✅ EMAIL ALERTS: Gmail API access confirmed", {
              emailAddress: profile.emailAddress,
              historyId: profile.historyId
            })

            return NextResponse.json({
              status: "Email alerts ready",
              service: "gmail-oauth",
              authenticated: true,
              emailAddress: profile.emailAddress,
              message: "Gmail OAuth working - can fetch job alerts from inbox"
            })
          } else {
            console.warn("⚠️ EMAIL ALERTS: Gmail API access failed")
            return NextResponse.json({
              status: "Partial setup",
              service: "gmail-oauth",
              authenticated: true,
              apiAccess: false,
              message: "OAuth works but Gmail API access failed"
            })
          }
        } else {
          const errorText = await tokenResponse.text()
          console.error("❌ EMAIL ALERTS: OAuth token exchange failed", errorText)
          return NextResponse.json({
            status: "Authentication failed",
            service: "gmail-oauth",
            authenticated: false,
            error: "Token exchange failed",
            message: "Check GOOGLE_REFRESH_TOKEN validity"
          })
        }
      } catch (error) {
        console.error("❌ EMAIL ALERTS: OAuth test failed:", error)
        return NextResponse.json({
          status: "OAuth test failed",
          service: "gmail-oauth",
          authenticated: false,
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    } else {
      console.warn("⚠️ EMAIL ALERTS: No refresh token configured")
      return NextResponse.json({
        status: "Setup required",
        service: "gmail-oauth",
        authenticated: false,
        message: "GOOGLE_REFRESH_TOKEN missing - user needs to authorize",
        setupUrl: "https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred"
      })
    }

  } catch (error) {
    console.error("❌ EMAIL ALERTS: Configuration check failed:", error)
    
    if (error instanceof Error && error.message.includes('Missing env var')) {
      return NextResponse.json({ 
        status: "Missing credentials",
        error: error.message,
        message: "Add Google OAuth credentials to .env.local",
        required: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "GOOGLE_REFRESH_TOKEN"]
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      status: "Configuration error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === "fetch-emails") {
      console.warn("📧 EMAIL ALERTS: Fetching job emails from Gmail...")
      
      // Import and use the Gmail fetcher
      const { gmailFetcher } = await import('../../../lib/gmailFetcher')
      
      try {
        const jobs = await gmailFetcher.extractJobsFromEmails(7) // Last 7 days
        
        console.warn(`✅ EMAIL ALERTS: Fetched ${jobs.length} jobs from emails`)
        
        return NextResponse.json({
          status: "success",
          jobs,
          count: jobs.length,
          message: `Extracted ${jobs.length} jobs from Gmail alerts`
        })
        
      } catch (error) {
        console.error("❌ EMAIL ALERTS: Email fetch failed:", error)
        
        if (error instanceof Error && error.message.includes('Missing env var')) {
          return NextResponse.json({
            status: "credentials missing",
            error: error.message,
            message: "Email alerts disabled. Missing Google OAuth credentials"
          }, { status: 400 })
        }
        
        return NextResponse.json({
          status: "fetch failed",
          error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error("❌ EMAIL ALERTS: Request failed:", error)
    return NextResponse.json({ 
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
