// Smart ATS Matching with synonym detection and weighted scoring

export interface KeywordGroup {
  primary: string
  synonyms: string[]
  weight: number // 1-5, 5 being most important
  category: string
}

export const federalGRCKeywords: KeywordGroup[] = [
  // Critical Federal Terms (Balanced Weights)
  {
    primary: 'fedramp',
    synonyms: ['fed ramp', 'federal risk and authorization management program'],
    weight: 4,
    category: 'framework'
  },
  {
    primary: 'ato',
    synonyms: ['authorization to operate', 'authority to operate', 'ato process'],
    weight: 4,
    category: 'authorization'
  },
  {
    primary: 'poam',
    synonyms: ['poa&m', 'plan of action and milestones', 'plan of actions and milestones', 'poams'],
    weight: 4,
    category: 'documentation'
  },
  {
    primary: 'ssp',
    synonyms: ['system security plan', 'system security plans', 'ssps'],
    weight: 4,
    category: 'documentation'
  },
  {
    primary: 'rmf',
    synonyms: ['risk management framework', 'nist rmf', 'rmf process'],
    weight: 4,
    category: 'framework'
  },
  {
    primary: 'fisma',
    synonyms: ['federal information security management act', 'fisma compliance'],
    weight: 4,
    category: 'framework'
  },
  
  // NIST Standards
  {
    primary: 'nist 800-53',
    synonyms: ['nist sp 800-53', '800-53', 'nist 80053', 'sp 800-53', 'nist controls'],
    weight: 4,
    category: 'standard'
  },
  {
    primary: 'nist 800-37',
    synonyms: ['nist sp 800-37', '800-37', 'nist 80037', 'sp 800-37'],
    weight: 3,
    category: 'standard'
  },
  
  // Commercial Frameworks (Increased Importance)
  {
    primary: 'iso 27001',
    synonyms: ['iso27001', 'iso 27001:2013', 'iso 27001:2022', 'iso 27000 series'],
    weight: 4,
    category: 'framework'
  },
  {
    primary: 'soc 2',
    synonyms: ['soc2', 'soc ii', 'soc 2 type 2', 'soc 2 type ii', 'ssae 18'],
    weight: 4,
    category: 'framework'
  },
  {
    primary: 'pci dss',
    synonyms: ['pci-dss', 'pci', 'payment card industry', 'pci compliance'],
    weight: 4,
    category: 'framework'
  },
  {
    primary: 'hipaa',
    synonyms: ['health insurance portability and accountability act', 'hitrust'],
    weight: 4,
    category: 'framework'
  },
  {
    primary: 'gdpr',
    synonyms: ['general data protection regulation', 'privacy regulation'],
    weight: 3,
    category: 'framework'
  },
  
  // Risk Management (High Value)
  {
    primary: 'risk assessment',
    synonyms: ['risk assessments', 'security risk assessment', 'risk analysis', 'risk register', 'risk appetite', 'managing risk', 'risk management'],
    weight: 5,
    category: 'process'
  },
  {
    primary: 'compliance audits',
    synonyms: ['compliance audit', 'security audits', 'audit management', 'managing audits', 'oversight of audits', 'audit oversight', 'audit compliance'],
    weight: 5,
    category: 'process'
  },
  {
    primary: 'penetration testing',
    synonyms: ['penetration testing', 'pen testing', 'pentest', 'ethical hacking', 'security testing', 'vulnerability testing', 'overseeing penetration testing', 'pentest oversight'],
    weight: 4,
    category: 'process'
  },
  {
    primary: 'vulnerability scanning',
    synonyms: ['vulnerability scans', 'vulnerability scanning', 'vulnerability assessment', 'vulnerability management', 'handling vulnerability scans', 'vulnerability reporting', 'scan management'],
    weight: 4,
    category: 'process'
  },
  {
    primary: 'security awareness',
    synonyms: ['cybersecurity awareness', 'security awareness training', 'awareness initiatives', 'security training', 'awareness programs', 'cyber awareness'],
    weight: 3,
    category: 'process'
  },
  {
    primary: 'incident response',
    synonyms: ['incident response', 'security incident response', 'ir', 'incident handling', 'on-call incident response', 'security incidents', 'emergency response'],
    weight: 4,
    category: 'process'
  },
  {
    primary: 'third party risk',
    synonyms: ['tpr', 'tprm', 'vendor risk', 'vendor assessment', 'supply chain risk'],
    weight: 5,
    category: 'process'
  },
  {
    primary: 'control testing',
    synonyms: ['control validation', 'control effectiveness', 'audit testing', 'internal audit'],
    weight: 4,
    category: 'process'
  },

  // Technical & Engineering (Boosted for "Full Gamut")
  {
    primary: 'cloud security',
    synonyms: ['cloud infrastructure', 'aws security', 'azure security', 'gcp security'],
    weight: 4,
    category: 'cloud'
  },
  {
    primary: 'aws',
    synonyms: ['amazon web services', 'aws cloud'],
    weight: 3,
    category: 'cloud'
  },
  {
    primary: 'azure',
    synonyms: ['microsoft azure', 'azure cloud'],
    weight: 3,
    category: 'cloud'
  },
  {
    primary: 'python',
    synonyms: ['python scripting', 'automation', 'scripting'],
    weight: 3,
    category: 'technical'
  },
  {
    primary: 'siem',
    synonyms: ['splunk', 'datadog', 'sumo logic', 'log analysis'],
    weight: 3,
    category: 'technical'
  },
  
  // Tools and Platforms
  {
    primary: 'grc tools',
    synonyms: ['servicenow', 'archer', 'metricstream', 'logicgate', 'auditboard', 'drata', 'vanta'],
    weight: 3,
    category: 'tool'
  },
  {
    primary: 'jira',
    synonyms: ['atlassian jira', 'jira software', 'confluence'],
    weight: 2,
    category: 'tool'
  },
  
  // Certifications
  {
    primary: 'cissp',
    synonyms: ['certified information systems security professional'],
    weight: 4,
    category: 'certification'
  },
  {
    primary: 'cism',
    synonyms: ['certified information security manager'],
    weight: 4,
    category: 'certification'
  },
  {
    primary: 'cisa',
    synonyms: ['certified information systems auditor'],
    weight: 3,
    category: 'certification'
  },
  {
    primary: 'crisc',
    synonyms: ['certified in risk and information systems control'],
    weight: 3,
    category: 'certification'
  },
  {
    primary: 'ccsp',
    synonyms: ['certified cloud security professional'],
    weight: 3,
    category: 'certification'
  }
]

