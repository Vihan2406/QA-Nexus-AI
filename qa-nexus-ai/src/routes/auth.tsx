import React, { useState } from 'react'
import { supabase } from '../integrations/supabase/client'
import { useAuth } from '../context/AuthContext'
import {
  Zap, Github, CheckCircle, ArrowRight, Shield, BarChart2, Cpu,
  GitBranch, Terminal, Star, Check, Sparkles, Send, Users, X, Eye, EyeOff
} from 'lucide-react'

type AuthMode = 'signin' | 'signup'

const FEATURES = [
  {
    icon: Cpu,
    label: 'AI-Powered Test Architect',
    desc: 'Instantly convert specs and user stories into structured test cases and E2E scripts.',
    color: 'var(--accent-primary)',
    bg: 'rgba(140, 98, 57, 0.08)',
  },
  {
    icon: Terminal,
    label: 'Playwright & Cypress Native',
    desc: 'Export production-ready E2E automation scripts in JavaScript/TypeScript with zero configuration.',
    color: 'var(--accent-secondary)',
    bg: 'rgba(176, 137, 104, 0.08)',
  },
  {
    icon: GitBranch,
    label: 'CI/CD Pipeline Integration',
    desc: 'Trigger regression suites automatically with webhooks for GitHub Actions, GitLab, and Jenkins.',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)',
  },
  {
    icon: BarChart2,
    label: 'Burndown & Velocity Tracking',
    desc: 'Track sprint progress with real-time burndown charts, velocity metrics, and automated point estimation.',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
  },
]

const STATS = [
  { value: '1.2M+', label: 'Tests Generated' },
  { value: '94%', label: 'Less Manual Coding' },
  { value: '12,000+', label: 'Developer Hours Saved' },
  { value: '4.9/5', label: 'Capterra Rating' },
]

const REVIEWS = [
  {
    quote: "QA Nexus AI changed how we release software. Our automation time went from days to minutes.",
    author: "Marcus Chen",
    role: "QA Lead at Stripe",
    rating: 5,
    avatarBg: 'var(--accent-primary)',
  },
  {
    quote: "The Cypress script generator is incredibly accurate. It saved us hundreds of hours of manual coding.",
    author: "Sarah Jenkins",
    role: "Lead DevOps at Vercel",
    rating: 5,
    avatarBg: '#06b6d4',
  },
  {
    quote: "Enterprise security and automated sprint tracking combined with AI is exactly what our organization needed.",
    author: "Elena Rostova",
    role: "VP of Engineering at Gitlab",
    rating: 5,
    avatarBg: '#059669',
  },
]

const PRICING = [
  {
    name: 'Free Starter',
    price: '$0',
    desc: 'Perfect for individual QA engineers testing the waters.',
    features: [
      '5 active projects',
      'AI test generation (100 runs/mo)',
      'Basic Cypress/Playwright scripts',
      'Local Storage sandbox',
    ],
    popular: false,
    cta: 'Get Started Free',
  },
  {
    name: 'Professional Pro',
    price: '$49',
    period: '/month',
    desc: 'Designed for high-growth software teams who need speed.',
    features: [
      'Unlimited projects',
      'Unlimited AI test generations',
      'Full CI/CD integrations',
      'Custom webhooks (Slack, Jira)',
      'PDF & CSV Executive reports',
      'Prioritized support queue',
    ],
    popular: true,
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For large-scale security-first organizations.',
    features: [
      'Dedicated private AI model',
      'Single Sign-On (SSO / SAML)',
      '99.9% SLA uptime guarantee',
      'Dedicated solutions engineer',
      'On-premise deployment support',
    ],
    popular: false,
    cta: 'Contact Sales',
  },
]

