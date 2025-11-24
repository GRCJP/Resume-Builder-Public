// Define PartialJobPosting interface locally to avoid import issues
interface PartialJobPosting {
  id: string
  title: string
  company: string
  location?: string
  url?: string
  description?: string
  source: string
  postedDate?: string
  salary?: string
  remote?: boolean
  matchScore?: number
  scannedAt?: string
  applyUrl?: string
  requiresLogin?: boolean
  verifiedAt?: string
  linkStatus?: number
}

interface EmailJobSource {
  name: string
  domains: string[]
  patterns: {
    subject: RegExp[]
    sender: RegExp[]
  }
  parser: (email: any) => PartialJobPosting[]
}

export const EMAIL_JOB_SOURCES: EmailJobSource[] = [
  {
    name: 'Lensa',
    domains: ['lensa.com', 'lensa.ai'],
    patterns: {
      subject: [/job alert/i, /new jobs/i, /job recommendations/i],
      sender: [/lensa/i, /noreply@lensa/i]
    },
    parser: parseLensaEmail
  },
  {
    name: 'LinkedIn',
    domains: ['linkedin.com'],
    patterns: {
      subject: [/job alert/i, /you may be a fit/i, /new job/i, /job recommendations/i],
      sender: [/notifications@linkedin/i, /job-alerts@linkedin/i, /messaging-noreply@linkedin/i]
    },
    parser: parseLinkedInEmail
  },
  {
    name: 'Indeed',
    domains: ['indeed.com'],
    patterns: {
      subject: [/new job postings/i, /job alert/i, /jobs you may be interested in/i],
      sender: [/indeed@indeed.com/i, /alerts@indeed.com/i]
    },
    parser: parseIndeedEmail
  }
]

function parseLensaEmail(email: any): PartialJobPosting[] {
  const jobs: PartialJobPosting[] = []
  const { subject, body, date } = email
  
  try {
    // Extract job listings from Lensa email body
    // Lensa typically has structured job sections with titles, companies, and links
    
    const jobSections = body.split(/(?:Job \d+|📍|💼|🔍)/).filter((section: string) => 
      section.includes('Apply') || section.includes('http')
    )
    
    jobSections.forEach((section: string, index: number) => {
      // Extract job title (usually bold or at start)
      const titleMatch = section.match(/\*\*(.*?)\*\*|^(.{5,60})$/m)
      const title = titleMatch ? titleMatch[1] || titleMatch[2].trim() : ''
      
      // Extract company name
      const companyMatch = section.match(/(?:at|@)\s*([A-Za-z0-9\s&\-\.]+(?:Inc|LLC|Corp|Company)?)/i) ||
                          section.match(/([A-Za-z0-9\s&\-\.]+(?:Inc|LLC|Corp|Company)?)(?:\s+is|\s+has)/i)
      const company = companyMatch ? companyMatch[1].trim() : ''
      
      // Extract location
      const locationMatch = section.match(/(?:Location|📍)\s*[:\-]?\s*([A-Za-z\s,\.]+)/i) ||
                           section.match(/([A-Za-z\s,]+),\s*[A-Z]{2}/)
      const location = locationMatch ? locationMatch[1].trim() : ''
      
      // Extract application URL
      const urlMatch = section.match(/(https?:\/\/[^\s\)]+lensa[^\s\)]*)/i) ||
                      section.match(/(https?:\/\/[^\s\)]+apply[^\s\)]*)/i)
      const url = urlMatch ? urlMatch[1] : ''
      
      // Extract salary if available
      const salaryMatch = section.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?/i) ||
                          section.match(/(\d{1,2}[,\d]*k?\s*-\s*\d{1,2}[,\d]*k?)/i)
      const salary = salaryMatch ? salaryMatch[0] : ''
      
      if (title && company) {
        jobs.push({
          id: `lensa-${Date.now()}-${index}`,
          title: title.trim(),
          company: company.trim(),
          location: location || 'Remote',
          url: url,
          description: section.substring(0, 200) + '...',
          source: 'lensa-email',
          postedDate: date,
          salary: salary,
          remote: location.toLowerCase().includes('remote'),
          scannedAt: new Date().toISOString()
        })
      }
    })
  } catch (error) {
    console.error('❌ Error parsing Lensa email:', error)
  }
  
  return jobs
}