export function smartMatch(jobDescription: string, resumeContent: string): {
  matchScore: number
  foundKeywords: string[]
  missingKeywords: string[]
  criticalMissing: string[]
  details: Array<{keyword: string, found: boolean, weight: number, category: string}>
} {
  const jd = jobDescription.toLowerCase()
  const resume = resumeContent.toLowerCase()
  
  // Enhanced context matching - look for action verbs + concepts
  const contextMatches = [
    // Managing/overseeing + security concepts
    { pattern: /\b(managing|oversight|overseeing|handling|coordinating|leading)\s+(security|compliance|audit|penetration|vulnerability|risk)/, keywords: ['compliance audits', 'penetration testing', 'vulnerability scanning', 'risk assessment'] },
    // Participation in security initiatives
    { pattern: /\b(participating|participated|participate)\s+(in\s+)?(cybersecurity|security)\s+(awareness|training|initiatives)/, keywords: ['security awareness'] },
    // On-call responsibilities
    { pattern: /\b(on-?call|on call)\s+(responsibilities|duties|support|incident)/, keywords: ['incident response'] },
    // Vulnerability scanning and reporting
    { pattern: /\b(vulnerability\s+(scans|scanning|scan|assessment|management))\s+(and\s+)?(reporting|reports)/, keywords: ['vulnerability scanning'] },
    // Penetration testing process familiarity
    { pattern: /\b(familiar|familiarity)\s+(with\s+)?(the\s+)?(penetration\s+testing|pentest|pen\s+test)\s+(process|procedures|roe)/, keywords: ['penetration testing'] },
    // Compliance audit management
    { pattern: /\b(managing|manage|handled|handling)\s+(security\s+)?(compliance\s+)?(audits|audit)/, keywords: ['compliance audits'] }
  ]
  
  const details: Array<{keyword: string, found: boolean, weight: number, category: string}> = []
  let totalWeight = 0
  let matchedWeight = 0
  
  // Check context matches first
  contextMatches.forEach(match => {
    const jdMatch = match.pattern.test(jd)
    const resumeMatch = match.pattern.test(resume)
    
    if (jdMatch) {
      match.keywords.forEach(keyword => {
        const group = federalGRCKeywords.find(g => g.primary === keyword)
        if (group) {
          totalWeight += group.weight
          
          // Enhanced resume matching - check multiple patterns
          let inResume = false
          
          // 1. Check direct keyword matches
          if ([group.primary, ...group.synonyms].some(term => resume.includes(term))) {
            inResume = true
          }
          // 2. Check context pattern matches in resume
          else if (resumeMatch) {
            inResume = true
          }
          // 3. Check for broader concept matches
          else if (keyword === 'compliance audits' && 
                  (/\b(compliance|audit|auditing|audits)\b/.test(resume) ||
                   /\b(managing|handle|lead|coordinate)\b.*\b(audit|compliance)\b/.test(resume))) {
            inResume = true
          }
          else if (keyword === 'security awareness' && 
                  (/\b(awareness|training|education|initiatives)\b.*\b(security|cybersecurity)\b/.test(resume) ||
                   /\b(security|cybersecurity)\b.*\b(awareness|training|education)\b/.test(resume))) {
            inResume = true
          }
          
          if (inResume) {
            matchedWeight += group.weight
          }
          
          details.push({
            keyword: group.primary,
            found: inResume,
            weight: group.weight,
            category: group.category
          })
        }
      })
    }
  })
  
  federalGRCKeywords.forEach(group => {
    // Check if keyword or any synonym appears in job description
    const inJob = [group.primary, ...group.synonyms].some(term => jd.includes(term))
    
    if (inJob) {
      totalWeight += group.weight
      
      // Check if keyword or any synonym appears in resume
      const inResume = [group.primary, ...group.synonyms].some(term => resume.includes(term))
      
      if (inResume) {
        matchedWeight += group.weight
      }
      
      // Avoid duplicates from context matching
      if (!details.find(d => d.keyword === group.primary)) {
        details.push({
          keyword: group.primary,
          found: inResume,
          weight: group.weight,
          category: group.category
        })
      }
    }
  })
  
  const matchScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0
  
  const foundKeywords = details.filter(d => d.found).map(d => d.keyword)
  const missingKeywords = details.filter(d => !d.found).map(d => d.keyword)
  const criticalMissing = details.filter(d => !d.found && d.weight >= 4).map(d => d.keyword)
  
  return {
    matchScore,
    foundKeywords,
    missingKeywords,
    criticalMissing,
    details
  }
}

