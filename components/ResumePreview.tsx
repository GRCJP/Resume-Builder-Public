'use client'

import { Download } from 'lucide-react'
import { ResumeData } from '@/types/resume'

interface ResumePreviewProps {
  resumeData: ResumeData
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  const handleDownload = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const content = document.getElementById('resume-content')?.innerHTML || ''
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeData.personalInfo.fullName} - Resume</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
            .resume { max-width: 8.5in; margin: 0 auto; padding: 0.5in; }
            h1 { font-size: 24pt; font-weight: bold; margin-bottom: 4pt; }
            h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; border-bottom: 1px solid #000; padding-bottom: 2pt; }
            h3 { font-size: 12pt; font-weight: bold; margin-top: 8pt; margin-bottom: 2pt; }
            .contact { font-size: 10pt; margin-bottom: 12pt; }
            .summary { margin-bottom: 12pt; }
            .experience-item, .education-item { margin-bottom: 10pt; }
            .job-header, .edu-header { display: flex; justify-content: space-between; margin-bottom: 4pt; }
            .job-title, .degree { font-weight: bold; }
            .company, .university { font-style: italic; }
            ul { margin-left: 20pt; margin-top: 4pt; }
            li { margin-bottom: 3pt; }
            .skills-section { margin-top: 8pt; }
            .skill-category { margin-bottom: 4pt; }
            .skill-label { font-weight: bold; display: inline; }
            .skill-list { display: inline; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .resume { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="resume">
            ${content}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div className="p-8 bg-white" style={{ minHeight: '11in' }}>
        <div id="resume-content" className="max-w-[8.5in] mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {resumeData.personalInfo.fullName || 'Your Name'}
            </h1>
            <div className="text-sm text-gray-700">
              {[
                resumeData.personalInfo.phone,
                resumeData.personalInfo.email,
                resumeData.personalInfo.location,
                resumeData.personalInfo.linkedin,
                resumeData.personalInfo.portfolio
              ].filter(Boolean).join(' | ')}
            </div>
          </div>

          {/* Summary */}
          {resumeData.summary && (
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-900 pb-1 mb-2">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-sm text-gray-800">{resumeData.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-900 pb-1 mb-2">
                PROFESSIONAL EXPERIENCE
              </h2>
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-bold text-sm text-gray-900">{exp.jobTitle}</div>
                      <div className="italic text-sm text-gray-800">{exp.company}</div>
                    </div>
                    <div className="text-sm text-gray-700 text-right">
                      <div>{exp.location}</div>
                      <div>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                  </div>
                  {exp.achievements.filter(a => a.trim()).length > 0 && (
                    <ul className="list-disc ml-5 text-sm text-gray-800">
                      {exp.achievements.filter(a => a.trim()).map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-900 pb-1 mb-2">
                EDUCATION
              </h2>
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-gray-900">
                        {edu.degree}{edu.major && `, ${edu.major}`}
                      </div>
                      <div className="italic text-sm text-gray-800">{edu.university}</div>
                      {(edu.gpa || edu.honors) && (
                        <div className="text-sm text-gray-700">
                          {[edu.gpa && `GPA: ${edu.gpa}`, edu.honors].filter(Boolean).join(' | ')}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-700">{edu.graduationYear}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {(resumeData.skills.technical.length > 0 || 
            resumeData.skills.languages.length > 0 || 
            resumeData.skills.certifications.length > 0) && (
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-900 pb-1 mb-2">
                SKILLS
              </h2>
              <div className="text-sm text-gray-800">
                {resumeData.skills.technical.length > 0 && (
                  <div className="mb-1">
                    <span className="font-bold">Technical Skills: </span>
                    <span>{resumeData.skills.technical.join(', ')}</span>
                  </div>
                )}
                {resumeData.skills.languages.length > 0 && (
                  <div className="mb-1">
                    <span className="font-bold">Languages: </span>
                    <span>{resumeData.skills.languages.join(', ')}</span>
                  </div>
                )}
                {resumeData.skills.certifications.length > 0 && (
                  <div className="mb-1">
                    <span className="font-bold">Certifications: </span>
                    <span>{resumeData.skills.certifications.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
