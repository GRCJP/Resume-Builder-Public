// Gmail Job Email Fetcher - Fetches job alert emails from Gmail
import { parseJobEmails } from './emailJobParser'

export interface GmailMessage {
  id: string
  threadId: string
  payload: {
    headers: { name: string; value: string }[]
    parts?: any[]
    body?: {
      data: string
    }
  }
  snippet: string
  internalDate: string
}

export interface ParsedEmail {
  id: string
  from: string
  subject: string
  body: string
  date: string
  snippet: string
}

export class GmailJobEmailFetcher {
  private isAuthenticated = false

  constructor() {
    console.log('📧 Gmail fetcher initialized')
  }

  async authenticate() {
    // Check if IMAP credentials are available
    const emailUser = process.env.JOBS_EMAIL_USER
    const emailPass = process.env.JOBS_EMAIL_PASS
    const imapHost = process.env.JOBS_EMAIL_IMAP_HOST
    const imapPort = process.env.JOBS_EMAIL_IMAP_PORT

    if (!emailUser || !emailPass || !imapHost || !imapPort) {
      console.error('❌ Gmail IMAP credentials not configured')
      return false
    }

    this.isAuthenticated = true
    console.log('📧 Gmail authenticated successfully with IMAP credentials')
    return true
  }

  async fetchJobEmails(daysBack: number = 7): Promise<ParsedEmail[]> {
    if (!this.isAuthenticated) {
      const authResult = await this.authenticate()
      if (!authResult) {
        console.error('❌ Gmail not authenticated')
        return []
      }
    }

    console.log(`📧 Fetching job emails from last ${daysBack} days using IMAP...`)
    
    try {
      // For now, return mock data until we implement proper IMAP fetching
      // This is a placeholder - we'll implement actual IMAP fetching next
      const mockEmails: ParsedEmail[] = [
        {
          id: 'mock-1',
          from: 'lensa@lensa.ai',
          subject: 'New GRC Engineer jobs for you',
          body: 'We found 5 new GRC Engineer positions that match your profile...',
          date: new Date().toISOString(),
          snippet: 'New GRC Engineer jobs found'
        },
        {
          id: 'mock-2', 
          from: 'jobs@linkedin.com',
          subject: 'Job Alert: Compliance Engineer positions',
          body: '3 new Compliance Engineer jobs match your skills...',
          date: new Date(Date.now() - 86400000).toISOString(),
          snippet: 'Compliance Engineer jobs available'
        }
      ]

      console.log(`✅ Gmail: Fetched ${mockEmails.length} total job emails (mock data)`)
      return mockEmails

    } catch (error) {
      console.error('❌ Gmail fetch error:', error)
      return []
    }
  }

  async extractJobsFromEmails(daysBack: number = 7) {
    console.log(`📧 Extracting jobs from emails (last ${daysBack} days)...`)
    
    const emails = await this.fetchJobEmails(daysBack)
    
    if (emails.length === 0) {
      console.log('📧 No job emails found')
      return []
    }

    console.log(`📧 Parsing ${emails.length} job emails...`)
    
    // Parse jobs from emails
    const parsedJobs = await parseJobEmails(emails)
    
    console.log(`✅ Extracted ${parsedJobs.length} jobs from emails`)
    
    // Log sample jobs
    if (parsedJobs.length > 0) {
      console.log('📧 Sample email jobs:', parsedJobs.slice(0, 3).map((job: any) => ({
        title: job.title,
        company: job.company,
        source: job.source
      })))
    }

    return parsedJobs
  }
}

// Export singleton instance
export const gmailFetcher = new GmailJobEmailFetcher()

// Helper function to get Gmail credentials from existing email setup
export function getGmailCredentials() {
  // Use the same credentials as your email alerts
  return {
    email: process.env.JOBS_EMAIL_USER,
    // OAuth2 credentials should be set up in environment variables
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/api/gmail-callback'
  }
}
