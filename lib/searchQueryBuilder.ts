import { SECURITY_JOB_TITLES } from './jobTitles'

/**
 * Analyzes resume content to generate tailored search queries
 * This ensures we search for roles the user is actually qualified for
 */
export function generateSearchQueries(resumeContent: string): string[] {
  const resume = resumeContent.toLowerCase()
  const queries = new Set<string>()

  // Base queries that are always good for GRC
  queries.add('GRC Engineer')
  queries.add('Security Engineer') // Force broad engineering
  queries.add('Cyber Security Analyst') // Force broad analysis
  queries.add('Information Security Manager') // Force management/strategy

  // 1. Detect Cloud/Tech Experience
  if (resume.includes('aws') || resume.includes('azure') || resume.includes('gcp') || resume.includes('cloud')) {
    queries.add('Cloud Security Engineer')
    queries.add('Cloud Compliance')
  }

  // 2. Detect Risk Management Focus
  if (resume.includes('risk assessment') || resume.includes('risk management') || resume.includes('third party')) {
    queries.add('Risk Management Analyst')
    queries.add('Third Party Risk')
    queries.add('IT Risk Analyst')
  }

  // 3. Detect Federal Experience
  if (resume.includes('fedramp') || resume.includes('fisma') || resume.includes('rmf') || resume.includes('ato')) {
    queries.add('ISSO')
    queries.add('FedRAMP Consultant')
    queries.add('Security Control Assessor')
  }

  // 4. Detect Privacy
  if (resume.includes('privacy') || resume.includes('gdpr') || resume.includes('ccpa')) {
    queries.add('Privacy Engineer')
    queries.add('Data Privacy Analyst')
  }

  // 5. Detect Audit/Compliance
  if (resume.includes('audit') || resume.includes('soc 2') || resume.includes('iso 27001')) {
    queries.add('IT Auditor')
    queries.add('Compliance Analyst')
    queries.add('Security Compliance Manager')
  }

  // 6. Detect Seniority
  if (resume.includes('manager') || resume.includes('lead') || resume.includes('director')) {
    queries.add('GRC Manager')
    queries.add('Security Manager')
  } else {
    queries.add('Security Analyst') // Default entry/mid
    queries.add('Cybersecurity Analyst')
  }

  // 7. Detect Engineering/Automation
  if (resume.includes('python') || resume.includes('automation') || resume.includes('scripting')) {
    queries.add('Security Automation Engineer')
    queries.add('DevSecOps')
  }

  // Fallback: Add some broad terms if we don't have enough
  if (queries.size < 5) {
    queries.add('Information Security Analyst')
    queries.add('Cybersecurity Consultant')
    queries.add('Governance Risk Compliance')
  }

  // Convert to array and randomize slightly to ensure variety
  // (Instead of just sorting by 'Engineer', we want a mix)
  return Array.from(queries).sort(() => Math.random() - 0.5)
}
