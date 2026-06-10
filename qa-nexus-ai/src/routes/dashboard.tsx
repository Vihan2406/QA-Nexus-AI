import React, { useCallback, useEffect, useState } from 'react'
import {
  Plus, Search, Filter, SortDesc, Bell, RefreshCw,
  FolderOpen, Zap, TrendingUp, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import StatCard from '../components/StatCard'
import AITestGenerator from '../components/AITestGenerator'
import AITestPlan from '../components/AITestPlan'
import BugReporter from '../components/BugReporter'
import Notifications from '../components/Notifications'
import AnalyticsCharts from '../components/AnalyticsCharts'
import Reports from '../components/Reports'
import Team from '../components/Team'
import Settings from '../components/Settings'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../context/AuthContext'
import type { Project, DashboardStats } from '../types'

// Seed demo projects when none exist
const DEMO_PROJECTS: Omit<Project, 'id' | 'user_id' | 'created_at'>[] = [
  {
    name: 'User Authentication Module',
    description: 'Complete login, registration, SSO flows with session management.',
    status: 'In Progress',
    priority: 'Critical',
    total_story_points: 120,
    remaining_story_points: 45,
    start_date: new Date(Date.now() - 30 * 864e5).toISOString(),
    target_date: new Date(Date.now() + 14 * 864e5).toISOString(),
    tags: ['Auth', 'Security', 'Backend'],
  },
  {
    name: 'Payment Gateway Integration',
    description: 'Stripe/PayPal integration with subscription handling and billing.',
    status: 'Under Review',
    priority: 'High',
    total_story_points: 80,
    remaining_story_points: 12,
    start_date: new Date(Date.now() - 60 * 864e5).toISOString(),
    target_date: new Date(Date.now() + 7 * 864e5).toISOString(),
    tags: ['Payments', 'Stripe'],
  },
  {
    name: 'Dashboard Analytics v2',
    description: 'Real-time KPI charts, burndown reports, and team velocity metrics.',
    status: 'Not Started',
    priority: 'Medium',
    total_story_points: 60,
    remaining_story_points: 60,
    start_date: new Date(Date.now() + 7 * 864e5).toISOString(),
    target_date: new Date(Date.now() + 45 * 864e5).toISOString(),
    tags: ['Analytics', 'UI'],
  },
  {
    name: 'Mobile App QA Regression',
    description: 'Full regression suite for iOS and Android across 3 OS versions.',
    status: 'Completed',
    priority: 'High',
    total_story_points: 200,
    remaining_story_points: 0,
    start_date: new Date(Date.now() - 90 * 864e5).toISOString(),
    target_date: new Date(Date.now() - 10 * 864e5).toISOString(),
    tags: ['Mobile', 'iOS', 'Android'],
  },
]

function computeStats(projects: Project[]): DashboardStats {
  return {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === 'Completed').length,
    totalStoryPoints: projects.reduce((s, p) => s + p.total_story_points, 0),
    remainingStoryPoints: projects.reduce((s, p) => s + p.remaining_story_points, 0),
    automatedTests: 0,
    manualTests: 0,
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  interface NotificationItem {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    timestamp: string
  }
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem('qa-nexus-notifications')
      if (stored) {
        setNotifications(JSON.parse(stored))
      } else {
        const demoNotifs: NotificationItem[] = [
          {
            id: 'notif-1',
            title: 'Welcome to QA Nexus AI',
            message: 'Your workspace is ready. You can now generate test plans, E2E scripts, and invite team members.',
            type: 'success',
            read: false,
            timestamp: new Date(Date.now() - 30 * 60000).toISOString()
          },
          {
            id: 'notif-2',
            title: 'Team Member Joined',
            message: 'Priya Sharma (QA Lead) has joined your workspace.',
            type: 'info',
            read: false,
            timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
          },
          {
            id: 'notif-3',
            title: 'Overdue Project Warning',
            message: 'Payment Gateway Integration is approaching its target date soon.',
            type: 'warning',
            read: false,
            timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
          }
        ]
        localStorage.setItem('qa-nexus-notifications', JSON.stringify(demoNotifs))
        setNotifications(demoNotifs)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    loadNotifications()
    const handleNotifUpdate = () => loadNotifications()
    window.addEventListener('storage', handleNotifUpdate)
    window.addEventListener('qa-nexus-notifications-updated', handleNotifUpdate)
    return () => {
      window.removeEventListener('storage', handleNotifUpdate)
      window.removeEventListener('qa-nexus-notifications-updated', handleNotifUpdate)
    }
  }, [])

  const unreadNotifsCount = notifications.filter(n => !n.read).length

  const fetchProjects = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      if (user.id === 'demo-user-id') {
        const localData = localStorage.getItem('qa-nexus-projects')
        if (localData) {
          setProjects(JSON.parse(localData))
        } else {
          const inserts = DEMO_PROJECTS.map((p, idx) => ({
            ...p,
            id: `demo-p-${idx}`,
            user_id: user.id,
            created_at: new Date().toISOString(),
          })) as Project[]
          localStorage.setItem('qa-nexus-projects', JSON.stringify(inserts))
          setProjects(inserts)
        }
      } else {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        if (!data || data.length === 0) {
          // Insert demo data for new users
          const inserts = DEMO_PROJECTS.map(p => ({ ...p, user_id: user.id }))
          const { data: inserted, error: insertError } = await supabase.from('projects').insert(inserts).select()
          if (insertError) throw insertError
          setProjects((inserted as Project[]) ?? [])
        } else {
          setProjects(data as Project[])
        }
      }
    } catch (err) {
      console.warn('[QA Nexus] Supabase query failed, falling back to Local Storage:', err)
      const localData = localStorage.getItem(`qa-nexus-projects-${user.id}`)
      if (localData) {
        setProjects(JSON.parse(localData))
      } else {
        const inserts = DEMO_PROJECTS.map((p, idx) => ({
          ...p,
          id: `local-p-${idx}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })) as Project[]
        localStorage.setItem(`qa-nexus-projects-${user.id}`, JSON.stringify(inserts))
        setProjects(inserts)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = computeStats(projects)
  const burndownProject = selectedProject ?? projects.find(p => p.start_date && p.target_date) ?? null

  const overdueProjsCount = projects.filter(p => {
    if (!p.target_date || p.status === 'Completed') return false
    return new Date(p.target_date) < new Date()
  }).length

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5"
          style={{
            background: 'rgba(244, 241, 234, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <h1 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'projects' && 'Projects'}
              {activeTab === 'test-plan' && 'AI Test Plan'}
              {activeTab === 'test-generator' && 'AI Test Generator'}
              {activeTab === 'bug-reporter' && 'Bug Reporter'}
              {activeTab === 'analytics' && 'Analytics'}
              {activeTab === 'reports' && 'Reports'}
              {activeTab === 'team' && 'Team'}
              {activeTab === 'settings' && 'Settings'}
              {activeTab === 'notifications' && 'Notifications'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
             {/* Notifications bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-lg hover:bg-white transition-colors"
            >
              <Bell size={17} style={{ color: 'var(--text-secondary)' }} />
              {unreadNotifsCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: '#dc2626', fontSize: 9 }}
                >
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Overdue warning */}
            {overdueProjsCount > 0 && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#fff7ed', color: '#d97706', border: '1px solid #fed7aa' }}
              >
                <AlertTriangle size={12} />
                {overdueProjsCount} overdue
              </div>
            )}

            {activeTab === 'projects' || activeTab === 'overview' ? (
              <button
                onClick={() => { setEditProject(null); setShowModal(true) }}
                className="btn-primary flex items-center gap-1.5 py-2"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">New Project</span>
              </button>
            ) : null}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <>
              {/* Welcome banner */}
              <div
                className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' }}
              >
                <div className="absolute right-0 top-0 w-64 h-full opacity-10">
                  <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white" />
                  <div className="absolute bottom-2 right-16 w-16 h-16 rounded-full bg-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/80 text-xs mb-1">Welcome back 👋</p>
                  <h2 className="text-white font-bold text-xl mb-0.5">
                    {user?.user_metadata?.full_name ?? 'QA Engineer'}
                  </h2>
                  <p className="text-white/70 text-sm">
                    You have {stats.remainingStoryPoints} story points remaining across {stats.totalProjects} projects.
                  </p>
                </div>
                <div className="relative z-10 hidden sm:block">
                  <button
                    onClick={() => setActiveTab('test-generator')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)' }}
                  >
                    <Zap size={15} />
                    Generate Tests
                  </button>
                </div>
              </div>

              {/* KPI Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Projects"
                  value={stats.totalProjects}
                  subtext={`${stats.completedProjects} completed`}
                  icon={FolderOpen}
                  iconColor="var(--accent-primary)"
                  iconBg="rgba(140, 98, 57, 0.1)"
                  trend={{ value: 12, positive: true }}
                />
                <StatCard
                  label="Story Points Done"
                  value={stats.totalStoryPoints - stats.remainingStoryPoints}
                  subtext={`of ${stats.totalStoryPoints} total`}
                  icon={TrendingUp}
                  iconColor="#059669"
                  iconBg="rgba(5, 150, 105, 0.1)"
                  trend={{ value: 8, positive: true }}
                />
                <StatCard
                  label="Remaining Points"
                  value={stats.remainingStoryPoints}
                  subtext="across active projects"
                  icon={Clock}
                  iconColor="#d97706"
                  iconBg="rgba(217, 119, 6, 0.1)"
                />
                <StatCard
                  label="Completion Rate"
                  value={`${stats.totalStoryPoints > 0 ? Math.round(((stats.totalStoryPoints - stats.remainingStoryPoints) / stats.totalStoryPoints) * 100) : 0}%`}
                  subtext="overall progress"
                  icon={CheckCircle2}
                  iconColor="var(--accent-primary)"
                  iconBg="rgba(140, 98, 57, 0.1)"
                  trend={{ value: 5, positive: true }}
                />
              </div>

              {/* Compact charts */}
              <AnalyticsCharts projects={projects} selectedProject={burndownProject} />

              {/* Recent projects */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Projects</h2>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {loading
                    ? Array(4).fill(0).map((_, i) => (
                      <div key={i} className="card p-5 space-y-3">
                        <div className="shimmer h-5 rounded w-3/4" />
                        <div className="shimmer h-3 rounded w-full" />
                        <div className="shimmer h-3 rounded w-1/2" />
                        <div className="shimmer h-2 rounded w-full mt-4" />
                      </div>
                    ))
                    : projects.slice(0, 4).map(p => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onClick={() => { setSelectedProject(p); setActiveTab('analytics') }}
                        onMenuClick={e => { e.stopPropagation(); setEditProject(p); setShowModal(true) }}
                      />
                    ))
                  }
                </div>
              </div>
            </>
          )}

          {/* ─── PROJECTS ─── */}
          {activeTab === 'projects' && (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-field pl-9"
                    placeholder="Search projects..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', minWidth: 140 }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <button className="p-2 rounded-lg hover:bg-white transition-colors" onClick={fetchProjects}>
                  <RefreshCw size={15} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button className="p-2 rounded-lg hover:bg-white transition-colors">
                  <SortDesc size={15} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="card p-5 space-y-3">
                      <div className="shimmer h-5 rounded w-3/4" />
                      <div className="shimmer h-3 rounded w-full" />
                      <div className="shimmer h-3 rounded w-1/2" />
                      <div className="shimmer h-2 rounded w-full mt-4" />
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="card p-12 flex flex-col items-center justify-center text-center">
                  <FolderOpen size={36} style={{ color: 'var(--border-strong)', marginBottom: 12 }} />
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {searchQuery || statusFilter !== 'All' ? 'No matching projects' : 'No projects yet'}
                  </p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    {searchQuery || statusFilter !== 'All'
                      ? 'Try adjusting your filters'
                      : 'Create your first project to get started'
                    }
                  </p>
                  {!searchQuery && statusFilter === 'All' && (
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                      <Plus size={15} /> Create Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProjects.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onClick={() => { setSelectedProject(p); setActiveTab('analytics') }}
                      onMenuClick={e => { e.stopPropagation(); setEditProject(p); setShowModal(true) }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── AI TEST PLAN ─── */}
          {activeTab === 'test-plan' && (
            <AITestPlan projects={projects} />
          )}

          {/* ─── AI TEST GENERATOR ─── */}
          {activeTab === 'test-generator' && (
            <AITestGenerator projects={projects} />
          )}

          {/* ─── BUG REPORTER ─── */}
          {activeTab === 'bug-reporter' && (
            <BugReporter projects={projects} />
          )}

          {/* ─── ANALYTICS ─── */}
          {activeTab === 'analytics' && (
            <>
              {selectedProject && (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm mb-2"
                  style={{ background: 'rgba(79, 70, 229, 0.07)', border: '1px solid rgba(79, 70, 229, 0.15)' }}
                >
                  <span style={{ color: 'var(--accent-primary)' }}>📌</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Showing burndown for: <strong style={{ color: 'var(--text-primary)' }}>{selectedProject.name}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="ml-auto text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Clear
                  </button>
                </div>
              )}
              <AnalyticsCharts projects={projects} selectedProject={burndownProject} />
            </>
          )}

          {/* ─── REPORTS ─── */}
          {activeTab === 'reports' && <Reports projects={projects} />}

          {/* ─── TEAM ─── */}
          {activeTab === 'team' && <Team />}

          {/* ─── NOTIFICATIONS ─── */}
          {activeTab === 'notifications' && <Notifications />}

          {/* ─── SETTINGS ─── */}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <ProjectModal
          onClose={() => { setShowModal(false); setEditProject(null) }}
          onSuccess={fetchProjects}
          editProject={editProject}
        />
      )}
    </div>
  )
}
