import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: { value: number; positive: boolean }
  accentColor?: string
}

export default function StatCard({
  label, value, subtext, icon: Icon, iconColor, iconBg, trend, accentColor
}: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {trend && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trend.positive ? '#f0fdf4' : '#fef2f2',
              color: trend.positive ? '#16a34a' : '#dc2626',
            }}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold mb-0.5" style={{ color: accentColor ?? 'var(--text-primary)' }}>
          {value}
        </p>
        <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {subtext && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtext}</p>
        )}
      </div>
    </div>
  )
}
