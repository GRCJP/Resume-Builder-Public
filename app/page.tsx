'use client'

import { useState, useEffect } from 'react'
import { Shield, Briefcase, Search, List } from 'lucide-react'
import ResumeManager from '@/components/ResumeManager'
import JobDiscoveryDashboard from '@/components/JobDiscoveryDashboard'
import ApplicationTracker from '@/components/ApplicationTracker'

interface Resume {
  id: string
  name: string
  content: string
  uploadDate: string
  selected: boolean
}

export default function Home() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'discovery' | 'tracker'>('discovery')

  // Load resumes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('grc_resumes')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setResumes(parsed)
        // Auto-select first resume
        if (parsed.length > 0) {
          setSelectedResumeId(parsed[0].id)
        }
      } catch (e) {
        console.error('Failed to load resumes:', e)
      }
    }
  }, [])

  // Get selected resume content
  const selectedResume = resumes.find(r => r.id === selectedResumeId)
  const resumeContent = selectedResume?.content || ''

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                  GRC Resume Tailor
                </h1>
                <p className="text-purple-300 mt-1">AI-powered job matching & resume customization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-purple-900/30 px-6 py-3 rounded-xl border border-purple-500/30">
                <div className="text-sm text-purple-300">Resumes Stored</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {resumes.length}/5
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resume Management */}
        <div className="mb-8">
          <ResumeManager 
            resumes={resumes}
            setResumes={setResumes}
            selectedResumeId={selectedResumeId}
            setSelectedResumeId={setSelectedResumeId}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'discovery'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800 hover:text-purple-100'
            }`}
          >
            <Search className="w-5 h-5" />
            Job Discovery
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'tracker'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-slate-800/50 text-purple-300 hover:bg-slate-800 hover:text-purple-100'
            }`}
          >
            <List className="w-5 h-5" />
            Application Tracker
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          {activeTab === 'discovery' ? (
            <JobDiscoveryDashboard
              resumeContent={resumeContent}
              selectedResumeName={selectedResume?.name || ''}
            />
          ) : (
            <ApplicationTracker />
          )}
        </div>
      </div>
    </main>
  )
}
