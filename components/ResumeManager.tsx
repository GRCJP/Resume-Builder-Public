'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Inbox, Target, TrendingUp, Shield, Briefcase, Wand2, Download, FileSearch, Sparkles } from 'lucide-react'
import mammoth from 'mammoth'
import { smartMatch } from '@/lib/smartMatcher'
import { validateAgainstIndustryATS } from '@/lib/atsValidator'
import { enhanceResumeWithKeywords } from '@/lib/smartMatcher'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface Resume {
  id: string
  name: string
  content: string
  uploadDate: string
  selected: boolean
}

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

interface ResumeManagerProps {
  resumes: Resume[]
  setResumes: (resumes: Resume[]) => void
  selectedResumeId: string | null
  setSelectedResumeId: (id: string | null) => void
}

export default function ResumeManager({ 
  resumes, 
  setResumes, 
  selectedResumeId, 
  setSelectedResumeId 
}: ResumeManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [atsValidation, setAtsValidation] = useState<any>(null)
  const [tailoredResume, setTailoredResume] = useState('')
  const [isTailoring, setIsTailoring] = useState(false)
  const [newMatchScore, setNewMatchScore] = useState(0)

  const selectedResume = resumes.find(r => r.id === selectedResumeId)
  const resumeContent = selectedResume?.content || ''

  const processFile = async (file: File) => {
    if (resumes.length >= 5) {
      setError('Maximum 5 resumes allowed. Please delete one before uploading.')
      return
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, DOCX, or TXT file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const text = await extractTextFromFile(file)
      
      const newResume: Resume = {
        id: Date.now().toString(),
        name: file.name,
        content: text,
        uploadDate: new Date().toISOString(),
        selected: resumes.length === 0
      }

      const updatedResumes = [...resumes, newResume]
      setResumes(updatedResumes)
      
      if (resumes.length === 0) {
        setSelectedResumeId(newResume.id)
      }

      localStorage.setItem('grc_resumes', JSON.stringify(updatedResumes))
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read file. Please try again.'
      setError(errorMessage)
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file)
    event.target.value = ''
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    await processFile(files[0])
  }, [resumes.length])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return result.value
      } catch (err) {
        console.error('Error parsing DOCX:', err)
        throw new Error('Failed to parse DOCX file')
      }
    }
    
    if (file.type === 'text/plain') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read text file'))
        reader.readAsText(file)
      })
    }
    
    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
          fullText += pageText + '\n'
        }
        
        return fullText.trim()
      } catch (err) {
        console.error('Error parsing PDF:', err)
        throw new Error('Failed to parse PDF file. Please try saving as DOCX or TXT.')
      }
    }
    
    throw new Error('Unsupported file type')
  }

  const deleteResume = (id: string) => {
    const updatedResumes = resumes.filter(r => r.id !== id)
    setResumes(updatedResumes)
    
    if (selectedResumeId === id && updatedResumes.length > 0) {
      setSelectedResumeId(updatedResumes[0].id)
    } else if (updatedResumes.length === 0) {
      setSelectedResumeId(null)
    }
    
    localStorage.setItem('grc_resumes', JSON.stringify(updatedResumes))
  }

  const selectResume = (id: string) => {
    setSelectedResumeId(id)
  }

  const analyzeJobMatch = () => {
    if (!resumeContent) {
      setError('Please upload a resume first')
      return
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Use smart matching
      const smartMatchResult = smartMatch(jobDescription, resumeContent)
      
      // Extract keywords from job description
      const jd = jobDescription.toLowerCase()
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

      const foundKeywords = grcKeywords.filter(keyword => jd.includes(keyword))
      const foundSkills = technicalSkills.filter(skill => jd.includes(skill))
      const foundCerts = certifications.filter(cert => jd.includes(cert))

      const expMatch = jd.match(/(\d+)\+?\s*years?/gi) || []
      const experienceReqs = expMatch.map(e => e.trim())

      const actionVerbs = ['develop', 'implement', 'manage', 'lead', 'coordinate', 'conduct', 'perform', 'maintain', 'ensure', 'support', 'assess', 'analyze', 'review', 'monitor', 'report', 'collaborate', 'establish', 'define', 'create', 'execute']
      const sentences = jobDescription.split(/[.!?]+/)
      const responsibilities = sentences
        .filter(s => actionVerbs.some(verb => s.toLowerCase().includes(verb)))
        .slice(0, 8)
        .map(s => s.trim())
        .filter(s => s.length > 20)

      const suggestions = generateSuggestions(smartMatchResult.missingKeywords, foundCerts, resumeContent, jd, smartMatchResult.criticalMissing)

      const analysisResult: JobAnalysis = {
        keywords: foundKeywords,
        skills: foundSkills,
        certifications: foundCerts,
        experience: experienceReqs,
        responsibilities,
        matchScore: smartMatchResult.matchScore,
        missingKeywords: smartMatchResult.missingKeywords,
        suggestions
      }

      // Validate against ATS standards
      const atsResult = validateAgainstIndustryATS(resumeContent, jobDescription, smartMatchResult.matchScore)
      setAtsValidation(atsResult)
      
      setAnalysis(analysisResult)
      setIsAnalyzing(false)
    } catch (err) {
      setError('Analysis failed. Please try again.')
      setIsAnalyzing(false)
    }
  }

  const generateSuggestions = (missing: string[], certs: string[], resumeText: string, jd: string, criticalMissing: string[] = []): string[] => {
    const suggestions: string[] = []
    
    if (criticalMissing.length > 0) {
      suggestions.push(`⚠️ CRITICAL: Add these high-priority keywords: ${criticalMissing.join(', ').toUpperCase()}`)
    }

    const frameworks = ['nist', 'iso 27001', 'sox', 'pci dss', 'hipaa', 'fedramp']
    const missingFrameworks = frameworks.filter(f => missing.includes(f))
    if (missingFrameworks.length > 0) {
      suggestions.push(`Add ${missingFrameworks[0].toUpperCase()} experience with measurable outcomes`)
    }

    if (missing.includes('risk assessment') || missing.includes('risk management')) {
      suggestions.push(`Show risk management outcomes with metrics and impact`)
    }

    if (missing.includes('automation') || missing.includes('scripting')) {
      suggestions.push(`Highlight automation achievements with specific technologies`)
    }

    return suggestions.slice(0, 5)
  }

  const tailorResume = () => {
    if (!analysis) return
    
    setIsTailoring(true)
    
    try {
      const smartEnhancements = enhanceResumeWithKeywords(resumeContent, analysis.missingKeywords, jobDescription)
      let enhanced = resumeContent
      
      // Add missing keywords naturally
      const enhancements: string[] = []
      
      if (smartEnhancements.trim()) {
        enhancements.push(smartEnhancements)
      }
      
      // Add section for key missing skills
      if (analysis.missingKeywords.length > 0) {
        const keySkills = analysis.missingKeywords.slice(0, 5)
        enhancements.push(`
KEY SKILLS & EXPERTISE:
• ${keySkills.join(' • ')}
• Proven track record in compliance frameworks and risk management
• Strong analytical and problem-solving abilities
`)
      }
      
      // Combine enhancements
      if (enhancements.length > 0) {
        enhanced = enhanced + '\n\n' + enhancements.join('\n\n')
      }
      
      setTailoredResume(enhanced)
      
      // Calculate new match score
      const newMatch = smartMatch(jobDescription, enhanced)
      setNewMatchScore(newMatch.matchScore)
      
      setIsTailoring(false)
    } catch (err) {
      setError('Resume tailoring failed. Please try again.')
      setIsTailoring(false)
    }
  }

  const downloadTailoredResume = async () => {
    if (!tailoredResume) return
    
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: tailoredResume.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun({ text: line || ' ' })],
              spacing: { after: 200 }
            })
          )
        }]
      })
      
      const buffer = await Packer.toBuffer(doc)
      const blob = new Blob([buffer as unknown as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      saveAs(blob, `Tailored_${selectedResume?.name || 'Resume'}.docx`)
    } catch (err) {
      setError('Download failed. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30">
      <div className="border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-t-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-100">Resume Manager Workspace</h2>
            <p className="text-sm text-purple-300 mt-1">Upload, compare, and tailor your resume</p>
          </div>
          <div className="text-sm text-purple-300">
            {resumes.length}/5 resumes
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Resume Upload & Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-purple-100 mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Resume Upload
              </h3>
              
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-purple-400 bg-purple-900/20'
                    : 'border-purple-500/50 bg-purple-900/10 hover:border-purple-400 hover:bg-purple-900/20'
                } ${uploading || resumes.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading || resumes.length >= 5}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Inbox className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-purple-300' : 'text-purple-400'}`} />
                <p className="text-sm font-semibold text-purple-100 mb-1">
                  {uploading ? 'Processing...' : resumes.length >= 5 ? 'Maximum resumes reached' : 'Drop resume here'}
                </p>
                <p className="text-xs text-purple-300">
                  or click to browse • PDF, DOCX, TXT
                </p>
              </div>
            </div>

            {/* Resume List */}
            <div>
              <h3 className="text-md font-semibold text-purple-100 mb-3">Select Resume</h3>
              {resumes.length === 0 ? (
                <div className="text-center py-8 text-purple-300 border border-purple-500/30 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                  <p className="text-sm">No resumes uploaded</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => selectResume(resume.id)}
                      className={`bg-slate-700/50 border rounded-lg p-3 hover:border-purple-400 transition-all cursor-pointer ${
                        selectedResumeId === resume.id ? 'border-purple-400 bg-purple-900/20' : 'border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-purple-100 truncate">{resume.name}</h4>
                            {selectedResumeId === resume.id && (
                              <CheckCircle className="w-4 h-4 text-purple-300" />
                            )}
                          </div>
                          <p className="text-xs text-purple-400 mt-1">
                            {formatDate(resume.uploadDate)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteResume(resume.id)
                          }}
                          className="p-1 text-purple-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Job Description & Analysis */}
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-purple-100 mb-3 flex items-center gap-2">
                <FileSearch className="w-5 h-5" />
                Job Description
              </h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-purple-100 placeholder-purple-400 focus:outline-none focus:border-purple-400 text-sm"
                placeholder="Paste job description here for ATS scoring and comparison..."
              />
              
              <button
                onClick={analyzeJobMatch}
                disabled={!resumeContent || !jobDescription.trim() || isAnalyzing}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-semibold"
              >
                <Target className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Match & ATS Score'}
              </button>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-3">
                {/* Match Score */}
                <div className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-purple-100">Match Score</span>
                    <span className={`text-xl font-bold ${
                      analysis.matchScore >= 70 ? 'text-green-400' : 
                      analysis.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {analysis.matchScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        analysis.matchScore >= 70 ? 'bg-green-500' : 
                        analysis.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysis.matchScore}%` }}
                    />
                  </div>
                </div>

                {/* ATS Score */}
                {atsValidation && (
                  <div className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-purple-100 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        ATS Score
                      </span>
                      <span className={`text-xl font-bold ${
                        atsValidation.industryComparison.estimatedATSScore >= 80 ? 'text-green-400' : 
                        atsValidation.industryComparison.estimatedATSScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {atsValidation.industryComparison.estimatedATSScore}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Missing Keywords with ATS Optimization Tips */}
                {analysis.missingKeywords.length > 0 && (
                  <div className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-purple-100 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                      ATS Optimization Required
                    </h4>
                    <p className="text-xs text-purple-300 mb-3">
                      Real ATS systems look for these exact keywords. Add them to your resume:
                    </p>
                    <div className="space-y-2">
                      {analysis.missingKeywords.map((keyword, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-800/50 p-2 rounded">
                          <span className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs font-medium">
                            {keyword}
                          </span>
                          <span className="text-xs text-purple-400">
                            {keyword === 'compliance audits' && 'Try: "Managed compliance audits" or "Conducted compliance audits"'}
                            {keyword === 'security awareness' && 'Try: "Led security awareness initiatives" or "Developed security awareness training"'}
                            {keyword === 'penetration testing' && 'Try: "Oversaw penetration testing" or "Coordinated penetration testing"'}
                            {keyword === 'vulnerability scanning' && 'Try: "Performed vulnerability scanning" or "Managed vulnerability scanning programs"'}
                            {keyword === 'incident response' && 'Try: "Participated in incident response" or "On-call incident response duties"'}
                            {!['compliance audits', 'security awareness', 'penetration testing', 'vulnerability scanning', 'incident response'].includes(keyword) && 
                              `Add "${keyword}" to your experience descriptions`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Tailored Resume */}
                <button
                  onClick={tailorResume}
                  disabled={isTailoring}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 text-sm font-semibold"
                >
                  <Wand2 className="w-4 h-4" />
                  {isTailoring ? 'Generating...' : 'Generate Tailored Resume'}
                </button>

                {/* Tailored Resume Preview */}
                {tailoredResume && (
                  <div className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-purple-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Tailored Resume Preview
                      </h4>
                      <div className="flex items-center gap-2">
                        {newMatchScore > analysis.matchScore && (
                          <span className="text-xs text-green-400">
                            +{newMatchScore - analysis.matchScore}% match
                          </span>
                        )}
                        <button
                          onClick={downloadTailoredResume}
                          className="p-1 text-purple-300 hover:text-purple-100 transition-colors"
                          title="Download tailored resume"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto text-xs text-purple-200 font-mono bg-slate-800/50 p-2 rounded">
                      {tailoredResume.slice(0, 500)}...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
