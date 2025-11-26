// Gmail Job Email Fetcher - OAuth2 Read-Only Implementation
import { parseJobEmails } from './emailJobParser'
import type { JobPosting } from './jobScanner'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var: ${name}`)
  }
  return value
}

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
  private accessToken: string | null = null

  constructor() {
    console.warn('📧 Gmail fetcher initialized - OAuth2 read-only mode')
  }

  // ================================================================
  // PHASE 1: AUTHENTICATION
  // ================================================================
  async authenticate(): Promise<boolean> {
    try {
      console.warn('🔐 GMAIL: Starting OAuth2 authentication...')
      
      // Check for required environment variables
      const clientId = requireEnv('GOOGLE_CLIENT_ID')
      const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET')
      const redirectUri = requireEnv('GOOGLE_REDIRECT_URI')
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

      console.warn('🔐 GMAIL: OAuth2 config present', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        redirectUri,
        hasRefreshToken: !!refreshToken
      })

      if (!refreshToken) {
        console.warn('⚠️ GMAIL: No refresh token - user needs to authorize')
        return false
      }

      // Exchange refresh token for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('❌ GMAIL: Token exchange failed', errorText)
        return false
      }

      const tokenData = await tokenResponse.json()
      this.accessToken = tokenData.access_token

      console.warn('✅ GMAIL: OAuth2 authentication successful')
      return true

    } catch (error) {
      console.error('❌ GMAIL: Authentication failed:', error)
      return false
    }
  }

  // ================================================================
  // PHASE 2: EMAIL FETCHING
  // ================================================================
  async fetchJobEmails(daysBack: number = 7): Promise<ParsedEmail[]> {
    if (!this.accessToken) {
      const authResult = await this.authenticate()
      if (!authResult) {
        throw new Error('Gmail authentication failed - check GOOGLE_REFRESH_TOKEN')
      }
    }

    console.warn(`📧 GMAIL: Fetching job emails from last ${daysBack} days...`)
    
    try {
      // Calculate date filter (7 days ago)
      const afterDate = new Date()
      afterDate.setDate(afterDate.getDate() - daysBack)
      const afterTimestamp = Math.floor(afterDate.getTime() / 1000)

      // Build Gmail search query for job alerts
      // Search for job alert emails with broader patterns
      const searchQuery = `after:${afterTimestamp} (subject:"job alert" OR subject:"new jobs" OR subject:"jobs you may like" OR subject:"job recommendations" OR subject:"based on your profile" OR from:linkedin.com OR from:indeed.com OR from:lensa.com OR from:"LinkedIn Jobs" OR from:"LinkedIn")`

      console.warn('🔍 GMAIL: Search query:', searchQuery)

      // Search messages
      const searchResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text()
        console.error('❌ GMAIL: Search failed', errorText)
        throw new Error(`Gmail search failed: ${searchResponse.status}`)
      }

      const searchData = await searchResponse.json()
      const messageIds = searchData.messages || []

      console.warn(`📧 GMAIL: Found ${messageIds.length} potential job alert emails`)
      
      // Log first few email subjects for debugging
      if (messageIds.length > 0) {
        console.warn('📧 GMAIL: Sample email subjects:')
        for (let i = 0; i < Math.min(3, messageIds.length); i++) {
          try {
            const previewResponse = await fetch(
              `https://www.googleapis.com/gmail/v1/users/me/messages/${messageIds[i].id}?format=metadata`,
              {
                headers: {
                  'Authorization': `Bearer ${this.accessToken}`
                }
              }
            )
            if (previewResponse.ok) {
              const preview = await previewResponse.json()
              const subject = preview.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'No subject'
              const from = preview.payload.headers.find((h: any) => h.name === 'From')?.value || 'No from'
              console.warn(`   ${i + 1}. ${subject} (from: ${from})`)
            }
          } catch (error) {
            console.warn(`   ${i + 1}. Error fetching preview`)
          }
        }
      }

      if (messageIds.length === 0) {
        console.warn('📧 GMAIL: No job alert emails found')
        return []
      }

      // Fetch full message details
      const emails: ParsedEmail[] = []
      
      for (const messageRef of messageIds.slice(0, 50)) { // Limit to 50 most recent
        try {
          const messageResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}?format=full`,
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            }
          )

          if (!messageResponse.ok) {
            console.warn(`⚠️ GMAIL: Failed to fetch message ${messageRef.id}`)
            continue
          }

          const messageData = await messageResponse.json()
          const parsedEmail = this.parseMessage(messageData)
          
          if (parsedEmail) {
            emails.push(parsedEmail)
          }
        } catch (error) {
          console.warn(`⚠️ GMAIL: Error processing message ${messageRef.id}:`, error)
        }
      }

      console.warn(`✅ GMAIL: Successfully fetched ${emails.length} job alert emails`)
      return emails

    } catch (error) {
      console.error('❌ GMAIL: Fetch error:', error)
      throw error
    }
  }

  // ================================================================
  // PHASE 3: MESSAGE PARSING
  // ================================================================
  private parseMessage(message: any): ParsedEmail | null {
    try {
      // Extract headers
      const headers = message.payload.headers
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
      const from = headers.find((h: any) => h.name === 'From')?.value || ''
      const date = headers.find((h: any) => h.name === 'Date')?.value || ''

      // Extract body content
      const body = this.extractBody(message.payload)

      return {
        id: message.id,
        from,
        subject,
        body,
        date,
        snippet: message.snippet
      }
    } catch (error) {
      console.error('❌ GMAIL: Error parsing message:', error)
      return null
    }
  }

  private extractBody(payload: any): string {
    try {
      // If body has data directly
      if (payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString()
      }

      // If message has parts, extract text from parts
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString()
          }
          if (part.mimeType === 'text/html' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString()
          }
        }
      }

      return ''
    } catch (error) {
      console.error('❌ GMAIL: Error extracting body:', error)
      return ''
    }
  }

  // ================================================================
  // PHASE 4: JOB EXTRACTION
  // ================================================================
  async extractJobsFromEmails(daysBack: number = 30): Promise<Partial<JobPosting>[]> {
    console.warn(`📧 GMAIL: Extracting jobs from emails (last ${daysBack} days)...`)
    
    try {
      const emails = await this.fetchJobEmails(daysBack)
      
      if (emails.length === 0) {
        console.warn('📧 GMAIL: No job emails found to parse')
        return []
      }

      console.warn(`📧 GMAIL: Parsing ${emails.length} job alert emails...`)
      
      // Parse jobs from emails using existing parser
      const parsedJobs = await parseJobEmails(emails) as Partial<JobPosting>[]
      
      console.warn(`✅ GMAIL: Extracted ${parsedJobs.length} jobs from emails`)
      
      // Log sample jobs
      if (parsedJobs.length > 0) {
        console.warn('📧 GMAIL: Sample email jobs:', parsedJobs.slice(0, 3).map((job: any) => ({
          title: job.title,
          company: job.company,
          source: job.source
        })))
      }

      return parsedJobs

    } catch (error) {
      console.error('❌ GMAIL: Job extraction failed:', error)
      
      if (error instanceof Error && error.message.includes('authentication failed')) {
        console.warn('⚠️ EMAIL ALERTS: Authentication failed - check GOOGLE_REFRESH_TOKEN')
      }
      
      return []
    }
  }
}

// Export singleton instance
export const gmailFetcher = new GmailJobEmailFetcher()

// Export main function for Phase 1 integration
export async function gatherEmailAlertJobs(): Promise<Partial<JobPosting>[]> {
  console.warn('🚨 PHASE 1 EMAIL ALERTS: Starting job extraction...')
  
  try {
    const jobs = await gmailFetcher.extractJobsFromEmails(7) // Last 7 days
    
    if (jobs.length === 0) {
      console.warn('📧 PHASE 1 EMAIL ALERTS: No jobs found in emails')
    } else {
      console.warn(`✅ PHASE 1 EMAIL ALERTS: ${jobs.length} jobs extracted from emails`)
    }
    
    return jobs
    
  } catch (error) {
    console.error('❌ PHASE 1 EMAIL ALERTS FAILED:', error)
    
    if (error instanceof Error && error.message.includes('Missing env var')) {
      console.warn('❌ EMAIL ALERTS: Disabled. Missing Google OAuth credentials')
      console.warn('   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN')
    }
    
    // Don't crash the scan - return empty array
    return []
  }
}
