// Role Classification - Determines job level and type to adjust scoring

export interface RoleClassification {
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive'
  type: 'technical' | 'management' | 'hybrid' | 'sales' | 'consulting'
  focus: string[]
  confidence: number
}

export interface RoleMatchAdjustment {
  shouldApply: boolean
  scorePenalty: number
  reason: string
  recommendation: string
}

/**
 * Classify the job role based on title and description
 */
export function classifyRole(jobTitle: string, jobDescription: string): RoleClassification {
  const title = jobTitle.toLowerCase()
  const desc = jobDescription.toLowerCase()
  
  // Determine level
  let level: RoleClassification['level'] = 'mid'
  let levelConfidence = 0
  
  if (title.includes('director') || title.includes('vp') || title.includes('vice president')) {
    level = 'director'
    levelConfidence = 95
  } else if (title.includes('manager') || title.includes('head of')) {
    level = 'manager'
    levelConfidence = 90
  } else if (title.includes('lead') || title.includes('principal') || title.includes('staff')) {
    level = 'lead'
    levelConfidence = 85
  } else if (title.includes('senior') || title.includes('sr.')) {
    level = 'senior'
    levelConfidence = 80
  } else if (title.includes('junior') || title.includes('jr.') || title.includes('associate')) {
    level = 'entry'
    levelConfidence = 80
  } else {
    // Infer from description
    const managementIndicators = [
      'manage team', 'manages team', 'team of', 'direct reports',
      'p&l', 'profit and loss', 'revenue target', 'book of business',
      'hiring', 'performance management', 'talent decisions'
    ]
    
    const managerCount = managementIndicators.filter(ind => desc.includes(ind)).length
    
    if (managerCount >= 3) {
      level = 'manager'
      levelConfidence = 70
    } else if (desc.includes('lead') && desc.includes('team')) {
      level = 'lead'
      levelConfidence = 65
    }
  }
  
  // Determine type
  let type: RoleClassification['type'] = 'technical'
  let typeConfidence = 0
  
  const managementKeywords = [
    'manage team', 'manages team', 'team of', 'p&l', 'revenue',
    'book of business', 'client escalations', 'performance management',
    'hiring', 'talent decisions', 'gross profit', 'budget'
  ]
  
  const technicalKeywords = [
    'implement', 'configure', 'develop', 'code', 'script',
    'technical implementation', 'hands-on', 'build', 'deploy'
  ]
  
  const consultingKeywords = [
    'consulting', 'advisory', 'client engagement', 'assessment',
    'audit', 'review', 'recommendations', 'advisory services'
  ]
  
  const salesKeywords = [
    'sales', 'cross sell', 'upsell', 'renewals', 'scoping',
    'pre-sales', 'account management', 'qbr', 'quarterly business review'
  ]
  
  const managementCount = managementKeywords.filter(kw => desc.includes(kw)).length
  const technicalCount = technicalKeywords.filter(kw => desc.includes(kw)).length
  const consultingCount = consultingKeywords.filter(kw => desc.includes(kw)).length
  const salesCount = salesKeywords.filter(kw => desc.includes(kw)).length
  
  if (managementCount >= 4) {
    type = 'management'
    typeConfidence = 90
  } else if (salesCount >= 3) {
    type = 'sales'
    typeConfidence = 85
  } else if (consultingCount >= 3 && managementCount >= 2) {
    type = 'hybrid'
    typeConfidence = 80
  } else if (consultingCount >= 3) {
    type = 'consulting'
    typeConfidence = 75
  } else if (technicalCount >= 3) {
    type = 'technical'
    typeConfidence = 80
  } else {
    type = 'hybrid'
    typeConfidence = 60
  }
  
  // Determine focus areas
  const focus: string[] = []
  
  if (managementCount >= 2) focus.push('Team Management')
  if (salesCount >= 2) focus.push('Sales & Business Development')
  if (desc.includes('p&l') || desc.includes('revenue') || desc.includes('profit')) focus.push('P&L Responsibility')
  if (consultingCount >= 2) focus.push('Client Consulting')
  if (technicalCount >= 2) focus.push('Technical Implementation')
  if (desc.includes('audit') || desc.includes('assessment')) focus.push('Audit & Assessment')
  
  const confidence = Math.round((levelConfidence + typeConfidence) / 2)
  
  return {
    level,
    type,
    focus,
    confidence
  }
}

/**
 * Determine if resume matches the role level and type
 * Returns adjustment to apply to match score
 */
