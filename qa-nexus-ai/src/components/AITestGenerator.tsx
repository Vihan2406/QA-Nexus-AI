import React, { useState, useEffect, useRef } from 'react'
import {
  Wand2, Copy, Check, ChevronDown, ChevronUp, Upload,
  FlaskConical, Code2, ListChecks, Loader2, Sparkles, AlertCircle, X, Terminal, Bug
} from 'lucide-react'
import type { Project, GeneratedTestCase, ScriptFramework, Priority } from '../types'

interface AITestGeneratorProps {
  projects: Project[]
}

const MOCK_TEST_CASES: GeneratedTestCase[] = [
  {
    title: 'TC-001: Successful User Login with Valid Credentials',
    priority: 'Critical',
    steps: [
      'Navigate to the application login page at /login',
      'Enter a valid registered email address in the Email input field',
      'Enter the correct password (minimum 8 chars) in the Password field',
      'Click the "Sign In" button',
      'Verify the user is redirected to the /dashboard route',
    ],
    expectedResult: 'User is successfully authenticated and lands on the dashboard. Auth token is stored in localStorage. User profile data is loaded.',
    framework: 'playwright',
    automationCode: `import { test, expect } from '@playwright/test';

test.describe('User Login - Valid Credentials', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('email-input')
      .fill('test@example.com');
    
    await page.getByTestId('password-input')
      .fill('SecurePass123!');
    
    await page.getByTestId('signin-btn').click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('user-profile'))
      .toBeVisible();
    
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).not.toBeNull();
  });
});`,
  },
  {
    title: 'TC-002: Login Failure with Invalid Password',
    priority: 'High',
    steps: [
      'Navigate to the login page',
      'Enter a valid registered email address',
      'Enter an incorrect password',
      'Click the "Sign In" button',
      'Verify that an error message is displayed',
      'Confirm the user remains on the login page',
    ],
    expectedResult: 'Error toast/alert appears with message "Invalid email or password". No auth token is stored. User stays on the login page.',
    framework: 'playwright',
    automationCode: `import { test, expect } from '@playwright/test';

test.describe('User Login - Invalid Credentials', () => {
  test('should show error for wrong password', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('email-input')
      .fill('test@example.com');
    
    await page.getByTestId('password-input')
      .fill('WrongPassword999');
    
    await page.getByTestId('signin-btn').click();

    await expect(page.getByTestId('error-toast'))
      .toBeVisible();

    await expect(page.getByTestId('error-toast'))
      .toContainText('Invalid email or password');

    await expect(page).toHaveURL('/login');
  });
});`,
  },
  {
    title: 'TC-003: Password Field Masking Validation',
    priority: 'Medium',
    steps: [
      'Open the login page',
      'Locate the password input field',
      'Verify the field has type="password" by default',
      'Click the eye icon toggle button',
      'Verify the password characters are now visible',
      'Click the eye icon again to re-mask',
    ],
    expectedResult: 'Password field toggles correctly between masked (type=password) and visible (type=text) modes on each eye icon click.',
    framework: 'playwright',
    automationCode: `import { test, expect } from '@playwright/test';

test.describe('Password Field Masking', () => {
  test('should toggle password visibility on eye icon click', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByTestId('password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.getByTestId('toggle-password-btn').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.getByTestId('toggle-password-btn').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});`,
  },
  {
    title: 'TC-004: Password Reset Request Flow',
    priority: 'Medium',
    steps: [
      'Click the "Forgot Password?" link on login page',
      'Enter a registered email address in the Email input field',
      'Click the "Send Reset Link" button',
      'Verify a success toast message "Reset link sent" is displayed',
      'Verify the reset token is successfully created in the DB',
    ],
    expectedResult: 'Password reset email is successfully dispatched. User sees confirmation toast and remains on the login flow.',
    framework: 'playwright',
    automationCode: `import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow', () => {
  test('should request password reset link successfully', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('forgot-password-link').click();

    await page.getByTestId('reset-email-input')
      .fill('user@example.com');
    await page.getByTestId('send-reset-btn').click();

    const toast = page.getByTestId('success-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Reset link sent');
  });
});`,
  },
  {
    title: 'TC-005: Account Lockout on Multiple Invalid Attempts',
    priority: 'High',
    steps: [
      'Navigate to the login page',
      'Enter valid email and an incorrect password 5 times in a row',
      'Verify that the account gets locked on the 5th attempt',
      'Verify the error toast displays "Account locked. Try again in 15 minutes."',
      'Try to log in with the correct password and verify it fails',
    ],
    expectedResult: 'User account is locked out temporarily. Subsequent login attempts with valid password are rejected until lockout expires.',
    framework: 'playwright',
    automationCode: `import { test, expect } from '@playwright/test';

test.describe('Account Lockout Flow', () => {
  test('should lock account after 5 failed login attempts', async ({ page }) => {
    await page.goto('/login');

    for (let i = 0; i < 5; i++) {
      await page.getByTestId('email-input').fill('user@example.com');
      await page.getByTestId('password-input').fill('WrongPassword' + i);
      await page.getByTestId('signin-btn').click();
      
      if (i < 4) {
        await expect(page.getByTestId('error-toast')).toContainText('Invalid credentials');
      }
    }

    const lockoutToast = page.getByTestId('error-toast');
    await expect(lockoutToast).toBeVisible();
    await expect(lockoutToast).toContainText('Account locked. Try again in 15 minutes.');
  });
});`,
  },
]

