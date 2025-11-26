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
      subject: [/job alert/i, /you may be a fit/i, /new job/i, /job recommendations/i, /consultant/i, /analyst/i, /engineer/i, /manager/i, /director/i, /specialist/i],
      sender: [/notifications@linkedin/i, /job-alerts@linkedin/i, /jobalerts@linkedin/i, /messaging-noreply@linkedin/i, /linkedin/i]
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
    console.warn('📧 LinkedIn parser: Analyzing email body...')
    
    // LinkedIn emails have a specific structure with job listings
    // Look for job entries that have title, company, location, and URL
    
    // Method 1: Look for structured job sections with clear patterns
    const jobPattern = /([^\n•]+(?:Consultant|Analyst|Engineer|Manager|Director|Specialist|Developer|Administrator|Coordinator|Associate)[^\n•]*)\s*([^\n•]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|AI|Tech|Solutions|Systems|Group|Services|Security|Focus|Platform)[^\n•]*)\s*([^\n•,]+(?:United States|USA|Remote|Hybrid|On-site|Location)[^\n•]*)\s*(https:\/\/www\.linkedin\.com\/[^\s\n]+)/gi
    
    let match
    while ((match = jobPattern.exec(body)) !== null) {
      const [fullMatch, title, company, location, url] = match
      
      // Clean up the extracted data
      const cleanTitle = title.replace(/^\s*[\n•]+\s*/, '').trim()
      const cleanCompany = company.replace(/^\s*[\n•]+\s*/, '').trim()
      const cleanLocation = location.replace(/^\s*[\n•]+\s*/, '').trim()
      const cleanUrl = url.trim()
      
      console.warn(`📧 LinkedIn parser: Found job - ${cleanTitle} at ${cleanCompany}`)
      
      if (cleanTitle && cleanUrl) {
        jobs.push({
          id: `linkedin-${Date.now()}-${jobs.length}`,
          title: cleanTitle,
          company: cleanCompany || 'LinkedIn Job Alert',
          location: cleanLocation || 'Remote',
          url: cleanUrl,
          description: `Job found in LinkedIn email alert: ${cleanTitle}`,
          source: 'linkedin-email',
          postedDate: date,
          scannedAt: new Date().toISOString()
        })
      }
    }
    
    // Method 2: Look for "View job:" links with preceding context (this is the main pattern)
    if (jobs.length === 0) {
      console.warn('📧 LinkedIn parser: Trying "View job:" pattern...')
      const viewJobPattern = /View job:\s*(https:\/\/www\.linkedin\.com\/comm\/jobs\/view\/[^\s\n]+)/gi
      
      let match
      while ((match = viewJobPattern.exec(body)) !== null) {
        const url = match[1]
        
        // Look backwards from the URL to find job information
        const urlIndex = body.indexOf(url)
        const contextStart = Math.max(0, urlIndex - 300)
        const context = body.substring(contextStart, urlIndex)
        
        // Find job title in the context (look for lines ending with job titles)
        const lines = context.split('\n').reverse()
        let title = ''
        let company = ''
        let location = ''
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          
          // Skip empty lines and common headers
          if (!trimmedLine || trimmedLine.includes('---------------------------------------------------------') || 
              trimmedLine.includes('Your job alert') || trimmedLine.includes('New jobs match')) {
            continue
          }
          
          // Try to extract job title
          const titleMatch = trimmedLine.match(/^([^\n•]*(?:Consultant|Analyst|Engineer|Manager|Director|Specialist|Developer|Administrator|Coordinator|Associate|Specialist)[^\n•]*)$/i)
          if (titleMatch && !title) {
            title = titleMatch[1].trim()
            continue
          }
          
          // Try to extract company (usually after title)
          if (title && !company) {
            const companyMatch = trimmedLine.match(/^([^\n•]*(?:Inc|LLC|Corp|Corporation|Ltd|Limited|AI|Tech|Solutions|Systems|Group|Services|Security|Focus|Platform|OVA\.Work|Astrio|J5 Co)[^\n•]*)$/i)
            if (companyMatch) {
              company = companyMatch[1].trim()
              continue
            }
          }
          
          // Try to extract location
          if (title && !location) {
            const locationMatch = trimmedLine.match(/^([^\n•]*(?:United States|USA|Remote|Hybrid|On-site|[A-Z][A-Za-z\s]+,\s*[A-Z]{2})[^\n•]*)$/i)
            if (locationMatch) {
              location = locationMatch[1].trim()
              break
            }
          }
        }
        
        // If we found at least a title, create a job entry
        if (title) {
          console.warn(`📧 LinkedIn parser: Found job via "View job:" - ${title} at ${company}`)
          
          jobs.push({
            id: `linkedin-viewjob-${Date.now()}-${jobs.length}`,
            title: title,
            company: company || 'LinkedIn Job Alert',
            location: location || 'Remote',
            url: url.trim(),
            description: `Job found in LinkedIn email alert: ${title}`,
            source: 'linkedin-email',
            postedDate: date,
            scannedAt: new Date().toISOString()
          })
        }
      }
    }
    
    // Method 3: Extract all LinkedIn URLs and find job titles nearby
    if (jobs.length === 0) {
      console.warn('📧 LinkedIn parser: Using URL-based extraction...')
      const allUrls = body.match(/https:\/\/www\.linkedin\.com\/[^\s\n]+/gi) || []
      
      allUrls.forEach((url: string, index: number) => {
        // Look for text around the URL that might contain job info
        const urlIndex = body.indexOf(url)
        const contextStart = Math.max(0, urlIndex - 200)
        const contextEnd = Math.min(body.length, urlIndex + 50)
        const context = body.substring(contextStart, contextEnd)
        
        // Try to find a job title in the context
        const titleMatch = context.match(/([^\n•]*(?:Consultant|Analyst|Engineer|Manager|Director|Specialist|Developer|Administrator|Coordinator|Associate)[^\n•]*)/i)
        const title = titleMatch ? titleMatch[1].trim() : `Job ${index + 1}`
        
        // Try to find company info
        const companyMatch = context.match(/([^\n•]*(?:Inc|LLC|Corp|AI|Tech|Solutions|Systems|Group|Services|Security|Focus|Platform)[^\n•]*)/i)
        const company = companyMatch ? companyMatch[1].trim() : 'LinkedIn Job Alert'
        
        console.warn(`📧 LinkedIn parser URL-based: ${title} at ${company}`)
        
        jobs.push({
          id: `linkedin-url-${Date.now()}-${index}`,
          title: title,
          company: company,
          location: 'Remote',
          url: url.trim(),
          description: `Job found in LinkedIn email alert: ${title}`,
          source: 'linkedin-email',
          postedDate: date,
          scannedAt: new Date().toISOString()
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Error parsing LinkedIn email:', error)
  }
  
  console.warn(`📧 LinkedIn parser: Total jobs extracted: ${jobs.length}`)
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
  
  console.warn(`📧 parseJobEmails: Processing ${emails.length} emails`)
  
  for (const email of emails) {
    console.warn(`📧 parseJobEmails: Checking email from ${email.from}`)
    
    // Identify email source
    const source = EMAIL_JOB_SOURCES.find(s => 
      s.patterns.subject.some(pattern => {
        const matches = pattern.test(email.subject)
        console.warn(`📧 parseJobEmails: Subject pattern ${pattern} matches: ${matches}`)
        return matches
      }) &&
      s.patterns.sender.some(pattern => {
        const matches = pattern.test(email.from)
        console.warn(`📧 parseJobEmails: Sender pattern ${pattern} matches: ${matches}`)
        return matches
      })
    )
    
    console.warn(`📧 parseJobEmails: Found source: ${source?.name || 'none'}`)
    
    if (source) {
      console.log(`🔍 Parsing ${source.name} email: ${email.subject}`)
      const jobs = source.parser(email)
      console.warn(`📧 parseJobEmails: Parser returned ${jobs.length} jobs`)
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