export function enhanceResumeWithKeywords(
  resumeContent: string,
  missingKeywords: string[],
  jobDescription: string
): string {
  // Generate concise, natural enhancements that integrate seamlessly
  const enhancements: string[] = []
  
  // Group missing keywords by category
  const missingByCategory: Record<string, string[]> = {}
  
  federalGRCKeywords.forEach(group => {
    if (missingKeywords.includes(group.primary)) {
      if (!missingByCategory[group.category]) {
        missingByCategory[group.category] = []
      }
      missingByCategory[group.category].push(group.primary)
    }
  })
  
  // Generate concise, natural enhancements
  if (missingByCategory['authorization']?.length > 0) {
    enhancements.push('• Led FedRAMP ATO activities and continuous monitoring for federal systems')
  }
  
  if (missingByCategory['documentation']?.length > 0) {
    enhancements.push('• Developed System Security Plans (SSPs), POA&Ms, and security assessment reports')
  }
  
  if (missingByCategory['framework']?.length > 0) {
    const frameworks = missingByCategory['framework'].slice(0, 3).join(', ')
    enhancements.push(`• Applied ${frameworks} requirements to security control implementation`)
  }
  
  if (missingByCategory['process']?.length > 0) {
    enhancements.push('• Conducted security assessments and implemented continuous monitoring programs')
  }
  
  if (missingByCategory['risk']?.length > 0) {
    enhancements.push('• Managed risk assessment programs and security control validation')
  }
  
  if (missingByCategory['technical']?.length > 0) {
    const techSkills = missingByCategory['technical'].slice(0, 2).join(', ')
    enhancements.push(`• Utilized ${techSkills} for security operations and compliance monitoring`)
  }
  
  if (missingByCategory['certification']?.length > 0) {
    const certs = missingByCategory['certification'].slice(0, 2).join(', ')
    enhancements.push(`• Maintained ${certs} certifications and related compliance expertise`)
  }
  
  // Limit to 3-4 most impactful enhancements
  return enhancements.slice(0, 4).join('\n')
}
