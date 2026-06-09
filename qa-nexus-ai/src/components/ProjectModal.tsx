import React, { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Project, ProjectStatus, Priority } from '../types'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../context/AuthContext'

interface ProjectModalProps {
  onClose: () => void
  onSuccess: () => void
  editProject?: Project | null
}

const STATUS_OPTIONS: ProjectStatus[] = ['Not Started', 'In Progress', 'Under Review', 'Completed']
const PRIORITY_OPTIONS: Priority[] = ['Critical', 'High', 'Medium', 'Low']

export default function ProjectModal({ onClose, onSuccess, editProject }: ProjectModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState(editProject?.name ?? '')
  const [description, setDescription] = useState(editProject?.description ?? '')
  const [status, setStatus] = useState<ProjectStatus>(editProject?.status ?? 'Not Started')
  const [priority, setPriority] = useState<Priority>(editProject?.priority ?? 'Medium')
  const [totalPoints, setTotalPoints] = useState(String(editProject?.total_story_points ?? 0))
  const [remainingPoints, setRemainingPoints] = useState(String(editProject?.remaining_story_points ?? 0))
  const [startDate, setStartDate] = useState(editProject?.start_date?.split('T')[0] ?? '')
  const [targetDate, setTargetDate] = useState(editProject?.target_date?.split('T')[0] ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(editProject?.tags ?? [])
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t))

  const handleDelete = async () => {
    if (!user || !editProject) return
    setFormError(null)
    setLoading(true)
    try {
      if (user.id === 'demo-user-id') {
        const localData = localStorage.getItem('qa-nexus-projects')
        let projectsList: Project[] = localData ? JSON.parse(localData) : []
        projectsList = projectsList.filter(p => p.id !== editProject.id)
        localStorage.setItem('qa-nexus-projects', JSON.stringify(projectsList))
      } else {
        try {
          const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', editProject.id)
          if (deleteError) throw deleteError
        } catch (supabaseErr) {
          console.warn('[QA Nexus] Supabase delete failed, falling back to Local Storage:', supabaseErr)
          const localData = localStorage.getItem(`qa-nexus-projects-${user.id}`)
          let projectsList: Project[] = localData ? JSON.parse(localData) : []
          projectsList = projectsList.filter(p => p.id !== editProject.id)
          localStorage.setItem(`qa-nexus-projects-${user.id}`, JSON.stringify(projectsList))
        }
      }
      onSuccess()
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete project.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setFormError(null)
    setLoading(true)

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      status,
      priority,
      total_story_points: parseInt(totalPoints) || 0,
      remaining_story_points: parseInt(remainingPoints) || 0,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      target_date: targetDate ? new Date(targetDate).toISOString() : null,
      tags: tags.length > 0 ? tags : null,
    }

    try {
      if (user.id === 'demo-user-id') {
        const localData = localStorage.getItem('qa-nexus-projects')
        let projectsList: Project[] = localData ? JSON.parse(localData) : []

        if (editProject) {
          projectsList = projectsList.map(p =>
            p.id === editProject.id
              ? {
                  ...p,
                  ...payload,
                  updated_at: new Date().toISOString(),
                }
              : p
          )
        } else {
          const newProj: Project = {
            ...payload,
            id: `demo-p-${Date.now()}`,
            user_id: user.id,
            created_at: new Date().toISOString(),
          }
          projectsList = [newProj, ...projectsList]
        }
        localStorage.setItem('qa-nexus-projects', JSON.stringify(projectsList))
      } else {
        try {
          if (editProject) {
            const { error: updateError } = await supabase
              .from('projects')
              .update(payload)
              .eq('id', editProject.id)
            if (updateError) throw updateError
          } else {
            const { error: insertError } = await supabase
              .from('projects')
              .insert({ ...payload, user_id: user.id })
            if (insertError) throw insertError
          }
        } catch (supabaseErr) {
          console.warn('[QA Nexus] Supabase action failed, falling back to Local Storage:', supabaseErr)
          const localData = localStorage.getItem(`qa-nexus-projects-${user.id}`)
          let projectsList: Project[] = localData ? JSON.parse(localData) : []

          if (editProject) {
            projectsList = projectsList.map(p =>
              p.id === editProject.id
                ? {
                    ...p,
                    ...payload,
                    updated_at: new Date().toISOString(),
                  }
                : p
            )
          } else {
            const newProj: Project = {
              ...payload,
              id: `local-p-${Date.now()}`,
              user_id: user.id,
              created_at: new Date().toISOString(),
            }
            projectsList = [newProj, ...projectsList]
          }
          localStorage.setItem(`qa-nexus-projects-${user.id}`, JSON.stringify(projectsList))
        }
      }
      onSuccess()
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {editProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {editProject ? 'Update your project details' : 'Set up a new QA project'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Project Name <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. User Authentication Module"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Brief overview of the project scope and goals..."
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="input-field">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="input-field">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Story Points */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Total Story Points</label>
              <input
                type="number"
                value={totalPoints}
                onChange={e => setTotalPoints(e.target.value)}
                className="input-field"
                placeholder="100"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Remaining Points</label>
              <input
                type="number"
                value={remainingPoints}
                onChange={e => setRemainingPoints(e.target.value)}
                className="input-field"
                placeholder="60"
                min="0"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Target Date</label>
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="input-field flex-1"
                placeholder="Add a tag..."
              />
              <button type="button" onClick={addTag} className="btn-secondary px-3 py-2 flex-shrink-0">
                <Plus size={15} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(79, 70, 229, 0.2)' }}
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <Trash2 size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {formError && (
            <div className="p-3 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {formError}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-2">
            {editProject ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="text-xs px-3.5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90 animate-fade-in"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
              >
                Delete Project
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <div className="spinner w-4 h-4" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : null}
                {editProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
