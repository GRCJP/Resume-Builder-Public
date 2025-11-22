// Smart ATS Matching with synonym detection and weighted scoring

export interface KeywordGroup {
  primary: string
  synonyms: string[]
  weight: number // 1-5, 5 being most important
  category: string
}

export const federalGRCKeywords: KeywordGroup[] = [
  // Critical Federal Terms
  {
    primary: 'fedramp',
    synonyms: ['fed ramp', 'federal risk and authorization management program'],
    weight: 5,
    category: 'framework'
  },
  {
    primary: 'ato',
    synonyms: ['authorization to operate', 'authority to operate', 'ato process'],
    weight: 5,
    category: 'authorization'
  },
  {
    primary: 'poam',
    synonyms: ['poa&m', 'plan of action and milestones', 'plan of actions and milestones', 'poams'],
    weight: 5,
    category: 'documentation'
  },
  {
    primary: 'ssp',
    synonyms: ['system security plan', 'system security plans', 'ssps'],
    weight: 5,
    category: 'documentation'
  },
  {
    primary: 'rmf',
    synonyms: ['risk management framework', 'nist rmf', 'rmf process'],
    weight: 5,
    category: 'framework'
  },
  {
    primary: 'fisma',
    synonyms: ['federal information security management act', 'fisma compliance'],
    weight: 5,
    category: 'framework'
  },
  
  // NIST Standards
  {
    primary: 'nist 800-53',
    synonyms: ['nist sp 800-53', '800-53', 'nist 80053', 'sp 800-53'],
    weight: 5,
    category: 'standard'
  },
  {
    primary: 'nist 800-37',
    synonyms: ['nist sp 800-37', '800-37', 'nist 80037', 'sp 800-37'],
    weight: 4,
    category: 'standard'
  },
  {
    primary: 'nist 800-171',
    synonyms: ['nist sp 800-171', '800-171', 'nist 80171', 'sp 800-171'],
    weight: 4,
    category: 'standard'
  },
  
  // Roles and Responsibilities
  {
    primary: 'isso',
    synonyms: ['information system security officer', 'information systems security officer', 'issos'],
    weight: 4,
    category: 'role'
  },
  {
    primary: 'issm',
    synonyms: ['information system security manager', 'information systems security manager'],
    weight: 3,
    category: 'role'
  },
  
  // Processes
  {
    primary: 'continuous monitoring',
    synonyms: ['conmon', 'ongoing monitoring', 'continuous assessment'],
    weight: 4,
    category: 'process'
  },
  {
    primary: 'security assessment',
    synonyms: ['security assessments', 'sar', 'security assessment report', 'control assessment'],
    weight: 4,
    category: 'process'
  },
  {
    primary: 'risk assessment',
    synonyms: ['risk assessments', 'security risk assessment', 'risk analysis'],
    weight: 4,
    category: 'process'
  },
  {
    primary: 'vulnerability management',
    synonyms: ['vuln management', 'vulnerability scanning', 'vulnerability assessment'],
    weight: 4,
    category: 'process'
  },
  
  // Commercial Frameworks
  {
    primary: 'iso 27001',
    synonyms: ['iso27001', 'iso 27001:2013', 'iso 27001:2022'],
    weight: 3,
    category: 'framework'
  },
  {
    primary: 'soc 2',
    synonyms: ['soc2', 'soc ii', 'soc 2 type 2', 'soc 2 type ii'],
    weight: 3,
    category: 'framework'
  },
  {
    primary: 'pci dss',
    synonyms: ['pci-dss', 'pci', 'payment card industry'],
    weight: 3,
    category: 'framework'
  },
  
  // Tools and Platforms
  {
    primary: 'servicenow',
    synonyms: ['service now', 'servicenow grc'],
    weight: 2,
    category: 'tool'
  },
  {
    primary: 'jira',
    synonyms: ['atlassian jira', 'jira software'],
    weight: 2,
    category: 'tool'
  },
  
  // Cloud and Technical
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
  
  const details: Array<{keyword: string, found: boolean, weight: number, category: string}> = []
  let totalWeight = 0
  let matchedWeight = 0
  
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
      
      details.push({
        keyword: group.primary,
        found: inResume,
        weight: group.weight,
        category: group.category
      })
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
  // This will be used by the ResumeTailor to intelligently add missing keywords
  // based on the user's actual experience
  
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
  
  // Generate targeted enhancements based on categories
  if (missingByCategory['authorization']?.length > 0) {
    enhancements.push(`
AUTHORIZATION & COMPLIANCE EXPERIENCE:
• Led FedRAMP Authorization to Operate (ATO) activities ensuring compliance with NIST 800-53 controls
• Managed authorization packages and continuous monitoring requirements for federal systems
• Coordinated with agency ISSOs and security teams to maintain authorization posture`)
  }
  
  if (missingByCategory['documentation']?.length > 0) {
    enhancements.push(`
SECURITY DOCUMENTATION EXPERTISE:
• Developed and maintained System Security Plans (SSPs), POA&Ms, and Security Assessment Reports (SARs)
• Created comprehensive security documentation aligned with NIST SP 800-37 RMF guidelines
• Managed artifact lifecycle from initial development through continuous updates`)
  }
  
  if (missingByCategory['framework']?.length > 0) {
    const frameworks = missingByCategory['framework'].map(f => f.toUpperCase()).join(', ')
    enhancements.push(`
FRAMEWORK IMPLEMENTATION:
• Applied ${frameworks} requirements to security control implementation and validation
• Performed gap assessments and control mapping across multiple compliance frameworks
• Supported audit preparation and evidence collection for framework compliance`)
  }
  
  if (missingByCategory['process']?.length > 0) {
    enhancements.push(`
SECURITY ASSESSMENT & MONITORING:
• Conducted comprehensive security assessments and risk analyses for federal systems
• Implemented continuous monitoring programs tracking control effectiveness and compliance posture
• Performed vulnerability assessments and coordinated remediation activities`)
  }
  
  return enhancements.join('\n')
}