function parseLinkedInEmail(email: any): PartialJobPosting[] {
  const jobs: PartialJobPosting[] = []
  const { subject, body, date } = email
  
  try {
    // LinkedIn emails often have job cards with structured data
    const jobMatches = body.match(/(?:🔍|💼|📍).*?https?:\/\/[^\s\)]+/gi) || []
    
    jobMatches.forEach((jobText: string, index: number) => {
      // Extract title (usually first line)
      const lines = jobText.split('\n').filter((line: string) => line.trim())
      const title = lines[0]?.replace(/[🔍💼📍]\s*/, '').trim() || ''
      
      // Extract company (often after "at" or second line)
      const companyMatch = jobText.match(/(?:at|@)\s*([A-Za-z0-9\s&\-\.]+)/i) ||
                          lines[1]?.match(/^([A-Za-z0-9\s&\-\.]+)$/)
      const company = companyMatch ? companyMatch[1].trim() : ''
      
      // Extract location
      const locationMatch = jobText.match(/(?:Location|📍)\s*[:\-]?\s*([A-Za-z\s,\.]+)/i) ||
                           jobText.match(/([A-Za-z\s,]+),\s*[A-Z]{2}/)
      const location = locationMatch ? locationMatch[1].trim() : ''
      
      // Extract LinkedIn URL
      const urlMatch = jobText.match(/(https?:\/\/www\.linkedin\.com\/jobs\/view\/[^\s\)]+)/i) ||
                      jobText.match(/(https?:\/\/www\.linkedin\.com\/jobs\/[^?\s\)]+)/i)
      const url = urlMatch ? urlMatch[1] : ''
      
      if (title && company) {
        jobs.push({
          id: `linkedin-${Date.now()}-${index}`,
          title: title.trim(),
          company: company.trim(),
          location: location || 'Remote',
          url: url,
          description: jobText.substring(0, 200) + '...',
          source: 'linkedin-email',
          postedDate: date,
          scannedAt: new Date().toISOString()
        })
      }
    })
  } catch (error) {
    console.error('❌ Error parsing LinkedIn email:', error)
  }
  
  return jobs
}

function parseIndeedEmail(email: any): PartialJobPosting[] {
  const jobs: PartialJobPosting[] = []
  const { subject, body, date } = email
  
  try {
    // Indeed emails have job listings with clear structure
    const jobBlocks = body.split(/(?:Job \d+|•)/).filter((block: string) => 
      block.includes('indeed.com/jobs') || block.includes('Apply Now')
    )
    
    jobBlocks.forEach((block: string, index: number) => {
      // Extract job title
      const titleMatch = block.match(/^(.{5,60})$/m) ||
                        block.match(/\*\*(.*?)\*\*/)
      const title = titleMatch ? titleMatch[1].trim() : ''
      
      // Extract company
      const companyMatch = block.match(/(?:at|@)\s*([A-Za-z0-9\s&\-\.]+(?:Inc|LLC|Corp)?)/i) ||
                          block.match(/([A-Za-z0-9\s&\-\.]+(?:Inc|LLC|Corp)?)(?:\s+is|\s+has|\s+-)/i)
      const company = companyMatch ? companyMatch[1].trim() : ''
      
      // Extract location
      const locationMatch = block.match(/(?:Location|📍)\s*[:\-]?\s*([A-Za-z\s,\.]+)/i) ||
                           block.match(/([A-Za-z\s,]+),\s*[A-Z]{2}/)
      const location = locationMatch ? locationMatch[1].trim() : ''
      
      // Extract Indeed URL
      const urlMatch = block.match(/(https?:\/\/www\.indeed\.com\/jobs\?[^\s\)]+)/i) ||
                      block.match(/(https?:\/\/indeed\.com\/jobs\?[^\s\)]+)/i)
      const url = urlMatch ? urlMatch[1] : ''
      
      if (title && company) {
        jobs.push({
          id: `indeed-${Date.now()}-${index}`,
          title: title.trim(),
          company: company.trim(),
          location: location || 'Remote',
          url: url,
          description: block.substring(0, 200) + '...',
          source: 'indeed-email',
          postedDate: date,
          scannedAt: new Date().toISOString()
        })
      }
    })
  } catch (error) {
    console.error('❌ Error parsing Indeed email:', error)
  }
  
  return jobs
}

export async function parseJobEmails(emails: any[]): Promise<PartialJobPosting[]> {
  const allJobs: PartialJobPosting[] = []
  
  for (const email of emails) {
    // Identify email source
    const source = EMAIL_JOB_SOURCES.find(s => 
      s.patterns.subject.some(pattern => pattern.test(email.subject)) &&
      s.patterns.sender.some(pattern => pattern.test(email.from))
    )
    
    if (source) {
      console.log(`🔍 Parsing ${source.name} email: ${email.subject}`)
      const jobs = source.parser(email)
      allJobs.push(...jobs)
      console.log(`✅ Extracted ${jobs.length} jobs from ${source.name} email`)
    }
  }
  
  console.log(`📊 Total jobs extracted from emails: ${allJobs.length}`)
  return allJobs
}

export async function fetchJobEmails(daysBack: number = 7): Promise<any[]> {
  try {
    // This would integrate with your existing Gmail system
    // For now, return mock structure - you'd replace with actual Gmail API calls
    
    const mockEmails = [
      {
        id: '1',
        from: 'noreply@lensa.com',
        subject: 'New job opportunities for you!',
        body: 'Job 1: **Senior GRC Analyst** at TechCorp Inc. Location: Remote. Apply: https://lensa.com/job/123',
        date: new Date().toISOString()
      },
      {
        id: '2', 
        from: 'notifications@linkedin.com',
        subject: 'You may be a fit for these roles',
        body: '🔍 Security Compliance Manager at DefenseTech. Location: Washington DC. https://linkedin.com/jobs/view/456',
        date: new Date().toISOString()
      }
    ]
    
    return mockEmails
  } catch (error) {
    console.error('❌ Error fetching job emails:', error)
    return []
  }
}
