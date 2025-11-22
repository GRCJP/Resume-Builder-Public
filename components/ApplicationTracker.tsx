'use client'

import { useState, useEffect } from 'react'
import { 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  MoreHorizontal, 
  Trash2, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import { 
  getTrackedJobs, 
  updateJobStatus, 
  getJobStorage,
  saveJobStorage,
  type JobWithScore, 
  type ApplicationStatus 
} from '@/lib/jobStorage'

export default function ApplicationTracker() {
  const [trackedJobs, setTrackedJobs] = useState<JobWithScore[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [notes, setNotes] = useState<string>('')
  
  // Load tracked jobs
  useEffect(() => {
    loadTrackedJobs()
  }, [])

  const loadTrackedJobs = () => {
    const jobs = getTrackedJobs()
    setTrackedJobs(jobs.sort((a, b) => 
      new Date(b.lastUpdated || b.postedDate).getTime() - new Date(a.lastUpdated || a.postedDate).getTime()
    ))
  }

  const handleStatusChange = (jobId: string, newStatus: ApplicationStatus) => {
    updateJobStatus(jobId, newStatus)
    loadTrackedJobs()
  }

  const handleNotesChange = (jobId: string, newNotes: string) => {
    updateJobStatus(jobId, trackedJobs.find(j => j.id === jobId)?.status || 'saved', newNotes)
    setNotes(newNotes)
    loadTrackedJobs()
  }

  const handleRemoveJob = (jobId: string) => {
    if (confirm('Are you sure you want to remove this job from tracking? This action cannot be undone.')) {
      const storage = getJobStorage()
      storage.jobs = storage.jobs.filter(job => job.id !== jobId)
      saveJobStorage(storage)
      loadTrackedJobs()
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status?: ApplicationStatus) => {
    switch (status) {
      case 'saved': return 'bg-blue-900/30 text-blue-300 border-blue-500/30'
      case 'applied': return 'bg-purple-900/30 text-purple-300 border-purple-500/30'
      case 'interviewing': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30'
      case 'offer': return 'bg-green-900/30 text-green-300 border-green-500/30'
      case 'rejected': return 'bg-red-900/30 text-red-300 border-red-500/30'
      default: return 'bg-slate-800 text-slate-300'
    }
  }

  const getStatusIcon = (status?: ApplicationStatus) => {
    switch (status) {
      case 'saved': return <Briefcase className="w-4 h-4" />
      case 'applied': return <FileText className="w-4 h-4" />
      case 'interviewing': return <Calendar className="w-4 h-4" />
      case 'offer': return <CheckCircle2 className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const statuses: { value: ApplicationStatus; label: string }[] = [
    { value: 'saved', label: 'Saved' },
    { value: 'applied', label: 'Applied' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' }
  ]

  // Group jobs by status
  const groupedJobs = statuses.reduce((acc, status) => {
    acc[status.value] = trackedJobs.filter(job => job.status === status.value)
    return acc
  }, {} as Record<ApplicationStatus, JobWithScore[]>)

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-purple-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-400" />
            Application Tracker
          </h2>
          <div className="text-sm text-purple-300">
            {trackedJobs.length} Active Applications
          </div>
        </div>

        {trackedJobs.length === 0 ? (
          <div className="text-center py-12 text-purple-300 border border-dashed border-purple-500/30 rounded-xl">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
            <p className="text-lg font-semibold mb-2">No jobs tracked yet</p>
            <p className="text-sm opacity-75">
              Save jobs from the Discovery Dashboard to track them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {statuses.map((status) => (
              <div key={status.value} className="min-w-[280px] bg-slate-900/30 rounded-xl border border-purple-500/20 p-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-500/20">
                  <h3 className="font-semibold text-purple-100 flex items-center gap-2">
                    {getStatusIcon(status.value)}
                    {status.label}
                  </h3>
                  <span className="text-xs bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded-full">
                    {groupedJobs[status.value].length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {groupedJobs[status.value].map((job) => (
                    <div 
                      key={job.id}
                      className="bg-slate-800 border border-purple-500/30 rounded-lg p-3 hover:border-purple-400 transition-all group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-purple-100 text-sm line-clamp-2" title={job.title}>
                          {job.title}
                        </h4>
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      
                      <p className="text-xs text-purple-300 mb-2 truncate">{job.company}</p>
                      
                      <div className="flex items-center justify-between text-xs text-purple-400 mb-3">
                        <span>{job.location}</span>
                        {job.score && (
                          <span className={`${
                            job.score >= 80 ? 'text-green-400' : 'text-yellow-400'
                          } font-bold`}>
                            {job.score}% Match
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-2 border-t border-purple-500/10 flex justify-between items-center">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value as ApplicationStatus)}
                          className="bg-slate-900 text-xs text-purple-200 border border-purple-500/30 rounded px-2 py-1 focus:outline-none focus:border-purple-400"
                        >
                          {statuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newNote = prompt('Add note:', job.notes || '')
                              if (newNote !== null) handleNotesChange(job.id, newNote)
                            }}
                            className="text-xs text-purple-300 hover:text-purple-100 underline decoration-purple-500/30"
                          >
                            {job.notes ? 'Edit Note' : 'Add Note'}
                          </button>
                          
                          <button
                            onClick={() => handleRemoveJob(job.id)}
                            className="text-xs text-red-400 hover:text-red-300 underline decoration-red-500/30"
                            title="Remove job"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {job.notes && (
                        <div className="mt-2 p-2 bg-purple-900/20 rounded text-xs text-purple-200 italic border-l-2 border-purple-500/50">
                          "{job.notes}"
                        </div>
                      )}
                      
                      <div className="mt-2 text-[10px] text-purple-500/70 text-right">
                        Updated: {formatDate(job.lastUpdated || job.postedDate)}
                      </div>
                    </div>
                  ))}
                  
                  {groupedJobs[status.value].length === 0 && (
                    <div className="text-center py-4 text-purple-500/50 text-xs border-2 border-dashed border-purple-500/10 rounded-lg">
                      No jobs in this stage
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
