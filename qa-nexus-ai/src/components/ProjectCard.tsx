import React from 'react'
import { Calendar, Tag, MoreHorizontal, TrendingUp } from 'lucide-react'
import type { Project } from '../types'

const STATUS_CONFIG = {
  'Not Started': { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8', label: 'Not Started' },
  'In Progress': { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b', label: 'In Progress' },
  'Under Review': { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', label: 'Under Review' },
  'Completed': { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e', label: 'Completed' },
}

const PRIORITY_CONFIG = {
  'Critical': 'priority-critical',
  'High': 'priority-high',
  'Medium': 'priority-medium',
  'Low': 'priority-low',
}

interface ProjectCardProps {
  project: Project
  onClick?: () => void
  onMenuClick?: (e: React.MouseEvent) => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectCard({ project, onClick, onMenuClick }: ProjectCardProps) {
  const statusCfg = STATUS_CONFIG[project.status]
  const progress = project.total_story_points > 0
    ? Math.round(((project.total_story_points - project.remaining_story_points) / project.total_story_points) * 100)
    : 0

  return (
    <div
      className="card p-5 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="badge"
              style={{ background: statusCfg.bg, color: statusCfg.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusCfg.dot }} />
              {statusCfg.label}
            </span>
            <span className={`badge ${PRIORITY_CONFIG[project.priority]}`}>
              {project.priority}
            </span>
          </div>
          <h3 className="font-semibold text-sm leading-snug truncate" style={{ color: 'var(--text-primary)' }}>
            {project.name}
          </h3>
        </div>
        <button
          onClick={onMenuClick}
          className="p-1 rounded-lg ml-2 flex-shrink-0 hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {project.description}
        </p>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Tag size={11} style={{ color: 'var(--text-muted)' }} />
          {project.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progress</span>
          <div className="flex items-center gap-1">
            <TrendingUp size={11} style={{ color: progress >= 50 ? '#16a34a' : 'var(--text-muted)' }} />
            <span className="text-xs font-semibold" style={{ color: progress >= 50 ? '#16a34a' : 'var(--text-secondary)' }}>
              {progress}%
            </span>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Story points */}
      <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-1">
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {project.total_story_points - project.remaining_story_points}
          </span>
          <span>/ {project.total_story_points} pts done</span>
        </div>
        <span style={{ color: 'var(--accent-warning)' }}>
          {project.remaining_story_points} remaining
        </span>
      </div>

      {/* Dates */}
      {(project.start_date || project.target_date) && (
        <div className="flex items-center gap-3 text-xs pt-3" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(project.start_date)}
          </span>
          <span>→</span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(project.target_date)}
          </span>
        </div>
      )}
    </div>
  )
}