const PRIORITY_STYLES: Record<Priority, string> = {
  Critical: 'priority-critical',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
}

function CodeBlock({ code, framework }: { code: string; framework: ScriptFramework }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300">
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-zinc-500" style={{ fontSize: '0.75rem' }}>
            {framework === 'cypress' ? 'spec.cy.ts' : 'test.spec.ts'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-sans"
            style={{ background: 'rgba(79, 70, 229, 0.3)', color: '#a5b4fc' }}
          >
            {framework === 'cypress' ? 'Cypress' : 'Playwright'}
          </span>
          <button
            onClick={copy}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors cursor-pointer font-sans bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

interface TestCaseRowProps {
  tc: GeneratedTestCase
  index: number
  status: 'idle' | 'running' | 'passed' | 'failed'
  onRunPlaywright: () => void
}

function TestCaseRow({ tc, index, status, onRunPlaywright }: TestCaseRowProps) {
  const [showSteps, setShowSteps] = useState(index === 0)
  const [showCode, setShowCode] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden p-4 space-y-3 transition-all hover:shadow-md"
      style={{
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)'
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Test Case details (Scenario) */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            >
              {index + 1}
            </span>
            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {tc.title}
            </p>
            <span className={`badge ${PRIORITY_STYLES[tc.priority]} text-[10px] py-0.5 px-2`}>
              {tc.priority}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              style={{ color: 'var(--accent-primary)' }}
            >
              {showSteps ? 'Hide Steps' : `Show Steps (${tc.steps.length})`}
            </button>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>|</span>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs font-medium hover:underline cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>
        </div>

        {/* Expected Result (In front of each line/row of testcase) */}
        <div className="flex-1 lg:max-w-[40%] bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-lg border border-emerald-100/80">
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-emerald-700">
            ✓ Expected Result
          </span>
          <p className="text-xs leading-relaxed" style={{ color: '#15803d' }}>
            {tc.expectedResult}
          </p>
        </div>

        {/* Playwright Button & Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {status === 'running' && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <Loader2 size={14} className="animate-spin" />
              <span>Running...</span>
            </div>
          )}
          
          {status === 'passed' && (
            <span className="badge priority-low flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 bg-emerald-100 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Passed
            </span>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="badge priority-critical flex items-center gap-1 px-2.5 py-1 text-xs text-red-700 bg-red-100 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Failed
              </span>
              <span className="text-[9px] font-semibold text-red-500 flex items-center gap-0.5">
                <Bug size={9} />
                Logged to Bug Reporter
              </span>
            </div>
          )}

          <button
            onClick={onRunPlaywright}
            disabled={status === 'running'}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--border-strong)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Run Playwright
          </button>
        </div>
      </div>

      {/* Steps checklist details */}
      {showSteps && (
        <div className="pt-3 pl-2 space-y-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Test Steps:</p>
          {tc.steps.map((step, sIdx) => (
            <div key={sIdx} className="flex items-start gap-2.5 text-xs">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent-primary)' }}
              >
                {sIdx + 1}
              </span>
              <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Code details */}
      {showCode && (
        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <CodeBlock code={tc.automationCode} framework={tc.framework} />
        </div>
      )}
    </div>
  )
}

export default function AITestGenerator({ projects }: AITestGeneratorProps) {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [featureDescription, setFeatureDescription] = useState('')
  const [framework, setFramework] = useState<ScriptFramework>('playwright')
  const [tcCount, setTcCount] = useState('3')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<GeneratedTestCase[] | null>(null)
  const [activeTab, setActiveTab] = useState<'manual' | 'prd'>('manual')

  // Playwright run simulation states
  const [runStatuses, setRunStatuses] = useState<Record<number, 'idle' | 'running' | 'passed' | 'failed'>>({})
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number | null>(null)
  const [activeTerminalTestCase, setActiveTerminalTestCase] = useState<string>('')

  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [terminalLogs])

  const handleGenerate = async () => {
    if (!featureDescription.trim()) return
    setLoading(true)
    setGenerated(null)
    setRunStatuses({})
    setIsTerminalOpen(false)
    setCurrentRunningIndex(null)

    // Simulate AI generation delay
    await new Promise(r => setTimeout(r, 2200))

    const count = Math.min(Math.max(parseInt(tcCount) || 3, 1), 5)
    
    // Customize framework based on selection
    const customizedCases = MOCK_TEST_CASES.slice(0, count).map(tc => ({
      ...tc,
      framework
    }))

    setGenerated(customizedCases)
    setLoading(false)
  }

  const logBugReport = (tc: GeneratedTestCase, failedStep: string) => {
    const selectedProjObj = projects.find(p => p.id === selectedProject)
    const projId = selectedProjObj?.id || 'unassigned'
    const projName = selectedProjObj?.name || 'General / Unassigned'
    
    const bugId = `BUG-${Math.floor(100 + Math.random() * 900)}`
    const newBug = {
      id: bugId,
      projectId: projId,
      projectName: projName,
      testCaseTitle: tc.title,
      steps: tc.steps,
      expectedResult: tc.expectedResult,
      failedStep: failedStep,
      errorTrace: `Error: expect(locator).toBeVisible()\n\nLocator: locator('[data-testid="error-toast"]')\nExpected: visible\nReceived: hidden\n\n   at tests/login.spec.ts:18:32\n   16 | \n   17 |     await page.getByTestId('signin-btn').click();\n > 18 |     await expect(page.getByTestId('error-toast')).toBeVisible();\n      |                                                   ^`,
      priority: tc.priority,
      loggedAt: new Date().toISOString()
    }

    try {
      const existingBugs = JSON.parse(localStorage.getItem('qa-nexus-bugs') || '[]')
      // Avoid duplicate logs of the exact same testcase inside the same project
      const exists = existingBugs.some((b: any) => b.projectId === projId && b.testCaseTitle === tc.title)
      if (!exists) {
        existingBugs.push(newBug)
        localStorage.setItem('qa-nexus-bugs', JSON.stringify(existingBugs))
        // Dispatch event for same-tab updates
        window.dispatchEvent(new Event('qa-nexus-bugs-updated'))
      }

      // Add failure notification to inbox
      const existingNotifs = JSON.parse(localStorage.getItem('qa-nexus-notifications') || '[]')
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: 'Playwright Test Failure Logged',
        message: `Test case "${tc.title.split(':')[0] || 'Playwright Test'}" failed at step: "${failedStep}". Bug report logged under project "${projName}".`,
        type: 'error',
        read: false,
        timestamp: new Date().toISOString()
      }
      existingNotifs.unshift(newNotif)
      localStorage.setItem('qa-nexus-notifications', JSON.stringify(existingNotifs))
      window.dispatchEvent(new Event('qa-nexus-notifications-updated'))
    } catch (e) {
      console.error('Error logging bug or notification:', e)
    }
  }

  const runPlaywrightTest = (index: number) => {
    if (!generated) return
    const tc = generated[index]
    setCurrentRunningIndex(index)
    setActiveTerminalTestCase(tc.title.split(':')[0] || 'Playwright Test')
    setIsTerminalOpen(true)
    setRunStatuses(prev => ({ ...prev, [index]: 'running' }))
    setTerminalLogs([])

    // TC-002: Login Failure with Invalid Password fails, others pass
    const willFail = tc.title.includes('TC-002') || tc.title.toLowerCase().includes('failure') || tc.title.toLowerCase().includes('invalid')

    const filePrefix = tc.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const logsList: string[] = [
      `$ npx playwright test tests/${filePrefix}.spec.ts --project=chromium`,
      `\nRunning 1 test using 1 worker\n`,
      `[chromium] › tests/${filePrefix}.spec.ts:12:3 › ${tc.title}`,
    ]

    let currentLogIndex = 0
    setTerminalLogs([logsList[0]])

    const intervalTime = 400
    const timer = setInterval(() => {
      currentLogIndex++
      if (currentLogIndex === 1) {
        setTerminalLogs(prev => [...prev, logsList[1]])
      } else if (currentLogIndex === 2) {
        setTerminalLogs(prev => [...prev, logsList[2]])
      } else if (currentLogIndex - 3 < tc.steps.length) {
        const stepIdx = currentLogIndex - 3
        const step = tc.steps[stepIdx]
        
        const isLastStep = stepIdx === tc.steps.length - 1
        const isSecondLastStep = stepIdx === tc.steps.length - 2
        
        if (willFail && (isSecondLastStep || (tc.steps.length <= 2 && isLastStep))) {
          // Fail step
          setTerminalLogs(prev => [
            ...prev,
            `  ❌  Step ${stepIdx + 1}: ${step} (failed)`
          ])
          // Error details
          setTerminalLogs(prev => [
            ...prev,
            `\nError: expect(received).toBeVisible()\n\nExpected: visible\nReceived: hidden\n\n   at tests/login.spec.ts:18:32\n   16 |     await page.getByTestId('signin-btn').click();\n > 18 |     await expect(page.getByTestId('error-toast')).toBeVisible();\n      |                                                   ^`,
            `\n1 failed (2.1s)`
          ])
          
          setRunStatuses(prev => ({ ...prev, [index]: 'failed' }))
          clearInterval(timer)
          
          // Log to bug reporter
          logBugReport(tc, step)
        } else {
          // Pass step
          setTerminalLogs(prev => [
            ...prev,
            `  ✓  Step ${stepIdx + 1}: ${step} (${Math.floor(50 + Math.random() * 120)}ms)`
          ])
        }
      } else {
        // Successful completion
        setTerminalLogs(prev => [
          ...prev,
          `\n  ✓  Expected Result verified successfully: "${tc.expectedResult.slice(0, 60)}..."`,
          `\n1 passed (1.8s)`
        ])
        setRunStatuses(prev => ({ ...prev, [index]: 'passed' }))
        clearInterval(timer)
      }
    }, intervalTime)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setFeatureDescription(text.slice(0, 2000))
    }
    reader.readAsText(file)
  }

  return (
    <div className="relative pb-24">
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 items-start">
        {/* Input Panel */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Test Generator</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Claude AI</p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Project selector */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Target Project</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="input-field">
                <option value="">Select a project (optional)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Config row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Framework</label>
                <select value={framework} onChange={e => setFramework(e.target.value as ScriptFramework)} className="input-field">
                  <option value="playwright">Playwright</option>
                  <option value="cypress">Cypress</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Test Cases (1–5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={tcCount}
                  onChange={e => setTcCount(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Input mode tabs */}
          <div className="flex gap-1 p-1 rounded-lg mb-4 w-fit" style={{ background: 'var(--bg-elevated)' }}>
            <button className={`tab ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
              Manual Input
            </button>
            <button className={`tab ${activeTab === 'prd' ? 'active' : ''}`} onClick={() => setActiveTab('prd')}>
              Upload PRD
            </button>
          </div>

          {activeTab === 'manual' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Feature Description
              </label>
              <textarea
                value={featureDescription}
                onChange={e => setFeatureDescription(e.target.value)}
                className="input-field resize-none text-sm"
                rows={4}
                placeholder="Describe the feature to test. Example:
User authentication flow with email/password login. Users should be able to sign in, receive validation errors for wrong credentials, toggle password visibility, and be redirected to dashboard on success..."
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Upload PRD / Spec File</label>
              <label
                className="flex flex-col items-center justify-center rounded-xl p-6 cursor-pointer transition-colors"
                style={{ border: '2px dashed var(--border-strong)', background: 'var(--bg-elevated)' }}
              >
                <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Drop a .txt, .md, or .pdf file
                </span>
                <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Max 2MB</span>
                <input type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleFileUpload} />
              </label>
              {featureDescription && (
                <p className="text-xs mt-2" style={{ color: 'var(--accent-success)' }}>
                  ✓ File loaded ({featureDescription.length} characters)
                </p>
              )}
            </div>
          )}

          {/* Info notice */}
          <div
            className="flex items-start gap-2 p-3 rounded-lg mb-4 text-xs"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>Running in preview mode. Live execution uses simulated Playwright processes reporting output details in real time.</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!featureDescription.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating test cases...</span>
              </>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Generate Test Cases with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          {!generated && !loading && (
            <div
              className="card p-10 flex flex-col items-center justify-center text-center"
              style={{ minHeight: 250 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.1))' }}
              >
                <FlaskConical size={24} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Ready to generate tests
              </h3>
              <p className="text-xs max-w-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Describe your feature above and click "Generate" to see AI-powered test cases. Click "Run Playwright" to run verification.
              </p>
            </div>
          )}

          {loading && (
            <div className="card p-6 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl p-4" style={{ border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="shimmer w-6 h-6 rounded-lg" />
                    <div className="shimmer h-4 rounded flex-1" />
                    <div className="shimmer w-16 h-5 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="shimmer h-3 rounded w-full" />
                    <div className="shimmer h-3 rounded w-4/5" />
                  </div>
                </div>
              ))}
              <p className="text-center text-xs pt-2 animate-pulse" style={{ color: 'var(--text-muted)' }}>
                Analyzing feature and generating test cases...
              </p>
            </div>
          )}

          {generated && (
            <div className="space-y-3 animate-fade-up">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Generated {generated.length} Test Case{generated.length !== 1 ? 's' : ''}
                </p>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                >
                  ✓ Ready for execution
                </span>
              </div>
              
              <div className="space-y-3">
                {generated.map((tc, i) => (
                  <TestCaseRow
                    key={i}
                    tc={tc}
                    index={i}
                    status={runStatuses[i] || 'idle'}
                    onRunPlaywright={() => runPlaywrightTest(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playwright Terminal Drawer Overlay */}
      {isTerminalOpen && (
        <div
          className="fixed bottom-0 right-0 left-0 lg:left-60 z-40 bg-zinc-950 text-zinc-100 p-4 border-t border-zinc-800 shadow-2xl font-mono text-xs flex flex-col h-72 animate-fade-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400" />
              <span className="font-bold text-zinc-300">Playwright Terminal Console ({activeTerminalTestCase})</span>
              {currentRunningIndex !== null && runStatuses[currentRunningIndex] === 'running' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="p-1 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {terminalLogs.map((log, lIdx) => {
              let color = 'text-zinc-300'
              if (log.startsWith('$')) color = 'text-zinc-500 font-bold'
              else if (log.includes('✓')) color = 'text-emerald-400'
              else if (log.includes('❌') || log.includes('1 failed') || log.includes('Error:')) color = 'text-red-400'
              else if (log.includes('1 passed')) color = 'text-emerald-400 font-semibold'

              return (
                <div key={lIdx} className={`${color} whitespace-pre-wrap`}>
                  {log}
                </div>
              )
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}
    </div>
  )
}