export function assessRoleMatch(
  jobClassification: RoleClassification,
  resumeContent: string
): RoleMatchAdjustment {
  const resume = resumeContent.toLowerCase()
  
  // Check if resume shows appropriate level
  const hasManagementExperience = [
    'managed team', 'led team', 'supervised', 'direct reports',
    'hiring', 'performance reviews', 'mentored', 'coached'
  ].some(phrase => resume.includes(phrase))
  
  const hasPLExperience = [
    'p&l', 'profit and loss', 'revenue', 'budget', 'financial'
  ].some(phrase => resume.includes(phrase))
  
  const hasSalesExperience = [
    'sales', 'business development', 'account management',
    'cross sell', 'upsell', 'renewals', 'scoping'
  ].some(phrase => resume.includes(phrase))
  
  const hasConsultingExperience = [
    'consulting', 'advisory', 'client engagement', 'assessment',
    'recommendations', 'advisory services'
  ].some(phrase => resume.includes(phrase))
  
  // Director/Manager role but no management experience
  if ((jobClassification.level === 'director' || jobClassification.level === 'manager') && !hasManagementExperience) {
    return {
      shouldApply: true,
      scorePenalty: 30,
      reason: `This is a ${jobClassification.level.toUpperCase()} role requiring team management experience, but your resume doesn't show management responsibilities.`,
      recommendation: `This role requires managing teams of 6-15 people, P&L responsibility, and business development. Your technical GRC skills are strong, but this is a management position, not a hands-on technical role.`
    }
  }
  
  // Management role but no P&L experience
  if (jobClassification.type === 'management' && jobClassification.focus.includes('P&L Responsibility') && !hasPLExperience) {
    return {
      shouldApply: true,
      scorePenalty: 25,
      reason: 'This role requires P&L responsibility and revenue management, which is not evident in your resume.',
      recommendation: 'This is a business-focused role managing $3M+ in revenue. Your technical expertise is valuable, but the role emphasizes business operations and financial management.'
    }
  }
  
  // Sales-heavy role but no sales experience
  if (jobClassification.type === 'sales' || (jobClassification.type === 'management' && hasSalesExperience)) {
    if (!hasSalesExperience) {
      return {
        shouldApply: true,
        scorePenalty: 20,
        reason: 'This role requires significant sales and business development activities, which are not shown in your resume.',
        recommendation: 'This role involves cross-selling, upselling, renewals, and account management. Your GRC expertise is relevant, but the role is heavily sales-oriented.'
      }
    }
  }
  
  // Consulting role - this might be a good match
  if (jobClassification.type === 'consulting' && hasConsultingExperience) {
    return {
      shouldApply: false,
      scorePenalty: 0,
      reason: 'Good match - consulting role aligns with your experience.',
      recommendation: ''
    }
  }
  
  // Technical role - likely a good match
  if (jobClassification.type === 'technical') {
    return {
      shouldApply: false,
      scorePenalty: 0,
      reason: 'Good match - technical role aligns with your experience.',
      recommendation: ''
    }
  }
  
  // Hybrid role - check if resume shows both aspects
  if (jobClassification.type === 'hybrid') {
    const hasManagement = hasManagementExperience || hasPLExperience
    const hasTechnical = resume.includes('implement') || resume.includes('configure') || resume.includes('automat')
    
    if (!hasManagement && jobClassification.focus.includes('Team Management')) {
      return {
        shouldApply: true,
        scorePenalty: 15,
        reason: 'This hybrid role requires both technical and management skills. Your resume shows strong technical skills but limited management experience.',
        recommendation: 'Consider roles that are more technically focused, or highlight any leadership/mentorship experience you have.'
      }
    }
  }
  
  return {
    shouldApply: false,
    scorePenalty: 0,
    reason: 'Role type matches your experience.',
    recommendation: ''
  }
}

/**
 * Extract job title from description if not provided
 */
export function extractJobTitle(jobDescription: string): string {
  const lines = jobDescription.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  // Common title patterns
  const titlePatterns = [
    /^(director|manager|lead|senior|principal|staff|junior|associate)\s+/i,
    /^(vp|vice president)\s+/i
  ]
  
  for (const line of lines.slice(0, 5)) {
    for (const pattern of titlePatterns) {
      if (pattern.test(line) && line.length < 100) {
        return line
      }
    }
  }
  
  // Look for "The [Title]" pattern
  const theMatch = jobDescription.match(/The\s+([A-Z][a-zA-Z\s]+?)\s+(manages|leads|oversees|is responsible)/i)
  if (theMatch) {
    return theMatch[1].trim()
  }
  
  return 'Position' // Default
}

/**
 * Generate role mismatch warning
 */
export function generateRoleMismatchWarning(
  classification: RoleClassification,
  adjustment: RoleMatchAdjustment
): string {
  if (!adjustment.shouldApply) return ''
  
  return `
⚠️ ROLE LEVEL MISMATCH

Job Level: ${classification.level.toUpperCase()}
Job Type: ${classification.type.toUpperCase()}
Focus Areas: ${classification.focus.join(', ')}

${adjustment.reason}

Score Adjustment: -${adjustment.scorePenalty}%

${adjustment.recommendation}

This may not be the right role for your current experience level. Consider applying to hands-on technical GRC roles instead of management/director positions.
`
}
