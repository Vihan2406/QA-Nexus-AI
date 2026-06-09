import React, { useState } from 'react'
import { Download, FileText, BarChart2, ClipboardList, CheckSquare, Clock } from 'lucide-react'
import type { Project } from '../types'

interface ReportsProps {
  projects: Project[]
}

const REPORT_TYPES = [
  {
    id: 'summary',
    icon: BarChart2,
    title: 'Executive Summary',
    desc: 'High-level project health, story point velocity, and completion rates',
    format: 'PDF',
    color: 'var(--accent-primary)',
    bg: 'rgba(140, 98, 57, 0.08)',
  },
  {
    id: 'test-coverage',
    icon: CheckSquare,
    title: 'Test Coverage Report',
    desc: 'Manual vs. automated test breakdown, coverage gaps, and recommendations',
    format: 'CSV',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
  },
  {
    id: 'burndown',
    icon: ClipboardList,
    title: 'Sprint Burndown Report',
    desc: 'Detailed burndown analysis with ideal vs. actual trend deviations',
    format: 'PDF',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
  },
  {
    id: 'activity',
    icon: Clock,
    title: 'Activity Audit Log',
    desc: 'Full history of project changes, test case updates, and user actions',
    format: 'CSV',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.08)',
  },
]

export default function Reports({ projects }: ReportsProps) {
  const [generating, setGenerating] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState<string[]>([])

  const handleGenerate = async (id: string) => {
    setGenerating(id)
    await new Promise(r => setTimeout(r, 1500))
    setGenerating(null)
    setDownloaded(prev => [...prev, id])
    setTimeout(() => setDownloaded(prev => prev.filter(x => x !== id)), 3000)
  }

  const completedCount = projects.filter(p => p.status === 'Completed').length
  const totalPoints = projects.reduce((s, p) => s + p.total_story_points, 0)
  const completedPoints = projects.reduce((s, p) => s + (p.total_story_points - p.remaining_story_points), 0)

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, color: 'var(--accent-primary)' },
          { label: 'Completed', value: completedCount, color: '#16a34a' },
          { label: 'Story Points Done', value: completedPoints, color: '#d97706' },
          { label: 'Total Points', value: totalPoints, color: '#0284c7' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-bold mb-0.5" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Report generators */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Generate Reports</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Export project data in PDF or CSV format</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REPORT_TYPES.map(({ id, icon: Icon, title, desc, format, color, bg }) => (
            <div
              key={id}
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: bg, color }}
                    >
                      {format}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleGenerate(id)}
                disabled={!!generating}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: downloaded.includes(id) ? '#f0fdf4' : bg,
                  color: downloaded.includes(id) ? '#16a34a' : color,
                  border: `1px solid ${downloaded.includes(id) ? '#bbf7d0' : 'transparent'}`,
                }}
              >
                {generating === id ? (
                  <><div className="spinner w-3.5 h-3.5" style={{ borderColor: `${color}30`, borderTopColor: color }} /> Generating...</>
                ) : downloaded.includes(id) ? (
                  <><CheckSquare size={13} /> Downloaded!</>
                ) : (
                  <><Download size={13} /> Export {format}</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project summary table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Project Summary Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['Project', 'Status', 'Priority', 'Total Pts', 'Remaining', 'Completion'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No projects found. Create your first project to see data here.
                  </td>
                </tr>
              ) : (
                projects.map(p => {
                  const pct = p.total_story_points > 0
                    ? Math.round(((p.total_story_points - p.remaining_story_points) / p.total_story_points) * 100)
                    : 0
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td className="px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                      <td className="px-4 py-3">
                        <span className="badge text-xs" style={{
                          background: p.status === 'Completed' ? '#f0fdf4' : p.status === 'In Progress' ? '#fffbeb' : '#f1f5f9',
                          color: p.status === 'Completed' ? '#16a34a' : p.status === 'In Progress' ? '#d97706' : '#475569',
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs priority-${p.priority.toLowerCase()}`}>{p.priority}</span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.total_story_points}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--accent-warning)' }}>{p.remaining_story_points}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="progress-bar flex-1" style={{ minWidth: 60 }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', minWidth: 32 }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
