import React from 'react'
import {
  Zap, LayoutDashboard, FolderKanban, FlaskConical, BarChart2,
  FileText, Settings, Bell, ChevronRight, LogOut, HelpCircle, Users, ClipboardList, Bug
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const NAV_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'projects', icon: FolderKanban, label: 'Projects' },
  { id: 'test-plan', icon: ClipboardList, label: 'Test Plan' },
  { id: 'test-generator', icon: FlaskConical, label: 'AI Test Generator' },
  { id: 'bug-reporter', icon: Bug, label: 'Bug Reporter' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'team', icon: Users, label: 'Team' },
]

const BOTTOM_ITEMS = [
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'help', icon: HelpCircle, label: 'Help & Docs' },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, signOut } = useAuth()
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'QA'

  return (
    <aside
      className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 overflow-y-auto"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>QA Nexus</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Platform</p>
          </div>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-3">
        <button
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm group"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(140, 98, 57, 0.15)', color: 'var(--accent-primary)' }}>
              <span className="text-xs font-bold">W</span>
            </div>
            <span className="font-medium truncate" style={{ color: 'var(--text-primary)', maxWidth: 110 }}>
              My Workspace
            </span>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-1.5 mt-1" style={{ color: 'var(--text-muted)' }}>
          Main Menu
        </p>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`nav-item w-full text-left mb-0.5 ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
            {(id === 'test-generator' || id === 'test-plan') && (
              <span
                className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold animate-pulse"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', fontSize: '10px' }}
              >
                AI
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {BOTTOM_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`nav-item w-full text-left mb-0.5 ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}

        {/* User profile */}
        <div
          className="flex items-center gap-2.5 mt-3 p-2.5 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.user_metadata?.full_name ?? 'QA Engineer'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex-shrink-0 p-1 rounded-md hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
