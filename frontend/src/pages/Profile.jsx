import { useEffect, useState } from 'react'
import {
  getMe,
  updateUserProfile,
  updateCohereKey,
  removeCohereKey,
  updateGeminiKey,
  removeGeminiKey
} from '../utils/api.js'
import { C, F, S } from '../utils/styles.js'

export default function Profile({ onUserUpdated }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState(null)

  // Profile fields
  const [bio, setBio] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [resumeLink, setResumeLink] = useState('')
  const [projects, setProjects] = useState([])

  // API Key inputs
  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [cohereKeyInput, setCohereKeyInput] = useState('')
  const [savingGemini, setSavingGemini] = useState(false)
  const [savingCohere, setSavingCohere] = useState(false)

  const fetchProfile = async () => {
    try {
      const res = await getMe()
      setUser(res.data)
      const p = res.data.profile || {}
      setBio(p.bio || '')
      setSkillsText((p.skills || []).join(', '))
      setResumeText(p.resumeText || '')
      setResumeLink(p.resumeLink || '')
      setProjects(p.projects || [])
      setDirty(false)
    } catch (err) {
      showToast(err.message || 'Failed to fetch profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const markDirty = (setter) => (val) => {
    setter(val)
    setDirty(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean)
      const data = { bio, skills, resumeText, resumeLink, projects }
      const res = await updateUserProfile(data)
      setUser(res.data)
      setDirty(false)
      showToast('✓ Profile updated successfully!', 'success')
      if (onUserUpdated) onUserUpdated(res.data)
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Projects CRUD
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

  // Key updates
  const handleSaveGemini = async () => {
    if (!geminiKeyInput.trim()) return
    setSavingGemini(true)
    try {
      const res = await updateGeminiKey(geminiKeyInput.trim())
      setUser(res.data)
      setGeminiKeyInput('')
      showToast('✓ Gemini API key saved! Unlimited enabled.', 'success')
      if (onUserUpdated) onUserUpdated(res.data)
    } catch (err) {
      showToast(err.message || 'Failed to save Gemini key', 'error')
    } finally {
      setSavingGemini(false)
    }
  }

  const handleRemoveGemini = async () => {
    setSavingGemini(true)
    try {
      const res = await removeGeminiKey()
      setUser(res.data)
      showToast('✓ Gemini API key removed', 'success')
      if (onUserUpdated) onUserUpdated(res.data)
    } catch (err) {
      showToast(err.message || 'Failed to remove Gemini key', 'error')
    } finally {
      setSavingGemini(false)
    }
  }

  const handleSaveCohere = async () => {
    if (!cohereKeyInput.trim()) return
    setSavingCohere(true)
    try {
      const res = await updateCohereKey(cohereKeyInput.trim())
      setUser(res.data)
      setCohereKeyInput('')
      showToast('✓ Cohere API key saved! Unlimited enabled.', 'success')
      if (onUserUpdated) onUserUpdated(res.data)
    } catch (err) {
      showToast(err.message || 'Failed to save Cohere key', 'error')
    } finally {
      setSavingCohere(false)
    }
  }

  const handleRemoveCohere = async () => {
    setSavingCohere(true)
    try {
      const res = await removeCohereKey()
      setUser(res.data)
      showToast('✓ Cohere API key removed', 'success')
      if (onUserUpdated) onUserUpdated(res.data)
    } catch (err) {
      showToast(err.message || 'Failed to remove Cohere key', 'error')
    } finally {
      setSavingCohere(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 15, background: C.bg }}>
        <span className="spin" style={{ width: 32, height: 32, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, borderRadius: '50%', display: 'inline-block' }} />
        <p style={{ fontFamily: F.mono, fontSize: 13, color: C.textDim }}>Loading settings configuration...</p>
      </div>
    )
  }

  const isUnlimited = user?.plan === 'pro' || user?.hasCohereKey || user?.hasGeminiKey

  return (
    <div className="fadeUp" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      <div>
        <h1 style={{ fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Profile & Settings</h1>
        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, marginTop: 4 }}>Manage self-hosted LLM API keys and profile records for outreach tailoring</p>
      </div>

      {toast && (
        <div style={{
          background: toast.type === 'success' ? `${C.accent}12` : `${C.red}12`,
          border: `1px solid ${toast.type === 'success' ? C.accent : C.red}35`,
          borderRadius: 8, padding: '12px 16px',
          color: toast.type === 'success' ? C.accent : C.red,
          fontFamily: F.mono, fontSize: 12
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* Left Side: General Profile Form */}
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ ...S.card, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Outreach Resume Profile</h3>
            
            {/* Bio */}
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 5 }}>Bio / Summary</label>
              <textarea
                value={bio}
                onChange={e => markDirty(setBio)(e.target.value)}
                placeholder="2-3 lines about yourself — e.g. Full-stack Developer looking for roles..."
                rows={3}
                style={{ ...S.input, fontSize: 11 }}
              />
            </div>

            {/* Skills */}
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 5 }}>Core Skills (comma separated)</label>
              <input
                type="text"
                value={skillsText}
                onChange={e => markDirty(setSkillsText)(e.target.value)}
                placeholder="e.g. React, Node.js, Python, AWS"
                style={{ ...S.input, fontSize: 11 }}
              />
              {skillsText && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {skillsText.split(',').map(s => s.trim()).filter(Boolean).map((skill, idx) => (
                    <span key={idx} style={{
                      fontFamily: F.mono, fontSize: 9,
                      color: C.accent, background: `${C.accent}12`,
                      border: `1px solid ${C.accent}25`,
                      padding: '2px 6px', borderRadius: 4
                    }}>{skill}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Text */}
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 5 }}>Resume Plain Text</label>
              <textarea
                value={resumeText}
                onChange={e => markDirty(setResumeText)(e.target.value)}
                placeholder="Paste the text content of your resume here. The AI reads this to match experience..."
                rows={8}
                style={{ ...S.input, fontSize: 11 }}
              />
            </div>

            {/* Resume Link */}
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 5 }}>Resume / Portfolio Link</label>
              <input
                type="url"
                value={resumeLink}
                onChange={e => markDirty(setResumeLink)(e.target.value)}
                placeholder="e.g. Portfolio site URL or Google Drive link"
                style={{ ...S.input, fontSize: 11 }}
              />
            </div>

            <button
              type="submit"
              disabled={saving || !dirty}
              style={{
                ...S.btn.primary,
                opacity: (saving || !dirty) ? 0.4 : 1,
                cursor: (saving || !dirty) ? 'not-allowed' : 'pointer',
                marginTop: 6
              }}
            >
              {saving ? 'Saving Profile...' : dirty ? 'Save Profile Changes' : '✓ Saved'}
            </button>
          </div>

        </form>

        {/* Right Side: Keys & Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* API Keys Configuration */}
          <div style={{ ...S.card, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Self-Hosted API Keys</h3>
            <p style={{ fontFamily: F.sans, fontSize: 11, color: C.textDim, margin: 0 }}>
              Entering personal keys activates **UNLIMITED** outreach message compose actions on your account.
            </p>

            {/* Gemini */}
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Gemini API Key (Primary)</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="password"
                  disabled={user?.hasGeminiKey || savingGemini}
                  value={user?.hasGeminiKey ? '••••••••••••••••••••••••••••••' : geminiKeyInput}
                  onChange={e => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{ ...S.input, flex: 1, width: 'auto', minWidth: 0, height: 32, fontSize: 11, padding: '6px 10px' }}
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
              <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Cohere API Key (Fallback)</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="password"
                  disabled={user?.hasCohereKey || savingCohere}
                  value={user?.hasCohereKey ? '••••••••••••••••••••••••••••••' : cohereKeyInput}
                  onChange={e => setCohereKeyInput(e.target.value)}
                  placeholder="your_cohere_key..."
                  style={{ ...S.input, flex: 1, width: 'auto', minWidth: 0, height: 32, fontSize: 11, padding: '6px 10px' }}
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
            
            <span style={{ fontFamily: F.mono, fontSize: 8, color: C.muted }}>
              * Keys are kept secured inside hashed schema fields on the backend.
            </span>
          </div>

          {/* Project Manager */}
          <div style={{ ...S.card, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Featured Projects</h3>
              <button
                type="button"
                onClick={addProject}
                style={{ ...S.btn.ghost, padding: '4px 10px', fontSize: 10 }}
              >+ Add Project</button>
            </div>

            {projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {projects.map((proj, idx) => (
                  <div key={idx} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: F.mono, fontSize: 10, color: C.accent, fontWeight: 600 }}>Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontFamily: F.mono, fontSize: 9 }}
                      >✕ Remove</button>
                    </div>
                    
                    <input
                      type="text"
                      value={proj.name || ''}
                      onChange={e => updateProject(idx, 'name', e.target.value)}
                      placeholder="Project Name"
                      style={{ ...S.input, padding: '6px 8px', fontSize: 10 }}
                    />
                    
                    <textarea
                      value={proj.description || ''}
                      onChange={e => updateProject(idx, 'description', e.target.value)}
                      placeholder="Short Description of what it does..."
                      rows={2}
                      style={{ ...S.input, padding: '6px 8px', fontSize: 10 }}
                    />

                    <input
                      type="text"
                      value={(proj.techStack || []).join(', ')}
                      onChange={e => updateProject(idx, 'techStack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="Tech Stack (comma separated)"
                      style={{ ...S.input, padding: '6px 8px', fontSize: 10 }}
                    />

                    <input
                      type="url"
                      value={proj.link || ''}
                      onChange={e => updateProject(idx, 'link', e.target.value)}
                      placeholder="Project Demo / GitHub URL (optional)"
                      style={{ ...S.input, padding: '6px 8px', fontSize: 10 }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, margin: '10px 0' }}>No projects registered in profile.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
