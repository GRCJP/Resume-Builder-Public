import { NextResponse } from 'next/server'
import { gmailFetcher } from '../../../lib/gmailFetcher'

export async function GET(req: Request) {
  try {
    // Check if Gmail credentials are configured
    const credentials = {
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/gmail-callback',
      emailUser: process.env.JOBS_EMAIL_USER
    }

    const isConfigured = !!(credentials.clientId && credentials.clientSecret && credentials.emailUser)

    return NextResponse.json({
      configured: isConfigured,
      credentials: {
        clientId: credentials.clientId ? '***configured***' : 'missing',
        clientSecret: credentials.clientSecret ? '***configured***' : 'missing', 
        redirectUri: credentials.redirectUri,
        emailUser: credentials.emailUser || 'missing'
      },
      oauthUrl: isConfigured ? generateOAuthUrl(credentials) : null,
      message: isConfigured 
        ? 'Gmail integration is configured' 
        : 'Gmail integration needs configuration'
    })
  } catch (error) {
    console.error('❌ Gmail config check failed:', error)
    return NextResponse.json({
      error: 'Failed to check Gmail configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { accessToken } = await req.json()
    
    if (!accessToken) {
      return NextResponse.json({
        error: 'Access token is required'
      }, { status: 400 })
    }

    // Authenticate Gmail fetcher with the access token
    await gmailFetcher.authenticate()
    
    // Test the connection by fetching a few recent emails
    console.log('📧 Testing Gmail connection...')
    const testEmails = await gmailFetcher.fetchJobEmails(1) // Last 1 day for testing
    
    // Try to extract jobs from test emails
    const testJobs = await gmailFetcher.extractJobsFromEmails(1)
    
    return NextResponse.json({
      success: true,
      message: 'Gmail integration connected successfully',
      testResults: {
        emailsFound: testEmails.length,
        jobsExtracted: testJobs.length,
        sampleJobs: testJobs.slice(0, 3).map(job => ({
          title: job.title,
          company: job.company,
          source: job.source
        }))
      }
    })
  } catch (error) {
    console.error('❌ Gmail integration failed:', error)
    return NextResponse.json({
      error: 'Failed to connect Gmail integration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateOAuthUrl(credentials: any): string {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ')
  
  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: credentials.redirectUri,
    scope: scopes,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  })
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}
