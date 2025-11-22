'use client'

import { useState } from 'react'
import { Save, FileText, Plus, Trash2, Edit3 } from 'lucide-react'

interface Resume {
  id: string
  name: string
  content: string
  uploadDate: string
  selected: boolean
}

interface ResumeEditorProps {
  selectedResume: Resume | null
  onSave: (content: string, name: string) => void
  onCreateNew: () => void
}

export default function ResumeEditor({ selectedResume, onSave, onCreateNew }: ResumeEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(selectedResume?.content || '')
  const [editedName, setEditedName] = useState(selectedResume?.name || '')

  const handleSave = () => {
    if (!editedContent.trim() || !editedName.trim()) {
      alert('Please provide both a name and content for the resume')
      return
    }
    
    onSave(editedContent, editedName)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedContent(selectedResume?.content || '')
    setEditedName(selectedResume?.name || 'New Resume.txt')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedContent(selectedResume?.content || '')
    setEditedName(selectedResume?.name || '')
    setIsEditing(false)
  }

  if (!selectedResume && !isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Resume Editor</h2>
        </div>
        <div className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold text-gray-700 mb-2">No resume selected</p>
          <p className="text-sm text-gray-600 mb-6">Upload a resume or create a new one to get started</p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create New Resume
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resume Editor</h2>
            {!isEditing && selectedResume && (
              <p className="text-sm text-gray-600 mt-1">Viewing: {selectedResume.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={onCreateNew}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            {/* Resume Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Jonathan_GRC_Federal.txt"
              />
            </div>

            {/* Resume Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Content
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={25}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Paste or type your resume content here..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {editedContent.length} characters
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Editing Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use outcome-focused bullets (reduced X by Y%)</li>
                <li>• Lead with your top 3 wins in first half of page 1</li>
                <li>• Include specific metrics and scope (10,000+ assets, 70% reduction)</li>
                <li>• Mention tools and frameworks (AWS Config, NIST RMF, Python)</li>
                <li>• Show governance → engineering evolution</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* View Mode */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 max-h-[600px] overflow-y-auto">
                {selectedResume?.content || 'No content'}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedResume?.content.length || 0} characters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
