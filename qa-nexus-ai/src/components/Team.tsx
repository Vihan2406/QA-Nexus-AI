import React, { useState } from 'react'
import { UserPlus, Mail, Shield, User, Crown, Eye, X, Send } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'QA Lead' | 'Viewer'
  status: 'Active' | 'Invited'
  joinedAt: string
}

const MOCK_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@company.com', role: 'Owner', status: 'Active', joinedAt: '2024-01-15' },
  { id: '2', name: 'Priya Sharma', email: 'priya@company.com', role: 'QA Lead', status: 'Active', joinedAt: '2024-02-10' },
  { id: '3', name: 'James Wu', email: 'james@company.com', role: 'Admin', status: 'Active', joinedAt: '2024-03-01' },
  { id: '4', name: 'Sofia Martinez', email: 'sofia@company.com', role: 'Viewer', status: 'Invited', joinedAt: '2024-06-01' },
]

const ROLE_CONFIG = {
  Owner: { icon: Crown, color: '#d97706', bg: '#fffbeb', border: '#fed7aa' },
  Admin: { icon: Shield, color: 'var(--accent-primary)', bg: 'rgba(140, 98, 57, 0.08)', border: 'var(--border-subtle)' },
  'QA Lead': { icon: User, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
  Viewer: { icon: Eye, color: '#6b6760', bg: '#f5f4f1', border: '#d4d0c8' },
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Viewer')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    await new Promise(r => setTimeout(r, 1200))
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Invited',
      joinedAt: new Date().toISOString().split('T')[0],
    }
    setMembers(prev => [...prev, newMember])
    setInviteEmail('')
    setInviting(false)
    setInviteSuccess(true)
    setTimeout(() => setInviteSuccess(false), 3000)
  }

  const handleRemove = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(79, 70, 229, 0.1)' }}
          >
            <UserPlus size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Invite Team Member</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add collaborators to your workspace</p>
          </div>
        </div>
        <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="input-field pl-9"
              placeholder="colleague@company.com"
              required
            />
          </div>
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as TeamMember['role'])}
            className="input-field"
            style={{ width: 'auto', minWidth: 120 }}
          >
            <option value="Admin">Admin</option>
            <option value="QA Lead">QA Lead</option>
            <option value="Viewer">Viewer</option>
          </select>
          <button type="submit" disabled={inviting} className="btn-primary flex items-center gap-2">
            {inviting ? (
              <div className="spinner w-4 h-4" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
            ) : <Send size={14} />}
            {inviting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
        {inviteSuccess && (
          <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: '#16a34a' }}>
            ✓ Invitation sent successfully!
          </p>
        )}
      </div>

      {/* Members list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Team Members
            <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {members.length}
            </span>
          </h3>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {members.map(member => {
            const roleCfg = ROLE_CONFIG[member.role]
            const RoleIcon = roleCfg.icon
            const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                >
                  {initials}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {member.name}
                    </p>
                    {member.status === 'Invited' && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fed7aa' }}>
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{member.email}</p>
                </div>
                {/* Role badge */}
                <span
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{ background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}` }}
                >
                  <RoleIcon size={11} />
                  {member.role}
                </span>
                {/* Remove */}
                {member.role !== 'Owner' && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Role permissions table */}
      <div className="card p-5">
        <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Role Permissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="text-left py-2 pr-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Permission</th>
                {(['Owner', 'Admin', 'QA Lead', 'Viewer'] as const).map(role => (
                  <th key={role} className="text-center py-2 px-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{role}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {[
                { perm: 'View Projects', owner: true, admin: true, qa: true, viewer: true },
                { perm: 'Create/Edit Projects', owner: true, admin: true, qa: true, viewer: false },
                { perm: 'Delete Projects', owner: true, admin: true, qa: false, viewer: false },
                { perm: 'Generate Test Cases', owner: true, admin: true, qa: true, viewer: false },
                { perm: 'Export Reports', owner: true, admin: true, qa: true, viewer: true },
                { perm: 'Manage Team', owner: true, admin: true, qa: false, viewer: false },
                { perm: 'Billing & Settings', owner: true, admin: false, qa: false, viewer: false },
              ].map(({ perm, owner, admin, qa, viewer }) => (
                <tr key={perm}>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{perm}</td>
                  {[owner, admin, qa, viewer].map((allowed, i) => (
                    <td key={i} className="text-center py-2.5 px-3">
                      {allowed
                        ? <span style={{ color: '#22c55e' }}>✓</span>
                        : <span style={{ color: '#e2e0db' }}>—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