export default function AuthPage() {
  const { signInAsDemo } = useAuth()
  
  // Modals & Forms State
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Demo Booking State
  const [demoName, setDemoName] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoCompany, setDemoCompany] = useState('')
  const [demoDate, setDemoDate] = useState('')
  const [demoTime, setDemoTime] = useState('')
  const [demoBookingSuccess, setDemoBookingSuccess] = useState(false)

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSubmitDemo = (e: React.FormEvent) => {
    e.preventDefault()
    setDemoBookingSuccess(true)
    setTimeout(() => {
      setDemoBookingSuccess(false)
      setDemoName('')
      setDemoEmail('')
      setDemoCompany('')
      setDemoDate('')
      setDemoTime('')
    }, 4000)
  }

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (authMode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}`,
          },
        })
        if (signUpError) throw signUpError
        setSuccess('Check your email for a confirmation link.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    setFormError(null)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}` },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'OAuth failed. Please try again.')
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg-base)' }}>
      
      {/* ─── HEADER / NAVBAR ─── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-200" style={{ background: 'rgba(244, 241, 234, 0.85)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleScrollTo('hero')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>QA Nexus AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => handleScrollTo('features')} className="transition-colors hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-secondary)' }}>Features</button>
            <button onClick={() => handleScrollTo('stats')} className="transition-colors hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-secondary)' }}>Stats</button>
            <button onClick={() => handleScrollTo('reviews')} className="transition-colors hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-secondary)' }}>Reviews</button>
            <button onClick={() => handleScrollTo('pricing')} className="transition-colors hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-secondary)' }}>Pricing</button>
            <button onClick={() => handleScrollTo('demo')} className="transition-colors hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-secondary)' }}>Book Demo</button>
          </nav>

          <div>
            <button
              onClick={() => { setAuthMode('signin'); setFormError(null); setSuccess(null); setShowAuthModal(true) }}
              className="text-xs font-semibold px-4 py-2 rounded-lg border transition-all"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-strong)',
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ─── SCROLLABLE CONTENT ─── */}
      <main className="flex-1">
        
        {/* 1. HERO SECTION */}
        <section id="hero" className="relative grid-bg pt-20 pb-28 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(140, 98, 57, 0.08)', color: 'var(--accent-primary)' }}>
              <Sparkles size={12} />
              <span>Next-Gen AI Testing Sandbox is live</span>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-extrabold leading-tight tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Build Bulletproof Software at <br className="hidden md:inline" />
              <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10x QA Velocity.</span>
            </h1>
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The AI-driven quality assurance workspace that designs test plans, writes E2E automation scripts, and monitors sprint cycles in a unified developer sandbox.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => { setAuthMode('signup'); setFormError(null); setSuccess(null); setShowAuthModal(true) }}
                className="btn-primary py-3 px-6 flex items-center gap-2 text-sm font-semibold"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => handleScrollTo('demo')}
                className="btn-secondary py-3 px-6 text-sm font-semibold shadow-sm"
              >
                Book a Free Demo
              </button>
            </div>
          </div>
        </section>

        {/* 2. STATISTICS SECTION */}
        <section id="stats" className="py-16 px-6" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center space-y-1">
                  <p className="font-heading text-4xl font-extrabold" style={{ color: 'var(--accent-primary)' }}>{stat.value}</p>
                  <p className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. FEATURES SECTION */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--accent-primary)' }}>Engineered for QA Leaders</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Zero to E2E Testing in Seconds</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Everything you need to automate validation, monitor project health, and ship premium code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={i}
                  className="card p-6 flex gap-4 transition-all hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: feat.bg }}>
                    <Icon size={18} style={{ color: feat.color }} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{feat.label}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. REVIEWS / TESTIMONIALS SECTION */}
        <section id="reviews" className="py-20 px-6" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-3 mb-16">
              <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--accent-primary)' }}>Testimonials</p>
              <h2 className="font-heading text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Loved by Developers & QA Teams</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {REVIEWS.map((review, i) => (
                <div key={i} className="card p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-0.5">
                      {Array(review.rating).fill(0).map((_, idx) => (
                        <Star key={idx} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      "{review.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: review.avatarBg }}>
                      {review.author[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{review.author}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. PRICING SECTION */}
        <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--accent-primary)' }}>Flexible Plans</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Pricing for Teams of Any Size</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Start building projects in our local sandbox free, and unlock premium cloud-sharing when you need scale.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className="card p-6 flex flex-col justify-between relative"
                style={{
                  borderColor: plan.popular ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  boxShadow: plan.popular ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase text-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                  >
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                    {plan.period && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.period}</span>}
                  </div>

                  <ul className="space-y-3 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => { setAuthMode('signup'); setFormError(null); setSuccess(null); setShowAuthModal(true) }}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. BOOK A DEMO SECTION */}
        <section id="demo" className="py-24 px-6 border-t" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-xl mx-auto card p-8 shadow-md">
            <div className="text-center space-y-2 mb-8">
              <h2 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Book a Free Demo</h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Experience custom AI test generation tailored specifically to your product architecture.</p>
            </div>

            {demoBookingSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Demo Requested Successfully!</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>We've sent a calendar invitation to <strong style={{ color: 'var(--accent-primary)' }}>{demoEmail}</strong>.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitDemo} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                  <input
                    type="text"
                    value={demoName}
                    onChange={e => setDemoName(e.target.value)}
                    className="input-field"
                    placeholder="Marcus Chen"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                  <input
                    type="email"
                    value={demoEmail}
                    onChange={e => setDemoEmail(e.target.value)}
                    className="input-field"
                    placeholder="marcus@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Company / Team Name</label>
                  <input
                    type="text"
                    value={demoCompany}
                    onChange={e => setDemoCompany(e.target.value)}
                    className="input-field"
                    placeholder="Stripe"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Preferred Date</label>
                    <input
                      type="date"
                      value={demoDate}
                      onChange={e => setDemoDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Preferred Time</label>
                    <input
                      type="time"
                      value={demoTime}
                      onChange={e => setDemoTime(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-semibold mt-4">
                  <Send size={13} />
                  <span>Request Calendar Invite</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6 text-center text-xs border-t" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} QA Nexus AI — All rights reserved.</p>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Designed with rich aesthetics for DevOps teams worldwide.</p>
      </footer>

      {/* ─── AUTH MODAL ─── */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content max-w-md relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={16} />
            </button>

            <div className="p-6">
              <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {authMode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
                {authMode === 'signin'
                  ? 'Sign in to access your QA Nexus workspace'
                  : 'Start your 14-day free trial — no card required'}
              </p>

              {/* Demo Sandbox Button */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => {
                    signInAsDemo()
                    setShowAuthModal(false)
                  }}
                  className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition-all border border-amber-300 hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                    color: '#b45309',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Enter Sandbox Mode (No Sign Up Needed)</span>
                </button>
              </div>

              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => handleOAuth('google')}
                  disabled={!!oauthLoading}
                  className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs font-medium"
                >
                  {oauthLoading === 'google' ? (
                    <div className="spinner w-3.5 h-3.5" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  )}
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleOAuth('github')}
                  disabled={!!oauthLoading}
                  className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs font-medium"
                >
                  {oauthLoading === 'github' ? (
                    <div className="spinner w-3.5 h-3.5" />
                  ) : (
                    <Github size={15} style={{ color: 'var(--text-primary)' }} />
                  )}
                  <span>GitHub</span>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>or continue with email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitAuth} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="input-field"
                      placeholder="Alex Johnson"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="alex@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="8+ characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {formError && (
                  <div className="p-2.5 rounded-lg text-xs" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    {formError}
                  </div>
                )}
                {success && (
                  <div className="p-2.5 rounded-lg text-xs flex items-center gap-2" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                    <CheckCircle size={14} />
                    <span>{success}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2">
                  {loading ? (
                    <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In' : 'Register Account'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs mt-5" style={{ color: 'var(--text-secondary)' }}>
                {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setFormError(null); setSuccess(null) }}
                  className="font-semibold underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {authMode === 'signin' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
