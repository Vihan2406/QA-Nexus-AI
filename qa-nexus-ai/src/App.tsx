import React from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './routes/auth'
import Dashboard from './routes/dashboard'

function AppRouter() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg-base)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
          </svg>
        </div>
        <div className="spinner" style={{ width: 24, height: 24 }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading QA Nexus AI…</p>
      </div>
    )
  }

  // Simple hash-based routing for local dev without a router dependency
  const hash = window.location.hash
  if (user && (hash === '' || hash === '#/' || hash === '#/dashboard')) {
    return <Dashboard />
  }

  return user ? <Dashboard /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
