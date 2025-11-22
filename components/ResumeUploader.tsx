'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Inbox } from 'lucide-react'
import mammoth from 'mammoth'

interface Resume {
  id: string
  name: string
  content: string
  uploadDate: string
  selected: boolean
}

interface ResumeUploaderProps {
  resumes: Resume[]
  setResumes: (resumes: Resume[]) => void
  selectedResumeId: string | null
  setSelectedResumeId: (id: string | null) => void
}

export default function ResumeUploader({ 
  resumes, 
  setResumes, 
  selectedResumeId, 
  setSelectedResumeId 
}: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = async (file: File) => {
    // Check if we already have 5 resumes
    if (resumes.length >= 5) {
      setError('Maximum 5 resumes allowed. Please delete one before uploading.')
      return
    }

    // Check file type
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
        selected: resumes.length === 0 // Auto-select if first resume
      }

      const updatedResumes = [...resumes, newResume]
      setResumes(updatedResumes)
      
      // Auto-select if first resume
      if (resumes.length === 0) {
        setSelectedResumeId(newResume.id)
      }

      // Save to localStorage
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
    // Reset input
    event.target.value = ''
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    // Process only the first file
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
    // Handle DOCX files
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
    
    // Handle text files
    if (file.type === 'text/plain') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read text file'))
        reader.readAsText(file)
      })
    }
    
    // Handle PDF with dynamic import of pdfjs-dist
    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        
        // Configure worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        
        // Extract text from all pages
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
    
    // If deleted resume was selected, select the first one
    if (selectedResumeId === id && updatedResumes.length > 0) {
      setSelectedResumeId(updatedResumes[0].id)
    } else if (updatedResumes.length === 0) {
      setSelectedResumeId(null)
    }
    
    // Save to localStorage
    localStorage.setItem('grc_resumes', JSON.stringify(updatedResumes))
  }

  const selectResume = (id: string) => {
    setSelectedResumeId(id)
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
            <h2 className="text-lg font-semibold text-purple-100">Resume Manager</h2>
            <p className="text-sm text-purple-300 mt-1">Upload up to 5 versions to test against jobs</p>
          </div>
          <div className="text-sm text-purple-300">
            {resumes.length}/5 resumes
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Drag and Drop Zone */}
        <div className="mb-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
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
            
            <Inbox className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-purple-300' : 'text-purple-400'}`} />
            <p className="text-lg font-semibold text-purple-100 mb-2">
              {uploading ? 'Processing...' : resumes.length >= 5 ? 'Maximum resumes reached' : 'Drop your resume here'}
            </p>
            <p className="text-sm text-purple-300 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-purple-400">
              Supports PDF, DOCX, and TXT files • Up to 5 resumes
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Resume List */}
        {resumes.length === 0 ? (
          <div className="text-center py-12 text-purple-300">
            <FileText className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <p className="text-lg font-semibold mb-2 text-purple-200">No resumes uploaded yet</p>
            <p className="mt-2 text-sm text-purple-400">Upload up to 5 resume versions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-slate-700/50 border-2 border-purple-500/30 rounded-xl p-4 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all cursor-pointer backdrop-blur-sm"
                onClick={() => selectResume(resume.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-purple-900/50">
                      <FileText className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-purple-100 truncate">{resume.name}</h3>
                        {selectedResumeId === resume.id && (
                          <CheckCircle className="w-5 h-5 text-purple-300" />
                        )}
                      </div>
                      <p className="text-sm text-purple-400 mt-1">
                        Uploaded {formatDate(resume.uploadDate)}
                      </p>
                      <p className="text-xs text-purple-300 mt-1">
                        {resume.content.length} characters
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteResume(resume.id)
                    }}
                    className="px-2 py-1 text-xs bg-purple-900/50 text-purple-200 rounded border border-purple-500/30"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {selectedResumeId === resume.id && (
                  <div className="mt-3 pt-3 border-t border-purple-500/30">
                    <p className="text-xs text-purple-300 font-semibold">
                      ✓ This resume will be used for job matching
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {resumes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click a resume to select it for job matching</li>
              <li>• Upload different versions (federal, commercial, engineering-focused)</li>
              <li>• Test each version against job descriptions to find the best match</li>
              <li>• Keep your most successful versions for future applications</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
