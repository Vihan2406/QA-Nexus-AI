import React, { useState } from 'react'
import {
  FileText, Upload, Sparkles, AlertCircle, CheckCircle, FileSpreadsheet,
  Download, RefreshCw, Send, Check, ShieldCheck, Terminal, Layers
} from 'lucide-react'
import type { Project } from '../types'

interface AITestPlanProps {
  projects: Project[]
}

interface GeneratedPlan {
  projectName: string
  scope: string
  methodology: string[]
  environments: string[]
  testCases: Array<{
    id: string
    module: string
    scenario: string
    priority: 'Critical' | 'High' | 'Medium' | 'Low'
    steps: string[]
    expected: string
  }>
  signOffCriteria: string[]
}

const GENERATION_STEPS = [
  'Parsing PRD document structure...',
  'Analyzing functional requirements and business rules...',
  'Mapping core user workflows and navigation paths...',
  'Identifying security boundaries and data validation rules...',
  'Drafting testing methodology and environment matrix...',
  'Constructing detailed test case scenarios (8 edge cases)...',
  'Formulating release sign-off gates and quality metrics...',
]

export default function AITestPlan({ projects }: AITestPlanProps) {
  // Input states
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [prdFile, setPrdFile] = useState<{ name: string; size: string } | null>(null)
  const [framework, setFramework] = useState('playwright')
  const [envType, setEnvType] = useState('web')
  const [dragActive, setDragActive] = useState(false)

  // Generation states
  const [generating, setGenerating] = useState(false)
  const [stepIndex, setStepIndex] = useState(-1)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)

  // Actions states
  const [saving, setSaving] = useState(false)
  const [savedStatus, setSavedStatus] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const sizeKB = (file.size / 1024).toFixed(1)
      setPrdFile({ name: file.name, size: `${sizeKB} KB` })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const sizeKB = (file.size / 1024).toFixed(1)
      setPrdFile({ name: file.name, size: `${sizeKB} KB` })
    }
  }

  const handleGenerate = async () => {
    if (!selectedProjectId) return
    setGenerating(true)
    setGeneratedPlan(null)
    setSavedStatus(false)
    
    // Simulate generation steps with incremental delays
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setStepIndex(i)
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }

    const project = projects.find(p => p.id === selectedProjectId)
    const pName = project ? project.name : 'Selected Project'
    const descText = description.toLowerCase()

    // Determine the type of test plan based on user descriptions
    let testCases = []
    let scope = ''
    let methodology = [
      'Functional Verification: Verify logic and user interactions against specifications.',
      'Regression Suite: Ensure no existing features are broken during updates.'
    ]
    let environments = ['Chrome (Stable, headless mode)', 'Safari (MacOS Desktop)', 'Firefox (Stable)']

    if (descText.includes('auth') || descText.includes('login') || pName.toLowerCase().includes('auth') || pName.toLowerCase().includes('login')) {
      // Auth specific test plan
      scope = 'This test plan covers the User Authentication Module including sign-in, registration, email confirmation, SSO (Google/GitHub), password reset, session persistence, and logout capabilities.'
      methodology.push('Security Testing: Verify credential encryption, password hashing, and brute-force prevention.')
      methodology.push('Edge-case Session Testing: Test session hijacking resistance and expiration limits.')
      testCases = [
        {
          id: 'TC-AUTH-001',
          module: 'Login Flow',
          scenario: 'Successful login with valid email and password credentials',
          priority: 'Critical' as const,
          steps: ['Navigate to login page', 'Enter valid registered email', 'Enter valid password', 'Click "Sign In" button'],
          expected: 'User is authenticated and redirected to the dashboard. Session cookie is successfully created.'
        },
        {
          id: 'TC-AUTH-002',
          module: 'Login Flow',
          scenario: 'Brute-force protection triggers on multiple invalid login attempts',
          priority: 'High' as const,
          steps: ['Enter invalid email/password 5 times consecutively', 'Attempt 6th valid login attempt'],
          expected: 'Account is temporarily locked or CAPTCHA is displayed. Informational warning alert is visible.'
        },
        {
          id: 'TC-AUTH-003',
          module: 'OAuth integration',
          scenario: 'SSO Login via Google Auth redirects and registers session',
          priority: 'Critical' as const,
          steps: ['Click "Google Login" button', 'Authenticate on Google prompt window', 'Authorize application permissions'],
          expected: 'Session returns successfully with Google oauth tokens. User lands on active dashboard.'
        },
        {
          id: 'TC-AUTH-004',
          module: 'OAuth integration',
          scenario: 'SSO Login via GitHub Auth handles existing user conflicts',
          priority: 'High' as const,
          steps: ['Click "GitHub Login" using email matching existing Google account', 'Confirm provider linking prompt'],
          expected: 'Account linking is handled gracefully. No duplicate profile record is created in the database.'
        },
        {
          id: 'TC-AUTH-005',
          module: 'Registration',
          scenario: 'Account registration with pre-existing email',
          priority: 'High' as const,
          steps: ['Navigate to Sign Up', 'Enter existing email address', 'Provide password', 'Click "Register"'],
          expected: 'Registration blocks and displays clear validation warning: "Email already exists".'
        },
        {
          id: 'TC-AUTH-006',
          module: 'Password Recovery',
          scenario: 'Password reset email contains valid secure one-time token',
          priority: 'Medium' as const,
          steps: ['Click "Forgot Password"', 'Enter valid email address', 'Submit and check recovery link in inbox'],
          expected: 'Email delivers immediately. Secure token is valid for 1 hour only and invalidates after first use.'
        },
        {
          id: 'TC-AUTH-007',
          module: 'Session Management',
          scenario: 'Auto-refresh token maintains session activity past token expiry',
          priority: 'Critical' as const,
          steps: ['Log in and idle for token duration (3600s)', 'Perform client-side action in dashboard'],
          expected: 'Token auto-refreshes in the background. No interruption or forced logout is experienced.'
        },
        {
          id: 'TC-AUTH-008',
          module: 'Logout',
          scenario: 'Logout completely invalidates access token and terminates session',
          priority: 'Critical' as const,
          steps: ['Click "Sign Out" button', 'Attempt to navigate back to dashboard URL'],
          expected: 'Session cookie and local storage tokens are cleared. Request redirects immediately to landing page.'
        }
      ]
    } else if (descText.includes('pay') || descText.includes('stripe') || descText.includes('billing') || pName.toLowerCase().includes('pay') || pName.toLowerCase().includes('stripe')) {
      // Payment specific test plan
      scope = 'This test plan covers the Payment Gateway integration including Stripe subscription setups, checkout checkout overlay, card declines, billing details, webhook validation, and subscription audit logs.'
      methodology.push('Compliance & API Integrity: Ensure request metadata matches standard PCI-DSS constraints.')
      methodology.push('Transaction Idempotency: Verify payment is processed exactly once even if network drops.')
      environments.push('Stripe Sandbox API version 2024-02-12')
      testCases = [
        {
          id: 'TC-PAY-001',
          module: 'Checkout Flow',
          scenario: 'Successful Stripe checkout for Premium Pro plan with test card',
          priority: 'Critical' as const,
          steps: ['Go to pricing', 'Select Pro Plan', 'Fill in standard Stripe test card (4242...)', 'Click "Pay Now"'],
          expected: 'Payment completes. Subscription state is updated in DB. Success toast message is displayed.'
        },
        {
          id: 'TC-PAY-002',
          module: 'Error Handling',
          scenario: 'Card declines due to insufficient funds (Stripe decline codes)',
          priority: 'High' as const,
          steps: ['Go to checkout', 'Enter Stripe test card for insufficient funds (4000 0021...)', 'Submit transaction'],
          expected: 'Stripe returns code `card_declined`. App catches exception and alerts user: "Card has insufficient funds".'
        },
        {
          id: 'TC-PAY-003',
          module: 'Webhooks',
          scenario: 'Supabase Edge Function processes `invoice.payment_succeeded` webhook',
          priority: 'Critical' as const,
          steps: ['Simulate successful invoice payment hook from Stripe Dashboard', 'Inspect database subscription end-date'],
          expected: 'Edge function verifies signature, matches user ID, and extends the active subscription period.'
        },
        {
          id: 'TC-PAY-004',
          module: 'Webhooks',
          scenario: 'Subscription updates to past_due on `invoice.payment_failed` webhook',
          priority: 'High' as const,
          steps: ['Simulate failed recurring charge webhook', 'Check user access permissions on dashboard'],
          expected: 'Database subscription changes status to past_due. Alert banner warns user to update payment card.'
        },
        {
          id: 'TC-PAY-005',
          module: 'Subscription CRUD',
          scenario: 'Cancel active subscription updates status to cancel_at_period_end',
          priority: 'Critical' as const,
          steps: ['Go to billing settings', 'Click "Cancel Subscription"', 'Confirm cancellation dialog'],
          expected: 'Stripe cancels renewal. App remains Premium until current billing date, then transitions to Free.'
        },
        {
          id: 'TC-PAY-006',
          module: 'Pricing UI',
          scenario: 'Toggling Annual billing displays correct discounted price points',
          priority: 'Medium' as const,
          steps: ['Navigate to pricing page', 'Toggle billing cycle switch from Monthly to Annual'],
          expected: 'Pricing calculations reflect 20% discount. Subscription checkout payloads adapt cycle parameter.'
        },
        {
          id: 'TC-PAY-007',
          module: 'Invoices',
          scenario: 'Download invoice PDF retrieves authentic Stripe billing receipt',
          priority: 'Low' as const,
          steps: ['Go to Billing history', 'Click download icon for recent transaction'],
          expected: 'Stripe hosted receipt is downloaded. Verify payment amount, invoice number, and currency.'
        },
        {
          id: 'TC-PAY-008',
          module: 'Security',
          scenario: 'Direct payload tampering is prevented on billing checkout API',
          priority: 'Critical' as const,
          steps: ['Intercept stripe payment initiation request', 'Alter amount value to $0.01', 'Submit request'],
          expected: 'Server validates price metadata against static Stripe products. Payload mismatch throws 400 bad request.'
        }
      ]
    } else {
      // General QA project management test plan
      scope = 'This test plan covers general QA Nexus platform modules including dashboard analytics, project creation, E2E Cypress script sandbox, report exports, settings updates, and team permissions.'
      methodology.push('Usability & UI Verification: Check grid systems, responsive layouts, and accessibility requirements.')
      methodology.push('Data Synchronization: Ensure updates made on database immediately propagate to visual charts.')
      testCases = [
        {
          id: 'TC-GEN-001',
          module: 'Project Creation',
          scenario: 'Creating project with complete details saves and updates dashboard stats',
          priority: 'Critical' as const,
          steps: ['Click "New Project"', 'Fill name, priority, points, and dates', 'Click "Create Project"'],
          expected: 'Project is added to grid. Total Story Points and Total Projects stats increment instantly.'
        },
        {
          id: 'TC-GEN-002',
          module: 'Project Editing',
          scenario: 'Editing details of existing project correctly updates record and charts',
          priority: 'High' as const,
          steps: ['Open project menu dropdown', 'Select edit details', 'Change status to In Progress', 'Save Changes'],
          expected: 'Changes are written to DB. Analytics pie chart recalculates status percentages.'
        },
        {
          id: 'TC-GEN-003',
          module: 'Project Deletion',
          scenario: 'Deleting a project removes all linked test suites and audit records',
          priority: 'High' as const,
          steps: ['Select project menu', 'Click edit details', 'Press "Delete Project" button', 'Confirm dialog'],
          expected: 'Project vanishes from dashboard. Cascade deletes successfully clear related test case tables.'
        },
        {
          id: 'TC-GEN-004',
          module: 'AI test case sandbox',
          scenario: 'Uploading spec file triggers AI and returns Cypress automated test code',
          priority: 'Critical' as const,
          steps: ['Open AI Test Generator tab', 'Upload a product spec PDF', 'Select Cypress framework', 'Click Generate'],
          expected: 'Spinner loads. Codeblock outputs structured step-by-step test script with syntax highlighting.'
        },
        {
          id: 'TC-GEN-005',
          module: 'Reports Export',
          scenario: 'Exporting burndown PDF compiles and downloads summary report',
          priority: 'Medium' as const,
          steps: ['Go to Reports tab', 'Select Sprint Burndown PDF', 'Click Export PDF button'],
          expected: 'PDF generation starts. Within 2s, browser initiates a PDF download matching file layout standards.'
        },
        {
          id: 'TC-GEN-006',
          module: 'Team Management',
          scenario: 'Inviting a colleague with admin role registers pending status',
          priority: 'Medium' as const,
          steps: ['Go to Team tab', 'Enter colleague email address', 'Select Admin role', 'Submit invitation'],
          expected: 'Invitation is sent. Colleague record displays in table marked as pending invite.'
        },
        {
          id: 'TC-GEN-007',
          module: 'Settings updates',
          scenario: 'Entering and saving Anthropic API key persists to local settings',
          priority: 'High' as const,
          steps: ['Go to settings', 'Input custom Anthropic key', 'Click Save settings button'],
          expected: 'Key is encrypted and saved. Success notification displays checkmark.'
        },
        {
          id: 'TC-GEN-008',
          module: 'Access Control',
          scenario: 'Viewer role is blocked from creating or modifying projects',
          priority: 'Critical' as const,
          steps: ['Login as viewer account', 'Inspect Dashboard header for action buttons'],
          expected: '"New Project" button is hidden. Direct API injection attempts return unauthorized status.'
        }
      ]
    }

    setGeneratedPlan({
      projectName: pName,
      scope,
      methodology,
      environments,
      testCases,
      signOffCriteria: [
        '100% of Critical and High priority test cases executed and passed.',
        'Zero blocking or critical severity bugs remaining in backlog.',
        'Automation coverage of at least 60% E2E test cases completed.',
        'UI verified and approved across all target mobile and web configurations.',
      ]
    })
    setGenerating(false)
    setStepIndex(-1)
  }

  const handleSavePlan = async () => {
    if (!generatedPlan) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSavedStatus(true)
    setTimeout(() => setSavedStatus(false), 3000)
  }

  const handleDownload = async (format: 'pdf' | 'csv') => {
    setDownloading(format)
    await new Promise(r => setTimeout(r, 1200))
    setDownloading(null)
    
    // Simulate browser download trigger
    const blob = new Blob([JSON.stringify(generatedPlan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test_plan_${generatedPlan?.projectName.toLowerCase().replace(/\s+/g, '_')}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      
      {/* ─── LEFT: PARAMETERS PANEL ─── */}
      <div className="xl:col-span-4 space-y-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
              <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Test Planner</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Generate industry-standard test plans</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Project Selector */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Target Project <span style={{ color: 'var(--accent-danger)' }}>*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Drag & Drop PRD upload */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Upload PRD / Spec Document
              </label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className="relative rounded-lg p-5 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                style={{
                  background: dragActive ? 'rgba(79, 70, 229, 0.03)' : 'var(--bg-surface)',
                  borderColor: dragActive ? 'var(--accent-primary)' : 'var(--border-strong)',
                }}
              >
                <input
                  type="file"
                  id="prd-file-upload"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                
                {prdFile ? (
                  <div className="space-y-1 animate-fade-in">
                    <FileText size={24} className="mx-auto" style={{ color: 'var(--accent-primary)' }} />
                    <p className="text-xs font-semibold truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>
                      {prdFile.name}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{prdFile.size}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrdFile(null) }}
                      className="text-[10px] font-bold underline hover:text-red-500"
                      style={{ color: 'var(--accent-danger)' }}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload size={20} className="mx-auto" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Drag spec file here or <span style={{ color: 'var(--accent-primary)' }}>browse</span>
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PDF, Word, TXT, MD up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Feature Description / Scope Details
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field resize-none"
                rows={4}
                placeholder="Paste key features, flows, or description of what needs to be tested..."
              />
            </div>

            {/* Testing Framework */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Automation target</label>
                <select value={framework} onChange={e => setFramework(e.target.value)} className="input-field">
                  <option value="playwright">Playwright</option>
                  <option value="cypress">Cypress</option>
                  <option value="selenium">Selenium Web</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Env Type</label>
                <select value={envType} onChange={e => setEnvType(e.target.value)} className="input-field">
                  <option value="web">Web Application</option>
                  <option value="mobile">Mobile App</option>
                  <option value="api">Backend REST API</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedProjectId}
              className="btn-primary w-full py-2.5 mt-3 flex items-center justify-center gap-2 text-xs font-semibold shadow-md"
            >
              {generating ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              <span>{generating ? 'Generating Test Plan...' : 'Generate Full Test Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: GENERATED PLAN OUTPUT ─── */}
      <div className="xl:col-span-8">
        
        {/* Loading State */}
        {generating && (
          <div className="card p-12 flex flex-col items-center justify-center min-h-[450px] space-y-5 text-center">
            <div className="spinner w-8 h-8" style={{ borderWidth: 3 }} />
            <div className="space-y-1.5 animate-pulse">
              <h4 className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>QA Nexus AI Analyst working</h4>
              <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>{GENERATION_STEPS[stepIndex]}</p>
            </div>
            
            {/* Step checklist */}
            <div className="w-full max-w-md pt-4 space-y-2 text-left" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {GENERATION_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {idx < stepIndex ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : idx === stepIndex ? (
                    <RefreshCw size={12} className="text-indigo-600 animate-spin" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-300" />
                  )}
                  <span style={{ color: idx <= stepIndex ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generating && !generatedPlan && (
          <div className="card p-12 flex flex-col items-center justify-center text-center min-h-[450px]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <FileSpreadsheet size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="font-heading font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>No Test Plan Generated</h3>
            <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Select a project from the left panel, upload your Product Requirements Document (PRD) or spec details, and trigger the AI model to generate a comprehensive, industry-standard QA test plan.
            </p>
          </div>
        )}

        {/* Generated Test Plan Result */}
        {!generating && generatedPlan && (
          <div className="card divide-y animate-fade-in" style={{ borderColor: 'var(--border-subtle)' }}>
            
            {/* Header / Meta */}
            <div className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="badge text-[10px]" style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669' }}>
                  <ShieldCheck size={12} />
                  <span>Verified Test Plan</span>
                </span>
                <h3 className="font-heading font-bold text-base mt-1" style={{ color: 'var(--text-primary)' }}>
                  QA Test Plan: {generatedPlan.projectName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={!!downloading}
                  className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                >
                  {downloading === 'pdf' ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                  <span>{downloading === 'pdf' ? 'Exporting...' : 'PDF'}</span>
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  disabled={!!downloading}
                  className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                >
                  {downloading === 'csv' ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                  <span>{downloading === 'csv' ? 'Exporting...' : 'CSV'}</span>
                </button>
                <button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="btn-primary py-1.5 px-3 flex items-center gap-1.5 text-xs font-semibold"
                >
                  {saving ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : savedStatus ? (
                    <Check size={12} />
                  ) : null}
                  <span>{saving ? 'Saving...' : savedStatus ? 'Saved to project!' : 'Save Plan'}</span>
                </button>
              </div>
            </div>

            {/* Scope / Objective */}
            <div className="p-5 space-y-2">
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>1. Project Scope & Test Objective</h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {generatedPlan.scope}
              </p>
            </div>

            {/* Testing Methodology */}
            <div className="p-5 space-y-2.5">
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>2. Testing Methodology & Strategy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedPlan.methodology.map((m, idx) => (
                  <div key={idx} className="flex gap-2 text-xs items-start p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <span className="text-indigo-600 font-bold">0{idx + 1}.</span>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Configurations */}
            <div className="p-5 space-y-2">
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>3. Target Configurations & Environments</h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {generatedPlan.environments.map((env, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    💻 {env}
                  </span>
                ))}
              </div>
            </div>

            {/* Test Case Matrix */}
            <div className="p-0 overflow-hidden">
              <div className="p-5 pb-3">
                <h4 className="font-heading font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>4. Generated Test Case Matrix (8 Scenarios)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th className="py-2.5 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>ID</th>
                      <th className="py-2.5 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Module</th>
                      <th className="py-2.5 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Scenario</th>
                      <th className="py-2.5 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Priority</th>
                      <th className="py-2.5 px-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Expected Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {generatedPlan.testCases.map((tc, idx) => (
                      <tr key={tc.id} className="hover:bg-white/40 transition-colors">
                        <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{tc.id}</td>
                        <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{tc.module}</td>
                        <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {tc.scenario}
                          {/* Sub Steps */}
                          <div className="pl-3 mt-1.5 space-y-0.5 list-decimal font-normal" style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                            {tc.steps.map((step, sidx) => (
                              <div key={sidx}>{sidx + 1}. {step}</div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge text-[10px] priority-${tc.priority.toLowerCase()}`}>
                            {tc.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tc.expected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quality Gates / Sign-Off */}
            <div className="p-5 space-y-3">
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>5. Release Sign-Off Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {generatedPlan.signOffCriteria.map((gate, idx) => (
                  <div key={idx} className="flex gap-2 text-xs items-start">
                    <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{gate}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
