import React, { useState, useEffect } from 'react'
import {
  Bug, Trash2, CheckCircle2, Search, Filter, AlertCircle, Clock, Check
} from 'lucide-react'
import type { Project } from '../types'

interface BugReporterProps {
  projects: Project[]
}

export interface BugReport {
  id: string
  projectId: string
  projectName: string
  testCaseTitle: string
  steps: string[]
  expectedResult: string
  failedStep: string
  errorTrace: string
  priority: string
  loggedAt: string
}

export default function BugReporter({ projects }: BugReporterProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [resolvedMessage, setResolvedMessage] = useState<string | null>(null)

  // Load bugs from local storage
  const loadBugs = () => {
    try {
      const storedBugs = localStorage.getItem('qa-nexus-bugs')
      if (storedBugs) {
        setBugs(JSON.parse(storedBugs))
      } else {
        setBugs([])
      }
    } catch (e) {
      console.error('Error loading bugs from localStorage:', e)
    }
  }

  useEffect(() => {
    loadBugs()
    // Listen for local storage changes (in case testcases fail in another tab or action)
    const handleStorageChange = () => {
      loadBugs()
    }
    window.addEventListener('storage', handleStorageChange)
    // Custom event listener for same-tab updates
    window.addEventListener('qa-nexus-bugs-updated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('qa-nexus-bugs-updated', handleStorageChange)
    }
  }, [])

  const handleResolveBug = (bugId: string) => {
    const updated = bugs.filter(b => b.id !== bugId)
    localStorage.setItem('qa-nexus-bugs', JSON.stringify(updated))
    setBugs(updated)
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('qa-nexus-bugs-updated'))

    setResolvedMessage('Bug resolved and removed successfully!')
    setTimeout(() => setResolvedMessage(null), 3000)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all bugs for the selected view?')) {
      let updated: BugReport[] = []
      if (selectedProjectId !== 'all') {
        updated = bugs.filter(b => b.projectId !== selectedProjectId)
      }
      localStorage.setItem('qa-nexus-bugs', JSON.stringify(updated))
      setBugs(updated)
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('qa-nexus-bugs-updated'))

      setResolvedMessage('Bugs cleared successfully!')
      setTimeout(() => setResolvedMessage(null), 3000)
    }
  }

  // Filter bugs
  const filteredBugs = bugs.filter(bug => {
    const matchesProject = selectedProjectId === 'all' || bug.projectId === selectedProjectId
    const matchesSearch = bug.testCaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.failedStep.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesProject && matchesSearch
  })

  // Grouped stats
  const totalBugs = filteredBugs.length
  const criticalBugs = filteredBugs.filter(b => b.priority === 'Critical').length
  const highBugs = filteredBugs.filter(b => b.priority === 'High').length
  const otherBugs = totalBugs - criticalBugs - highBugs

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {resolvedMessage && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-slide-in-right"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--accent-success)',
            color: 'var(--text-primary)'
          }}
        >
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-sm font-medium">{resolvedMessage}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
            <Bug size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Bugs</p>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{totalBugs}</h3>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Critical Priority</p>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{criticalBugs}</h3>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>High Priority</p>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{highBugs}</h3>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-primary)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Medium / Low</p>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{otherBugs}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Actions Panel */}
      <div className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Project Selector */}
          <div className="relative min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Project Filter</label>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="input-field w-full pl-3 pr-8 py-2 text-sm"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Search Bugs</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-9 pr-4 py-2 text-sm"
                placeholder="Search by test title, failed step, project name..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-end self-stretch md:self-end">
          <button
            onClick={handleClearAll}
            disabled={filteredBugs.length === 0}
            className="w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer"
            style={{
              borderColor: 'var(--border-strong)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)'
            }}
          >
            <Trash2 size={14} className="text-red-500" />
            Clear Selected
          </button>
        </div>
      </div>

      {/* Bugs Table / Card list */}
      <div className="card overflow-hidden">
        {filteredBugs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
              <Check size={28} />
            </div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>No active bugs logged</h3>
            <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
              {selectedProjectId === 'all' 
                ? 'All Playwright tests have passed successfully! There are no failures recorded currently.'
                : 'All Playwright tests for this project are clean and passing.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', width: '10%' }}>Bug ID</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', width: '25%' }}>Test Case & Project</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', width: '30%' }}>Failed Step / Error Trace</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', width: '20%' }}>Expected Result</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', width: '15%' }}>Logged At & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {filteredBugs.map(bug => (
                  <tr key={bug.id} className="hover:bg-white/40 transition-colors">
                    {/* Bug ID */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-xs font-bold" style={{ color: 'var(--accent-danger)' }}>{bug.id}</span>
                        <span
                          className={`badge text-xs px-2 py-0.5 rounded-full w-fit ${
                            bug.priority === 'Critical' ? 'priority-critical' :
                            bug.priority === 'High' ? 'priority-high' :
                            bug.priority === 'Medium' ? 'priority-medium' : 'priority-low'
                          }`}
                        >
                          {bug.priority}
                        </span>
                      </div>
                    </td>

                    {/* Test Case & Project */}
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{bug.testCaseTitle}</p>
                        <p className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>📁 {bug.projectName}</p>
                      </div>
                    </td>

                    {/* Failed Step & Error */}
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          <p className="text-xs font-semibold text-red-600">Failed at: "{bug.failedStep}"</p>
                        </div>
                        <pre className="text-[11px] p-2.5 rounded-lg font-mono overflow-x-auto max-w-md border" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b', whiteSpace: 'pre-wrap' }}>
                          {bug.errorTrace}
                        </pre>
                      </div>
                    </td>

                    {/* Expected Result */}
                    <td className="px-5 py-4 align-top">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{bug.expectedResult}</p>
                    </td>

                    {/* Logged At & Actions */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={12} />
                          <span>{new Date(bug.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <button
                          onClick={() => handleResolveBug(bug.id)}
                          className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border hover:bg-emerald-50 hover:text-emerald-700"
                          style={{
                            borderColor: 'var(--border-strong)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
