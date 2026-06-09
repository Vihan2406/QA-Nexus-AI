import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signInAsDemo: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signInAsDemo: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demoSessionStr = localStorage.getItem('qa-nexus-demo-session')
    if (demoSessionStr) {
      try {
        const ds = JSON.parse(demoSessionStr)
        setSession(ds)
        setUser(ds.user)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem('qa-nexus-demo-session')
      }
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      // Only set session if not currently logged in as demo
      const isDemo = localStorage.getItem('qa-nexus-demo-session') !== null
      if (!isDemo) {
        setSession(s)
        setUser(s?.user ?? null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    localStorage.removeItem('qa-nexus-demo-session')
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const signInAsDemo = () => {
    const mockUser: User = {
      id: 'demo-user-id',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'demo@qanexus.ai',
      user_metadata: { full_name: 'Demo Sandbox User' },
      app_metadata: {},
      created_at: new Date().toISOString(),
    }
    const mockSession: Session = {
      access_token: 'demo-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'demo-refresh-token',
      user: mockUser,
    }
    localStorage.setItem('qa-nexus-demo-session', JSON.stringify(mockSession))
    setSession(mockSession)
    setUser(mockUser)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signInAsDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
