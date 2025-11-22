// Expanded security role titles for job search and matching

export const SECURITY_JOB_TITLES = [
  // GRC & Compliance
  'GRC Engineer',
  'GRC Analyst',
  'GRC Manager',
  'GRC Consultant',
  'Compliance Engineer',
  'Compliance Analyst',
  'Security Compliance Analyst',
  'Cybersecurity Compliance',
  
  // Security Analysis
  'Security Analyst',
  'Cybersecurity Analyst',
  'Senior Security Analyst',
  'Information Security Analyst',
  'InfoSec Analyst',
  'SOC Analyst',
  'Security Operations Analyst',
  
  // Security Engineering
  'Security Engineer',
  'Senior Security Engineer',
  'Cybersecurity Engineer',
  'Information Security Engineer',
  'Cloud Security Engineer',
  'Application Security Engineer',
  'AppSec Engineer',
  'Network Security Engineer',
  
  // Specialized Roles
  'Security Architect',
  'Security Consultant',
  'IAM Engineer',
  'Identity and Access Management Engineer',
  'Penetration Tester',
  'Vulnerability Analyst',
  'Threat Intelligence Analyst',
  
  // Management
  'Security Manager',
  'Cybersecurity Manager',
  'Information Security Manager',
  'Security Team Lead',
  'Director of Security',
  
  // Federal/Compliance Specific
  'ISSO',
  'Information System Security Officer',
  'ISSM',
  'Information System Security Manager',
  'FedRAMP Engineer',
  'Authorization Engineer',
  
  // Risk Management
  'Risk Analyst',
  'Risk Management Analyst',
  'Cyber Risk Analyst',
  'Third Party Risk Analyst'
] as const

export type SecurityJobTitle = typeof SECURITY_JOB_TITLES[number]

/**
 * Get search keywords from job titles
 */
export function getSearchKeywords(): string[] {
  return [...SECURITY_JOB_TITLES]
}

/**
 * Check if a job title matches security roles
 */
export function isSecurityRole(title: string): boolean {
  const lowerTitle = title.toLowerCase()
  return SECURITY_JOB_TITLES.some(role => 
    lowerTitle.includes(role.toLowerCase())
  )
}

/**
 * Get primary job titles for search (most common)
 */
export function getPrimarySearchTitles(): string[] {
  return [
    'GRC Engineer',
    'Security Analyst',
    'Senior Security Engineer',
    'Cybersecurity Analyst',
    'Security Consultant',
    'SOC Analyst',
    'GRC Analyst',
    'InfoSec Analyst',
    'Security Architect',
    'AppSec Engineer',
    'Cloud Security Engineer',
    'IAM Engineer',
    'Security Manager',
    'Compliance Engineer'
  ]
}
