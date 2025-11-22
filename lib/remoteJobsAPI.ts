/**
 * Remote Job Boards Integration (RemoteOK, WeWorkRemotely, etc.)
 * These often provide RSS or JSON feeds that are easier to consume than scraping.
 */

export interface RemoteJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: 'remoteok' | 'weworkremotely' | 'other'
  postedDate: string
  salary?: string
  tags: string[]
}

/**
 * Search RemoteOK (Public API)
 * Note: RemoteOK API returns all jobs, we filter client-side.
 * API: https://remoteok.com/api
 */
export async function searchRemoteOK(keywords: string[]): Promise<RemoteJob[]> {
  try {
    // RemoteOK supports tag filtering in URL: https://remoteok.com/api?tag=security
    const response = await fetch('https://remoteok.com/api?tag=security')
    
    if (!response.ok) {
      console.warn('RemoteOK fetch failed:', response.status)
      return []
    }

    const data = await response.json()
    // First item is legal text, skip it
    const jobs = data.slice(1)

    // Filter by our specific keywords if provided
    const filtered = jobs.filter((job: any) => {
      const text = (job.title + ' ' + job.description).toLowerCase()
      return keywords.some(k => text.includes(k.toLowerCase()))
    })

    return filtered.map((job: any) => ({
      id: `remoteok-${job.id}`,
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      description: job.description,
      url: job.url,
      source: 'remoteok',
      postedDate: job.date,
      salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : undefined,
      tags: job.tags || []
    }))
  } catch (error) {
    console.error('Error fetching RemoteOK:', error)
    return []
  }
}

/**
 * Fetch from WeWorkRemotely (RSS/XML parsed to JSON ideally, or their JSON endpoint if available)
 * WWR has a specific RSS feed for Programming and DevOps/Sysadmin
 * https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss
 * 
 * For client-side without a proxy, we might hit CORS. 
 * We'll try a known public CORS proxy for RSS if needed, or fetch their JSON if they have one.
 * Actually WWR does not have a public JSON API documented that allows CORS easily.
 * We will stick to RemoteOK for now as it's more reliable for client-side.
 */

/**
 * Aggregator function
 */
export async function searchRemoteJobs(keywords: string[]): Promise<RemoteJob[]> {
  const allJobs: RemoteJob[] = []
  
  // Run in parallel
  const [remoteOkJobs] = await Promise.all([
    searchRemoteOK(keywords)
  ])
  
  return [...remoteOkJobs]
}
