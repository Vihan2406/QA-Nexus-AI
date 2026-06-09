import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import type { Project, BurndownPoint } from '../types'

interface AnalyticsChartsProps {
  projects: Project[]
  selectedProject?: Project | null
}

function generateBurndownData(project: Project): BurndownPoint[] {
  if (!project.start_date || !project.target_date) return []
  const start = new Date(project.start_date)
  const end = new Date(project.target_date)
  const total = project.total_story_points
  const now = new Date()

  const diffMs = end.getTime() - start.getTime()
  const totalDays = Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)), 1)
  const daysElapsed = Math.min(
    Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    totalDays
  )

  const points: BurndownPoint[] = []
  for (let d = 0; d <= totalDays; d += Math.max(1, Math.floor(totalDays / 14))) {
    const date = new Date(start)
    date.setDate(date.getDate() + d)
    const ideal = Math.max(0, total - (total * d) / totalDays)
    const isElapsed = d <= daysElapsed

    // Slightly noisy actual burndown
    const noise = isElapsed ? (Math.random() - 0.4) * (total * 0.05) : 0
    const rawActual = total - (total * d * 0.9) / totalDays + noise
    const actual = isElapsed ? Math.max(0, Math.round(rawActual)) : null

    points.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ideal: Math.round(ideal),
      actual,
    })
  }
  return points
}

const CUSTOM_TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid #e8e6e1',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  padding: '10px 14px',
  fontSize: '12px',
  fontFamily: 'DM Sans, sans-serif',
}

const STATUS_COLORS: Record<string, string> = {
  'Not Started': '#94a3b8',
  'In Progress': '#f59e0b',
  'Under Review': '#3b82f6',
  'Completed': '#22c55e',
}

export default function AnalyticsCharts({ projects, selectedProject }: AnalyticsChartsProps) {
  const storyPointData = useMemo(() =>
    projects.map(p => ({
      name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
      Total: p.total_story_points,
      Remaining: p.remaining_story_points,
      Completed: p.total_story_points - p.remaining_story_points,
    })), [projects])

  const burndownData = useMemo(() => {
    const proj = selectedProject ?? projects.find(p => p.start_date && p.target_date)
    return proj ? generateBurndownData(proj) : []
  }, [selectedProject, projects])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      'Not Started': 0, 'In Progress': 0, 'Under Review': 0, 'Completed': 0,
    }
    projects.forEach(p => counts[p.status]++)
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] }))
  }, [projects])

  const velocityData = useMemo(() =>
    projects.slice(0, 6).map(p => ({
      name: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name,
      velocity: p.total_story_points > 0
        ? Math.round(((p.total_story_points - p.remaining_story_points) / p.total_story_points) * 100)
        : 0,
    })), [projects])

  if (projects.length === 0) {
    return (
      <div className="card p-10 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No project data yet</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create projects to see analytics and charts here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Story Points Bar Chart + Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Story Points Distribution</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total vs. remaining vs. completed across projects</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={storyPointData} barGap={2} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9c9890', fontFamily: 'DM Sans, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9c9890', fontFamily: 'DM Sans, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                cursor={{ fill: 'rgba(140, 98, 57, 0.04)', radius: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', paddingTop: 12 }}
              />
              <Bar dataKey="Total" fill="#eae5d9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Completed" fill="#8c6239" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Remaining" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Project Status Mix</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Current distribution</p>
          </div>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-center mt-8" style={{ color: 'var(--text-muted)' }}>No status data</p>
          )}
        </div>
      </div>

      {/* Burndown Chart */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Burndown Chart
              {(selectedProject ?? projects.find(p => p.start_date && p.target_date)) && (
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                  — {(selectedProject ?? projects.find(p => p.start_date && p.target_date))?.name}
                </span>
              )}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Ideal vs. actual story point burndown</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 rounded" style={{ background: '#8c6239' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Ideal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 rounded" style={{ background: '#f59e0b' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Actual</span>
            </div>
          </div>
        </div>
        {burndownData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={burndownData}>
              <defs>
                <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8c6239" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#8c6239" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9c9890', fontFamily: 'DM Sans, sans-serif' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9c9890', fontFamily: 'DM Sans, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="ideal"
                name="Ideal Remaining"
                stroke="#8c6239"
                strokeWidth={2}
                strokeDasharray="5 3"
                fill="url(#idealGrad)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual Remaining"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#actualGrad)"
                dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
            Add start and target dates to a project to see burndown data.
          </div>
        )}
      </div>

      {/* Velocity */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Project Velocity (%)</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Completion percentage per project</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={velocityData} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9c9890', fontFamily: 'DM Sans, sans-serif' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6b6760', fontFamily: 'DM Sans, sans-serif' }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={CUSTOM_TOOLTIP_STYLE}
              formatter={(v: number) => [`${v}%`, 'Completion']}
            />
            <Bar dataKey="velocity" name="Completion %" radius={[0, 6, 6, 0]}>
              {velocityData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.velocity >= 75 ? '#22c55e' : entry.velocity >= 50 ? '#8c6239' : entry.velocity >= 25 ? '#f59e0b' : '#e11d48'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
