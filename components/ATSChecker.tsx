'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { ResumeData } from '@/types/resume'

interface ATSCheckerProps {
  resumeData: ResumeData
  setAtsScore: (score: number) => void
}

export default function ATSChecker({ resumeData, setAtsScore }: ATSCheckerProps) {
  const checks = [
    {
      id: 'contact',
      label: 'Contact information complete',
      check: () => {
        const { fullName, email, phone, location } = resumeData.personalInfo
        return fullName && email && phone && location
      },
      weight: 15
    },
    {
      id: 'summary',
      label: 'Professional summary included',
      check: () => resumeData.summary && resumeData.summary.length >= 50,
      weight: 10
    },
    {
      id: 'experience',
      label: 'Work experience added',
      check: () => resumeData.experience.length > 0,
      weight: 20
    },
    {
      id: 'achievements',
      label: 'Achievements with metrics',
      check: () => {
        const hasMetrics = resumeData.experience.some(exp =>
          exp.achievements.some(ach => 
            /\d+/.test(ach) && (ach.includes('%') || ach.includes('$') || /\d+/.test(ach))
          )
        )
        return hasMetrics
      },
      weight: 15
    },
    {
      id: 'education',
      label: 'Education section complete',
      check: () => resumeData.education.length > 0,
      weight: 15
    },
    {
      id: 'skills',
      label: 'Technical skills listed',
      check: () => resumeData.skills.technical.length >= 3,
      weight: 10
    },
    {
      id: 'actionVerbs',
      label: 'Action verbs used in achievements',
      check: () => {
        const actionVerbs = ['led', 'developed', 'increased', 'reduced', 'implemented', 'managed', 'created', 'designed', 'improved', 'achieved', 'delivered', 'launched', 'optimized', 'streamlined', 'built']
        const hasActionVerbs = resumeData.experience.some(exp =>
          exp.achievements.some(ach =>
            actionVerbs.some(verb => ach.toLowerCase().includes(verb))
          )
        )
        return hasActionVerbs
      },
      weight: 10
    },
    {
      id: 'formatting',
      label: 'Standard formatting (no special characters)',
      check: () => {
        const allText = JSON.stringify(resumeData)
        const hasSpecialChars = /[^\x00-\x7F]/.test(allText)
        return !hasSpecialChars
      },
      weight: 5
    }
  ]

  useEffect(() => {
    const passedChecks = checks.filter(check => check.check())
    const totalWeight = passedChecks.reduce((sum, check) => sum + check.weight, 0)
    const score = Math.round(totalWeight)
    setAtsScore(score)
  }, [resumeData])

  const passedChecks = checks.filter(check => check.check())
  const failedChecks = checks.filter(check => !check.check())

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ATS Compatibility Checker</h3>
      
      <div className="space-y-3">
        {passedChecks.map(check => (
          <div key={check.id} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">{check.label}</p>
            </div>
          </div>
        ))}
        
        {failedChecks.map(check => (
          <div key={check.id} className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">{check.label}</p>
            </div>
          </div>
        ))}
      </div>

      {failedChecks.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Recommendations:</p>
              <ul className="list-disc list-inside space-y-1">
                {failedChecks.map(check => (
                  <li key={check.id}>Complete: {check.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {passedChecks.length === checks.length && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-semibold">
              Excellent! Your resume is optimized for ATS systems.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
