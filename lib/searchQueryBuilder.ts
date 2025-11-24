import { SECURITY_JOB_TITLES } from './jobTitles'

/**
 * Analyzes resume content to generate tailored search queries
 * This ensures we search for roles the user is actually qualified for
 */
export function generateSearchQueries(resumeContent: string): string[] {
  const resume = resumeContent.toLowerCase()
  const queries = new Set<string>()

  // CORE GRC TITLES - Always include these for breadth
  const coreGRC = [
    'GRC Analyst',
    'GRC Engineer', 
    'Governance Risk Compliance',
    'Security Compliance',
    'Risk Analyst',
    'Compliance Manager',
    'Cyber Risk',
    'Risk Management',
    'Compliance Analyst',
    'GRC Specialist',
    'Risk Consultant',
    'Compliance Officer',
    'Security Governance',
    'Risk Advisor',
    'GRC Consultant'
  ]
  coreGRC.forEach(query => queries.add(query))

  // COMPREHENSIVE CYBERSECURITY ROLES
  const cybersecurityRoles = [
    'Cybersecurity Analyst',
    'Cybersecurity Engineer',
    'Information Security Analyst',
    'Security Analyst',
    'IT Security Analyst',
    'Cybersecurity Specialist',
    'Security Engineer',
    'Information Security Engineer',
    'Cybersecurity Consultant',
    'Security Consultant',
    'IT Security Engineer',
    'Cyber Defense Analyst',
    'Threat Analyst',
    'Vulnerability Analyst',
    'Penetration Tester',
    'Security Operations Analyst',
    'SOC Analyst',
    'Cybersecurity Manager',
    'Information Security Manager'
  ]
  cybersecurityRoles.forEach(query => queries.add(query))

  // AUDIT & COMPLIANCE ROLES
  const auditRoles = [
    'IT Auditor',
    'Internal Auditor',
    'External Auditor',
    'Security Auditor',
    'IT Audit Manager',
    'Compliance Auditor',
    'SOC 2 Auditor',
    'ISO 27001 Auditor',
    'PCI DSS Auditor',
    'NIST Auditor',
    'Audit Manager',
    'Audit Consultant',
    'Controls Assurance',
    'Compliance Testing',
    'Audit Analyst'
  ]
  auditRoles.forEach(query => queries.add(query))

  // SECURITY ENGINEERING & ARCHITECTURE
  const engineeringRoles = [
    'Security Engineer',
    'Security Architect',
    'Information Security Architect',
    'Cybersecurity Architect',
    'Security Systems Engineer',
    'Application Security Engineer',
    'Network Security Engineer',
    'Cloud Security Engineer',
    'DevSecOps Engineer',
    'Security Automation Engineer',
    'Platform Security Engineer',
    'Product Security Engineer',
    'Solutions Architect Security',
    'Enterprise Security Architect'
  ]
  engineeringRoles.forEach(query => queries.add(query))

  // FEDERAL MAPPED TITLES - For private sector equivalents
  const federalMapped = [
    'ISSO',
    'ISSE', 
    'RMF Analyst',
    'ATO Analyst',
    'FedRAMP Analyst',
    'Security Controls Assessor',
    'Information Assurance',
    'IAM',
    'IAT',
    'Security Authorization'
  ]
  federalMapped.forEach(query => queries.add(query))

  // ADJACENT ROLES - Often contain GRC keywords
  const adjacentRoles = [
    'Security Program Manager',
    'Third Party Risk',
    'Vendor Risk Manager', 
    'IT Auditor',
    'Cyber Policy',
    'Privacy Analyst',
    'Controls Engineer',
    'SOC 2',
    'ISO 27001',
    'Security Analyst',
    'Information Security Manager',
    'Compliance Engineer'
  ]
  adjacentRoles.forEach(query => queries.add(query))

  // 1. Detect Cloud/Tech Experience
  if (resume.includes('aws') || resume.includes('azure') || resume.includes('gcp') || resume.includes('cloud')) {
    queries.add('Cloud Security Engineer')
    queries.add('Cloud Compliance')
    queries.add('Cloud Governance')
    queries.add('AWS Security')
    queries.add('Azure Compliance')
  }

  // 2. Detect Risk Management Focus
  if (resume.includes('risk assessment') || resume.includes('risk management') || resume.includes('third party')) {
    queries.add('Risk Management Analyst')
    queries.add('Third Party Risk')
    queries.add('IT Risk Analyst')
    queries.add('Enterprise Risk')
    queries.add('Operational Risk')
  }

  // 3. Detect Federal Experience
  if (resume.includes('fedramp') || resume.includes('fisma') || resume.includes('rmf') || resume.includes('ato')) {
    queries.add('FedRAMP Consultant')
    queries.add('Federal Security Analyst')
    queries.add('Government Compliance')
  }

  // 4. Detect Privacy
  if (resume.includes('privacy') || resume.includes('gdpr') || resume.includes('ccpa')) {
    queries.add('Privacy Engineer')
    queries.add('Data Privacy Analyst')
    queries.add('Privacy Compliance')
  }

  // 5. Detect Audit/Compliance
  if (resume.includes('audit') || resume.includes('soc 2') || resume.includes('iso 27001')) {
    queries.add('IT Auditor')
    queries.add('Security Compliance Manager')
    queries.add('Internal Auditor')
    queries.add('External Auditor')
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

  // Fallback: Add comprehensive broad terms if we don't have enough
  if (queries.size < 15) {
    const broadTerms = [
      'Information Security Analyst',
      'Cybersecurity Consultant',
      'Governance Risk Compliance',
      'IT Security Specialist',
      'Security Manager',
      'Risk Manager',
      'Compliance Manager',
      'Security Administrator',
      'Cybersecurity Specialist',
      'Information Security Officer',
      'Security Analyst',
      'IT Auditor',
      'Security Engineer',
      'Risk Analyst',
      'Compliance Analyst'
    ]
    broadTerms.forEach(query => queries.add(query))
  }

  // Convert to array and randomize slightly to ensure variety
  // (Instead of just sorting by 'Engineer', we want a mix)
  return Array.from(queries).sort(() => Math.random() - 0.5)
}
