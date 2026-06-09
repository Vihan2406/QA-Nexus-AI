import React, { useState } from 'react'
import { Key, Bell, Palette, Globe, Shield, Save, CheckCircle } from 'lucide-react'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [notifications, setNotifications] = useState({
    projectUpdates: true,
    testGenerated: true,
    teamInvites: true,
    weeklyDigest: false,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* AI Integration */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
            <Key size={15} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Integration</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Connect your Anthropic API key for live test generation</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Anthropic API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="input-field"
              placeholder="sk-ant-..."
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Your key is stored locally and never sent to our servers. Get yours at{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="underline" style={{ color: 'var(--accent-primary)' }}>
                console.anthropic.com
              </a>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Default AI Model</label>
            <select className="input-field">
              <option>claude-sonnet-4-20250514 (Recommended)</option>
              <option>claude-haiku-4-5-20251001 (Faster)</option>
              <option>claude-opus-4-6 (Most Capable)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
            <Bell size={15} style={{ color: '#059669' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Choose what you get notified about</p>
          </div>
        </div>
        <div className="space-y-3">
          {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, val]) => {
            const labels: Record<string, string> = {
              projectUpdates: 'Project status updates',
              testGenerated: 'Test cases generated',
              teamInvites: 'Team invitations',
              weeklyDigest: 'Weekly summary digest',
            }
            return (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{labels[key]}</span>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0"
                  style={{
                    background: val ? 'var(--accent-primary)' : 'var(--border-strong)',
                    width: 40,
                    height: 22,
                  }}
                >
                  <span
                    className="absolute top-0.5 rounded-full bg-white transition-transform"
                    style={{
                      width: 18,
                      height: 18,
                      left: 2,
                      transform: val ? 'translateX(18px)' : 'translateX(0)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Integrations */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(217, 119, 6, 0.1)' }}>
            <Globe size={15} style={{ color: '#d97706' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Integrations</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Connect external tools and webhooks</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="input-field"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Jira', 'GitHub', 'Slack'].map(name => (
              <button
                key={name}
                className="py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                Connect {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-5" style={{ border: '1px solid #fecaca' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fef2f2' }}>
            <Shield size={15} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#dc2626' }}>Danger Zone</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Irreversible actions — proceed with care</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="text-sm px-4 py-2 rounded-lg font-medium" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            Export All Data
          </button>
          <button className="text-sm px-4 py-2 rounded-lg font-medium" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            Delete Account
          </button>
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2.5">
        {saved ? <CheckCircle size={15} /> : <Save size={15} />}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
