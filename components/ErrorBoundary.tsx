'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error }>
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error }: { error?: Error }) {
  const isBrowserExtensionError = error?.message?.includes('ethereum') || 
                                 error?.message?.includes('chrome-extension')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30 p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-purple-100 mb-4">
            {isBrowserExtensionError ? 'Browser Extension Conflict' : 'Something went wrong'}
          </h2>
          
          {isBrowserExtensionError ? (
            <div className="space-y-4">
              <p className="text-purple-300">
                A browser extension is interfering with the application.
              </p>
              <div className="bg-purple-900/30 rounded-lg p-4 text-left">
                <p className="text-purple-200 font-semibold mb-2">To fix this:</p>
                <ul className="text-purple-300 text-sm space-y-1 list-disc list-inside">
                  <li>Disable crypto wallet extensions (MetaMask, etc.)</li>
                  <li>Try using Incognito mode</li>
                  <li>Or use a different browser without extensions</li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-purple-300 mb-4">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg"
          >
            Refresh Page
          </button>
          
          {error && !isBrowserExtensionError && (
            <details className="mt-4 text-left">
              <summary className="text-purple-400 text-sm cursor-pointer hover:text-purple-300">
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-slate-900 rounded text-xs text-purple-300 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
