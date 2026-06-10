import React, { useState, useEffect } from 'react'
import {
  Bell, Check, Trash2, CheckCircle2, AlertCircle, AlertTriangle, Info, Clock
} from 'lucide-react'

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  timestamp: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem('qa-nexus-notifications')
      if (stored) {
        setNotifications(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error loading notifications:', e)
    }
  }

  useEffect(() => {
    loadNotifications()
    const handleNotifUpdate = () => {
      loadNotifications()
    }
    window.addEventListener('storage', handleNotifUpdate)
    window.addEventListener('qa-nexus-notifications-updated', handleNotifUpdate)
    return () => {
      window.removeEventListener('storage', handleNotifUpdate)
      window.removeEventListener('qa-nexus-notifications-updated', handleNotifUpdate)
    }
  }, [])

  const markAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
    localStorage.setItem('qa-nexus-notifications', JSON.stringify(updated))
    setNotifications(updated)
    window.dispatchEvent(new Event('qa-nexus-notifications-updated'))
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    localStorage.setItem('qa-nexus-notifications', JSON.stringify(updated))
    setNotifications(updated)
    window.dispatchEvent(new Event('qa-nexus-notifications-updated'))
    
    setToastMessage('All notifications marked as read!')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    localStorage.setItem('qa-nexus-notifications', JSON.stringify(updated))
    setNotifications(updated)
    window.dispatchEvent(new Event('qa-nexus-notifications-updated'))
  }

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      localStorage.setItem('qa-nexus-notifications', JSON.stringify([]))
      setNotifications([])
      window.dispatchEvent(new Event('qa-nexus-notifications-updated'))
      
      setToastMessage('All notifications cleared!')
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-600" />
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-600" />
      default:
        return <Info size={16} className="text-blue-600" />
    }
  };

  const getBgColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return 'rgba(21, 128, 61, 0.08)'
      case 'error':
        return 'rgba(185, 28, 28, 0.08)'
      case 'warning':
        return 'rgba(194, 120, 3, 0.08)'
      default:
        return 'rgba(59, 130, 246, 0.08)'
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-slide-in-right"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--accent-success)',
            color: 'var(--text-primary)'
          }}
        >
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(140, 98, 57, 0.1)', color: 'var(--accent-primary)' }}>
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notification Inbox</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Manage alerts, system updates, and test case failures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.read).length === 0}
            className="px-4 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer hover:bg-zinc-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--border-strong)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)'
            }}
          >
            <Check size={14} />
            Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="px-4 py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer hover:bg-zinc-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--border-strong)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)'
            }}
          >
            <Trash2 size={14} className="text-red-500" />
            Clear Inbox
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(140, 98, 57, 0.08)', color: 'var(--accent-primary)' }}>
              <Bell size={28} />
            </div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>All caught up!</h3>
            <p className="text-xs max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              There are no notifications in your inbox. Check back later for task statuses and test case updates.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-5 transition-colors ${!notif.read ? 'bg-amber-50/20' : 'hover:bg-white/40'}`}
              >
                {/* Type Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: getBgColor(notif.type) }}
                >
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-semibold'}`} style={{ color: 'var(--text-primary)' }}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] pt-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1.5 rounded-lg border transition-colors cursor-pointer hover:bg-emerald-50 hover:text-emerald-700"
                      title="Mark as read"
                      style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                    >
                      <Check size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 rounded-lg border transition-colors cursor-pointer hover:bg-red-50 hover:text-red-700"
                    title="Delete notification"
                    style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  >
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
