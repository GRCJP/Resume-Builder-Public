'use client'

import { useState } from 'react'
import { FileText, TrendingUp, AlertTriangle, CheckCircle2, Target, Shield, Briefcase } from 'lucide-react'
import { smartMatch } from '@/lib/smartMatcher'
import { validateAgainstIndustryATS, getATSBenchmarks } from '@/lib/atsValidator'
import { classifyRole, assessRoleMatch, extractJobTitle } from '@/lib/roleClassifier'

interface JobAnalysis {
  keywords: string[]
  skills: string[]
  certifications: string[]
  experience: string[]
  responsibilities: string[]
  matchScore: number
  missingKeywords: string[]
  suggestions: string[]
}

interface JobDescriptionAnalyzerProps {
  resumeContent: string
  selectedResumeName: string
  onAnalysisComplete: (analysis: JobAnalysis) => void
  onJobDescriptionChange?: (jd: string) => void
}

export default function JobDescriptionAnalyzer({ resumeContent, selectedResumeName, onAnalysisComplete, onJobDescriptionChange }: JobDescriptionAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [atsValidation, setAtsValidation] = useState<any>(null)
  const [roleClassification, setRoleClassification] = useState<any>(null)
  const [roleMismatch, setRoleMismatch] = useState<any>(null)
  
  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value)
    if (onJobDescriptionChange) {
      onJobDescriptionChange(value)
    }
  }

  const analyzeJobDescription = () => {
    if (!resumeContent) {
      alert('Please upload a resume first')
      return
    }
    
    setIsAnalyzing(true)
    
    // Extract keywords and requirements from job description
    const jd = jobDescription.toLowerCase()
    
    // GRC-specific keywords and skills
    const grcKeywords = [
      'grc', 'governance', 'risk', 'compliance', 'audit', 'framework', 'controls',
      'nist', 'iso 27001', 'sox', 'hipaa', 'pci dss', 'gdpr', 'ccpa', 'fedramp',
      'risk assessment', 'risk management', 'vendor risk', 'third party risk',
      'security controls', 'control testing', 'gap analysis', 'remediation',
      'policy', 'procedure', 'documentation', 'reporting', 'metrics', 'kpi',
      'archer', 'servicenow', 'rsam', 'onspring', 'secureframe', 'vanta',
      'vulnerability management', 'threat assessment', 'security posture',
      'compliance monitoring', 'regulatory', 'attestation', 'certification',
      'risk register', 'risk mitigation', 'control framework', 'maturity model',
      'security awareness', 'training', 'incident response', 'business continuity',
      'disaster recovery', 'bcdr', 'penetration testing', 'security assessment'
    ]

    const technicalSkills = [
      'python', 'sql', 'powershell', 'scripting', 'automation',
      'api', 'rest', 'json', 'xml', 'excel', 'tableau', 'power bi',
      'jira', 'confluence', 'sharepoint', 'aws', 'azure', 'gcp',
      'splunk', 'elk', 'siem', 'ids', 'ips', 'firewall', 'vpn'
    ]

    const certifications = [
      'cissp', 'cisa', 'cism', 'crisc', 'cgeit', 'gsec', 'giac',
      'ceh', 'oscp', 'security+', 'ccsp', 'iso 27001', 'cipp'
    ]

    // Extract found keywords
    const foundKeywords = grcKeywords.filter(keyword => jd.includes(keyword))
    const foundSkills = technicalSkills.filter(skill => jd.includes(skill))
    const foundCerts = certifications.filter(cert => jd.includes(cert))

    // Extract experience requirements
    const expMatch = jd.match(/(\d+)\+?\s*years?/gi) || []
    const experienceReqs = expMatch.map(e => e.trim())

    // Extract responsibilities (sentences with action verbs)
    const actionVerbs = ['develop', 'implement', 'manage', 'lead', 'coordinate', 'conduct', 'perform', 'maintain', 'ensure', 'support', 'assess', 'analyze', 'review', 'monitor', 'report', 'collaborate', 'establish', 'define', 'create', 'execute']
    const sentences = jobDescription.split(/[.!?]+/)
    const responsibilities = sentences
      .filter(s => actionVerbs.some(verb => s.toLowerCase().includes(verb)))
      .slice(0, 8)
      .map(s => s.trim())
      .filter(s => s.length > 20)

    // Use smart matching with synonym detection
    const smartMatchResult = smartMatch(jobDescription, resumeContent)
    
    // Classify the role to detect management/director positions
    const jobTitle = extractJobTitle(jobDescription)
    const roleClass = classifyRole(jobTitle, jobDescription)
    const roleMatch = assessRoleMatch(roleClass, resumeContent)
    
    setRoleClassification(roleClass)
    setRoleMismatch(roleMatch)
    
    // Adjust match score based on role mismatch
    let adjustedMatchScore = smartMatchResult.matchScore
    if (roleMatch.shouldApply) {
      adjustedMatchScore = Math.max(0, adjustedMatchScore - roleMatch.scorePenalty)
    }
    
    // Check resume against job requirements (legacy for additional keywords)
    const resumeText = resumeContent.toLowerCase()
    const resumeKeywords = foundKeywords.filter(kw => resumeText.includes(kw))
    const legacyMissing = foundKeywords.filter(kw => !resumeText.includes(kw))
    
    // Combine smart match missing with legacy missing
    const allMissing = Array.from(new Set([...smartMatchResult.missingKeywords, ...legacyMissing]))

    // Generate human-readable suggestions
    const suggestions = generateSuggestions(allMissing, foundCerts, resumeText, jd, smartMatchResult.criticalMissing)
    
    // Add role mismatch warning to suggestions if applicable
    if (roleMatch.shouldApply) {
      suggestions.unshift(`⚠️ ROLE MISMATCH: ${roleMatch.reason}`)
      if (roleMatch.recommendation) {
        suggestions.push(`💡 RECOMMENDATION: ${roleMatch.recommendation}`)
      }
    }

    const analysisResult: JobAnalysis = {
      keywords: foundKeywords,
      skills: foundSkills,
      certifications: foundCerts,
      experience: experienceReqs,
      responsibilities,
      matchScore: adjustedMatchScore,
      missingKeywords: allMissing,
      suggestions
    }

    // Validate against industry ATS standards (use adjusted score)
    const atsResult = validateAgainstIndustryATS(resumeContent, jobDescription, adjustedMatchScore)
    setAtsValidation(atsResult)
    
    setAnalysis(analysisResult)
    onAnalysisComplete(analysisResult)
    setIsAnalyzing(false)
  }

  const generateSuggestions = (missing: string[], certs: string[], resumeText: string, jd: string, criticalMissing: string[] = []): string[] => {
    const suggestions: string[] = []
    
    // Prioritize critical missing keywords
    if (criticalMissing.length > 0) {
      suggestions.push(`⚠️ CRITICAL: Add these high-priority keywords: ${criticalMissing.join(', ').toUpperCase()}. These are essential for this role and should be prominently featured.`)
    }

    // Framework suggestions - OUTCOME FOCUSED
    const frameworks = ['nist', 'iso 27001', 'sox', 'pci dss', 'hipaa', 'fedramp']
    const missingFrameworks = frameworks.filter(f => missing.includes(f))
    if (missingFrameworks.length > 0) {
      suggestions.push(`Add ${missingFrameworks[0].toUpperCase()} experience using outcome framing: "Achieved ${missingFrameworks[0].toUpperCase()} compliance across 500+ controls, reducing audit findings by 40% through automated evidence collection" (adjust numbers to match your actual work)`)
    }

    // GRC tools
    const tools = ['archer', 'servicenow', 'rsam', 'onspring']
    const missingTools = tools.filter(t => missing.includes(t))
    if (missingTools.length > 0) {
      suggestions.push(`The role uses ${missingTools[0]}. If you have similar GRC platform experience, mention it. Example: "Managed risk assessments using enterprise GRC platform, tracking 200+ controls across multiple frameworks"`)
    }

    // Risk management - OUTCOME FOCUSED
    if (missing.includes('risk assessment') || missing.includes('risk management')) {
      suggestions.push(`Show risk management OUTCOMES, not just activities: "Reduced enterprise risk exposure by 45% through systematic risk assessments across 200+ critical assets, prioritizing remediation by business impact" (use your actual numbers)`)
    }

    // Vendor/Third-party risk - SHOW SCALE
    if (missing.includes('vendor risk') || missing.includes('third party risk')) {
      suggestions.push(`Vendor risk needs scope + outcome: "Assessed 150+ third-party vendors using standardized risk framework, identifying and mitigating 30+ high-risk relationships, reducing supply chain exposure by 40%"`)
    }

    // Metrics and reporting - SHOW IMPACT
    if (missing.includes('metrics') || missing.includes('kpi') || missing.includes('reporting')) {
      suggestions.push(`Metrics should show business value: "Built automated risk dashboards tracking 500+ controls across 5 frameworks, reducing executive reporting time from 2 weeks to 2 hours per cycle"`)
    }

    // Automation - GOVERNANCE → ENGINEERING
    if (missing.includes('automation') || missing.includes('scripting')) {
      suggestions.push(`Show HOW you automated (engineering mindset): "Engineered Python-based compliance automation reducing manual evidence collection by 70%, processing 1,000+ controls monthly with 95% accuracy"`)
    }

    // Certifications
    const hasCerts = certs.some(cert => resumeText.includes(cert.toLowerCase()))
    if (certs.length > 0 && !hasCerts) {
      suggestions.push(`This role values certifications like ${certs.slice(0, 2).join(', ').toUpperCase()}. If you're pursuing any, add them as "In Progress"`)
    }

    // Control testing - SHOW RESULTS
    if (missing.includes('control testing') || missing.includes('controls')) {
      suggestions.push(`Control testing needs outcomes: "Tested 200+ controls quarterly across NIST 800-53 and ISO 27001, achieving 95% effectiveness rating and reducing audit exceptions by 60%"`)
    }

    // Policy and documentation - GOVERNANCE → ENGINEERING
    if (missing.includes('policy') || missing.includes('documentation')) {
      suggestions.push(`Policy work should show impact: "Developed 25+ security policies aligned with NIST CSF and ISO 27001, reducing policy violations by 50% through clearer documentation and automated compliance tracking"`)
    }

    // Add a "lead with wins" reminder if they have low match score
    if (missing.length > 5) {
      suggestions.push(`REMEMBER: Lead with your top 3 wins. Make sure your biggest achievements (like vulnerability reduction, automation projects, or compliance improvements) appear in the first half of page 1. Hiring managers spend 7-10 seconds on first pass.`)
    }

    return suggestions.slice(0, 7) // Limit to top 7 suggestions
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg px-6 py-4">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-600" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Job Description Analyzer</h2>
            <p className="text-sm text-gray-600">
              {selectedResumeName 
                ? `Analyzing: ${selectedResumeName}` 
                : 'Upload a resume to start analyzing'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => handleJobDescriptionChange(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Paste the full job description here..."
          />
        </div>

        <button
          onClick={analyzeJobDescription}
          disabled={!jobDescription.trim() || isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
        >
          <FileText className="w-5 h-5" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Job Match'}
        </button>

        {analysis && (
          <div className="mt-6 space-y-6">
            {/* Match Score */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Job Match Score</span>
                </div>
                <span className={`text-2xl font-bold ${
                  analysis.matchScore >= 70 ? 'text-green-600' : 
                  analysis.matchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.matchScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    analysis.matchScore >= 70 ? 'bg-green-500' : 
                    analysis.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.matchScore}%` }}
                />
              </div>
            </div>

            {/* Role Classification Warning */}
            {roleMismatch && roleMismatch.shouldApply && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Role Level Mismatch Detected
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="font-semibold text-gray-700">Job Level:</span>
                        <span className="text-gray-900 uppercase">{roleClassification?.level}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-gray-700">Job Type:</span>
                        <span className="text-gray-900 uppercase">{roleClassification?.type}</span>
                      </div>
                      {roleClassification?.focus && roleClassification.focus.length > 0 && (
                        <div className="flex gap-2">
                          <span className="font-semibold text-gray-700">Focus:</span>
                          <span className="text-gray-900">{roleClassification.focus.join(', ')}</span>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <p className="text-gray-800 font-medium">{roleMismatch.reason}</p>
                      </div>
                      {roleMismatch.recommendation && (
                        <div className="mt-2 p-3 bg-orange-100 rounded">
                          <p className="text-sm text-gray-800">
                            <strong>💡 Recommendation:</strong> {roleMismatch.recommendation}
                          </p>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <p className="text-xs text-gray-600">
                          <strong>Score Penalty:</strong> -{roleMismatch.scorePenalty}% applied due to role mismatch
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ATS Validation */}
            {atsValidation && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">Industry ATS Score</span>
                  </div>
                  <span className={`text-2xl font-bold ${
                    atsValidation.industryComparison.estimatedATSScore >= 80 ? 'text-green-600' : 
                    atsValidation.industryComparison.estimatedATSScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {atsValidation.industryComparison.estimatedATSScore}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Keyword Density:</span>
                    <span className={`font-semibold ${
                      atsValidation.keywordDensity >= 2 && atsValidation.keywordDensity <= 4 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {atsValidation.keywordDensity.toFixed(1)}% {atsValidation.keywordDensity >= 2 && atsValidation.keywordDensity <= 4 ? '✓' : '⚠️'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formatting:</span>
                    <span className={`font-semibold ${
                      atsValidation.formattingScore >= 80 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {atsValidation.formattingScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold text-purple-600">
                      {atsValidation.industryComparison.confidence}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-gray-600">
                    <strong>vs Jobscan/Resume Worded:</strong> Our algorithm estimates this resume would score {atsValidation.industryComparison.estimatedATSScore}% on industry ATS tools like Jobscan, Resume Worded, Taleo, and Workday.
                  </p>
                </div>
                {atsValidation.issues.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">ATS Issues:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {atsValidation.issues.slice(0, 3).map((issue: string, idx: number) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Required Keywords */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Key Requirements Found ({analysis.keywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((kw, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            {analysis.missingKeywords.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Missing Keywords ({analysis.missingKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {analysis.certifications.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Preferred Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.certifications.map((cert, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium uppercase"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">Tailored Recommendations</h3>
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Responsibilities */}
            {analysis.responsibilities.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Responsibilities from Job</h3>
                <ul className="space-y-2">
                  {analysis.responsibilities.slice(0, 5).map((resp, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
