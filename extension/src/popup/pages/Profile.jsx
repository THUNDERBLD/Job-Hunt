import { useState, useEffect } from 'react'
import {
  getMe, updateUserProfile, logout as apiLogout,
  updateCohereKey, removeCohereKey, updateGeminiKey, removeGeminiKey
} from '../../utils/api.js'
import { Loader, Toast, PageHeader, Input } from '../components/UI.jsx'
import { C, F, S } from '../../styles.js'

export default function Profile({ user: initialUser, onLogout }) {
  const [user,    setUser]    = useState(initialUser)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)
  const [dirty,   setDirty]   = useState(false)

  // Editable profile fields
  const [bio,        setBio]        = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [resumeLink, setResumeLink] = useState('')
  const [projects,   setProjects]   = useState([])

  // API Key inputs
  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [cohereKeyInput, setCohereKeyInput] = useState('')
  const [savingGemini,   setSavingGemini]   = useState(false)
  const [savingCohere,   setSavingCohere]   = useState(false)

  useEffect(() => {
    getMe()
      .then(r => {
        setUser(r.data)
        const p = r.data.profile || {}
        setBio(p.bio || '')
        setSkillsText((p.skills || []).join(', '))
        setResumeText(p.resumeText || '')
        setResumeLink(p.resumeLink || '')
        setProjects(p.projects || [])
        setProfile(p)
      })
      .catch(() => setToast({ message: 'Failed to load profile', type: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const markDirty = (setter) => (val) => { setter(val); setDirty(true) }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean)
      const data = { bio, skills, resumeText, resumeLink, projects }
      const r = await updateUserProfile(data)
      setUser(r.data)
      setProfile(r.data.profile)
      setDirty(false)
      setToast({ message: '✓ Profile saved!', type: 'success' })
    } catch (e) {
      setToast({ message: e.message || 'Save failed', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await apiLogout()
    onLogout()
  }

  // ── Project helpers ────────────────────────────────────────
  const addProject = () => {
    setProjects(p => [...p, { name: '', description: '', techStack: [], link: '' }])
    setDirty(true)
  }
  const updateProject = (idx, field, value) => {
    setProjects(p => p.map((proj, i) => i === idx ? { ...proj, [field]: value } : proj))
    setDirty(true)
  }
  const removeProject = (idx) => {
    setProjects(p => p.filter((_, i) => i !== idx))
    setDirty(true)
  }

  // ── Key actions ───────────────────────────────────────────
  const handleSaveGemini = async () => {
    if (!geminiKeyInput.trim()) return
    setSavingGemini(true)
    try {
      const r = await updateGeminiKey(geminiKeyInput.trim())
      setUser(r.data)
      setGeminiKeyInput('')
      setToast({ message: '✓ Gemini API key saved! Unlimited enabled.', type: 'success' })
    } catch (e) {
      setToast({ message: e.message || 'Failed to save Gemini key', type: 'error' })
    } finally {
      setSavingGemini(false)
    }
  }

  const handleRemoveGemini = async () => {
    setSavingGemini(true)
    try {
      const r = await removeGeminiKey()
      setUser(r.data)
      setToast({ message: '✓ Gemini API key removed', type: 'success' })
    } catch (e) {
      setToast({ message: e.message || 'Failed to remove Gemini key', type: 'error' })
    } finally {
      setSavingGemini(false)
    }
  }

  const handleSaveCohere = async () => {
    if (!cohereKeyInput.trim()) return
    setSavingCohere(true)
    try {
      const r = await updateCohereKey(cohereKeyInput.trim())
      setUser(r.data)
      setCohereKeyInput('')
      setToast({ message: '✓ Cohere API key saved! Unlimited enabled.', type: 'success' })
    } catch (e) {
      setToast({ message: e.message || 'Failed to save Cohere key', type: 'error' })
    } finally {
      setSavingCohere(false)
    }
  }

  const handleRemoveCohere = async () => {
    setSavingCohere(true)
    try {
      const r = await removeCohereKey()
      setUser(r.data)
      setToast({ message: '✓ Cohere API key removed', type: 'success' })
    } catch (e) {
      setToast({ message: e.message || 'Failed to remove Cohere key', type: 'error' })
    } finally {
      setSavingCohere(false)
    }
  }

  if (loading) return <Loader text="Loading profile..." />

  // If they have set either key, they have unlimited usage
  const isUnlimited = user?.plan === 'pro' || user?.hasCohereKey || user?.hasGeminiKey
  const usagePercent = user?.aiGenerationsLimit
    ? Math.round((user.aiGenerationsUsed || 0) / user.aiGenerationsLimit * 100)
    : 0

  return (
    <div className="fadeUp" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: 0, position: 'relative', overflow: 'hidden' }}>
      <PageHeader tag="Settings" title="Your Profile"
        right={
          <button onClick={handleLogout} style={{
            ...S.btn.danger, display: 'flex', alignItems: 'center', gap: 5, fontSize: 9,
          }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,84,84,0.18)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,84,84,0.08)' }}
          >Logout</button>
        }
      />

      <div className="scroll" style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', minHeight: 0 }}>

        {/* User info card */}
        <div style={{ ...S.card, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.text }}>{user?.name}</p>
            <p style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 2 }}>{user?.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontFamily: F.mono, fontSize: 9,
              color: isUnlimited ? C.accent : C.yellow,
              background: isUnlimited ? `${C.accent}15` : `${C.yellow}15`,
              border: `1px solid ${isUnlimited ? C.accent : C.yellow}35`,
              borderRadius: 4, padding: '3px 8px',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>{isUnlimited ? 'unlimited' : 'free tier'}</span>
          </div>
        </div>

        {/* Usage bar / Unlimited badge */}
        <div style={{ ...S.card, padding: '10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ ...S.label }}>AI Generations</span>
            <span style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim }}>
              {isUnlimited
                ? `${user?.aiGenerationsUsed || 0} used (Unlimited)`
                : `${user?.aiGenerationsUsed || 0} / ${user?.aiGenerationsLimit || 50}`}
            </span>
          </div>
          {!isUnlimited && (
            <div style={{ height: 4, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, usagePercent)}%`, height: '100%',
                background: usagePercent > 80 ? C.red : C.accent,
                borderRadius: 99, transition: 'width 0.4s ease',
              }} />
            </div>
          )}
          {isUnlimited && (
            <p style={{ fontFamily: F.mono, fontSize: 9, color: C.accent, marginTop: 2 }}>
              ✓ Using personal API key. Server limits disabled.
            </p>
          )}
        </div>

        {/* Section: API Keys */}
        <SectionTitle label="API Keys" sub="Use your own keys for unlimited usage" />
        <div style={{ ...S.card, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Gemini */}
          <div>
            <label style={{ ...S.label, marginBottom: 5, display: 'block' }}>Gemini API Key (Primary)</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="password"
                disabled={user?.hasGeminiKey || savingGemini}
                value={user?.hasGeminiKey ? '••••••••••••••••••••••••••••••' : geminiKeyInput}
                onChange={e => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                style={{ ...S.input, flex: 1, width: 'auto', minWidth: 0, height: 32, fontSize: 10, padding: '6px 10px' }}
              />
              {user?.hasGeminiKey ? (
                <button
                  disabled={savingGemini}
                  onClick={handleRemoveGemini}
                  style={{ ...S.btn.danger, width: 'auto', flexShrink: 0, padding: '0 14px', height: 32, fontSize: 9 }}
                >Remove</button>
              ) : (
                <button
                  disabled={savingGemini || !geminiKeyInput.trim()}
                  onClick={handleSaveGemini}
                  style={{ ...S.btn.primary, width: 'auto', flexShrink: 0, padding: '0 14px', height: 32, fontSize: 9, opacity: geminiKeyInput.trim() ? 1 : 0.4 }}
                >Save</button>
              )}
            </div>
          </div>

          {/* Cohere */}
          <div>
            <label style={{ ...S.label, marginBottom: 5, display: 'block' }}>Cohere API Key (Fallback)</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="password"
                disabled={user?.hasCohereKey || savingCohere}
                value={user?.hasCohereKey ? '••••••••••••••••••••••••••••••' : cohereKeyInput}
                onChange={e => setCohereKeyInput(e.target.value)}
                placeholder="your_cohere_key..."
                style={{ ...S.input, flex: 1, width: 'auto', minWidth: 0, height: 32, fontSize: 10, padding: '6px 10px' }}
              />
              {user?.hasCohereKey ? (
                <button
                  disabled={savingCohere}
                  onClick={handleRemoveCohere}
                  style={{ ...S.btn.danger, width: 'auto', flexShrink: 0, padding: '0 14px', height: 32, fontSize: 9 }}
                >Remove</button>
              ) : (
                <button
                  disabled={savingCohere || !cohereKeyInput.trim()}
                  onClick={handleSaveCohere}
                  style={{ ...S.btn.primary, width: 'auto', flexShrink: 0, padding: '0 14px', height: 32, fontSize: 9, opacity: cohereKeyInput.trim() ? 1 : 0.4 }}
                >Save</button>
              )}
            </div>
          </div>
          <p style={{ fontFamily: F.mono, fontSize: 8, color: C.muted, marginTop: 2, lineHeight: 1.2 }}>
            * Keys are stored securely in your user document on the backend. Leave them empty to use standard free tier.
          </p>
        </div>

        {/* Section: Bio */}
        <SectionTitle label="Profile for AI" sub="Used in every generated message" />

        <Input label="Bio" as="textarea" rows={3}
          value={bio} onChange={e => markDirty(setBio)(e.target.value)}
          placeholder="2-3 lines about yourself — e.g. CS undergrad at XYZ, building full-stack apps..."
        />

        {/* Skills */}
        <div>
          <Input label="Skills" value={skillsText}
            onChange={e => markDirty(setSkillsText)(e.target.value)}
            placeholder="React, Node.js, MongoDB, Python..."
          />
          {skillsText && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {skillsText.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                <span key={i} style={{
                  fontFamily: F.mono, fontSize: 9,
                  color: C.accent, background: `${C.accent}12`,
                  border: `1px solid ${C.accent}30`,
                  borderRadius: 4, padding: '2px 7px',
                }}>{skill}</span>
              ))}
            </div>
          )}
        </div>

        {/* Resume text */}
        <Input label="Resume Text" as="textarea" rows={4}
          value={resumeText} onChange={e => markDirty(setResumeText)(e.target.value)}
          placeholder="Paste your full resume as plain text here..."
        />

        {/* Resume link */}
        <Input label="Resume Link" value={resumeLink}
          onChange={e => markDirty(setResumeLink)(e.target.value)}
          placeholder="Google Drive / portfolio URL"
        />

        {/* Projects */}
        <SectionTitle label="Projects" sub="Mentioned in AI outreach" />

        {projects.map((proj, idx) => (
          <div key={idx} className="fadeUp" style={{ ...S.card, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...S.label }}>Project {idx + 1}</span>
              <button onClick={() => removeProject(idx)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: F.mono, fontSize: 9, color: C.red,
              }}
                onMouseOver={e => e.currentTarget.style.opacity = 0.7}
                onMouseOut={e => e.currentTarget.style.opacity = 1}
              >✕ Remove</button>
            </div>
            <input placeholder="Project name" value={proj.name}
              onChange={e => updateProject(idx, 'name', e.target.value)}
              style={{ ...S.input, fontSize: 10 }}
            />
            <textarea placeholder="One-line description" value={proj.description} rows={2}
              onChange={e => updateProject(idx, 'description', e.target.value)}
              style={{ ...S.input, fontSize: 10 }}
            />
            <input placeholder="Tech stack (comma-separated)" value={(proj.techStack || []).join(', ')}
              onChange={e => updateProject(idx, 'techStack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              style={{ ...S.input, fontSize: 10 }}
            />
            <input placeholder="Link (optional)" value={proj.link || ''}
              onChange={e => updateProject(idx, 'link', e.target.value)}
              style={{ ...S.input, fontSize: 10 }}
            />
          </div>
        ))}

        <button onClick={addProject} style={{
          ...S.btn.ghost, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
          onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim }}
        >+ Add Project</button>

        {/* Save */}
        <button onClick={handleSaveProfile} disabled={saving || !dirty} style={{
          ...S.btn.primary,
          opacity: (saving || !dirty) ? 0.4 : 1,
          marginTop: 4, marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {saving
            ? <><span className="spin" style={{ width: 12, height: 12, border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block' }} />Saving...</>
            : dirty ? '◈ Save Profile' : '✓ Saved'}
        </button>

      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}

function SectionTitle({ label, sub }) {
  return (
    <div style={{ marginTop: 4 }}>
      <p style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
      {sub && <p style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, marginTop: 2 }}>{sub}</p>}
    </div>
  )
}
