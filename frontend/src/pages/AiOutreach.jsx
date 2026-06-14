import { useEffect, useState } from 'react'
import { getContacts, generateOutreachMessage, getAiUsageStats } from '../utils/api.js'
import { C, F, S } from '../utils/styles.js'

export default function AiOutreach() {
  const [contacts, setContacts] = useState([])
  const [usage, setUsage] = useState(null)
  
  // Form state
  const [selectedContactId, setSelectedContactId] = useState('')
  const [outreachType, setOutreachType] = useState('linkedin')
  const [jobDescription, setJobDescription] = useState('')

  // UI state
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [toast, setToast] = useState(null)

  const loadInitialData = async () => {
    try {
      const [leadsRes, usageRes] = await Promise.all([
        getContacts(),
        getAiUsageStats()
      ])
      setContacts(leadsRes.data || [])
      setUsage(usageRes.data)
    } catch (err) {
      showToast(err.message || 'Failed to fetch outreach settings', 'error')
    } finally {
      setLoadingLeads(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!selectedContactId) {
      showToast('Please select a target lead', 'error')
      return
    }

    setGenerating(true)
    setResult(null)
    try {
      const res = await generateOutreachMessage(selectedContactId, outreachType, jobDescription)
      setResult(res.data)
      showToast('✓ AI message generated successfully!', 'success')
      
      // Update usage remaining count
      const usageRes = await getAiUsageStats()
      setUsage(usageRes.data)
    } catch (err) {
      showToast(err.message || 'AI Generation failed', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    showToast('✓ Copied to clipboard!', 'success')
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (loadingLeads) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 15, background: C.bg }}>
        <span className="spin" style={{ width: 32, height: 32, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, borderRadius: '50%', display: 'inline-block' }} />
        <p style={{ fontFamily: F.mono, fontSize: 13, color: C.textDim }}>Syncing outreach models...</p>
      </div>
    )
  }

  const isUnlimited = usage?.unlimited || usage?.plan === 'pro' || usage?.hasPersonalKey

  return (
    <div className="fadeUp" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      {/* Header and Usage Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>AI Outreach Copilot</h1>
          <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, marginTop: 4 }}>Generate hyper-personalized cold emails and LinkedIn notes instantly</p>
        </div>
        
        {/* AI Generations Used Info */}
        <div style={{
          ...S.card,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: F.mono,
          fontSize: 10,
        }}>
          <div>
            <span style={{ color: C.textDim }}>AI CREDITS USED:</span>{' '}
            <span style={{ color: C.text, fontWeight: 700 }}>
              {isUnlimited ? `${usage?.used || 0} (Unlimited)` : `${usage?.used || 0} / ${usage?.limit || 50}`}
            </span>
          </div>
          <span style={{
            color: isUnlimited ? C.accent : C.yellow,
            background: isUnlimited ? `${C.accent}12` : `${C.yellow}12`,
            border: `1px solid ${isUnlimited ? C.accent : C.yellow}25`,
            borderRadius: 4, padding: '2px 6px',
            textTransform: 'uppercase',
            fontSize: 9,
          }}>
            {isUnlimited ? 'Unlimited Active' : 'Free Tier'}
          </span>
        </div>
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

      {/* Main Grid split: Form vs Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* Form Settings */}
        <form onSubmit={handleGenerate} style={{
          ...S.card,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Outreach Configuration</h3>

          {/* Contact Selector */}
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Target Lead *</label>
            <select
              required
              value={selectedContactId}
              onChange={e => setSelectedContactId(e.target.value)}
              style={{ ...S.input, background: C.bg, cursor: 'pointer' }}
            >
              <option value="">-- Choose a contact --</option>
              {contacts.map(c => (
                <option key={c._id} value={c._id}>
                  {c.person} ({c.position} @ {c.companies})
                </option>
              ))}
            </select>
          </div>

          {/* Outreach Type Selector */}
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Outreach Format</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {['linkedin', 'message', 'email'].map(type => {
                const isSelected = outreachType === type
                const label = type === 'linkedin' ? 'LI Note' : type === 'message' ? 'LI Message' : 'Email'
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOutreachType(type)}
                    style={{
                      background: isSelected ? `${C.accent}12` : C.bg,
                      color: isSelected ? C.accent : C.textDim,
                      border: `1px solid ${isSelected ? C.accent : C.border}`,
                      borderRadius: 6,
                      fontFamily: F.mono,
                      fontSize: 11,
                      padding: '8px 4px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Job Description (Optional) */}
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Job Description / Context (Optional)</label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the target job description or specific notes here to make the message hyper-relevant..."
              rows={6}
              style={{ ...S.input, fontSize: 11 }}
            />
          </div>

          {/* Generate Action Button */}
          <button
            type="submit"
            disabled={generating}
            style={{
              ...S.btn.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 6,
            }}
          >
            {generating ? (
              <>
                <span className="spin" style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.1)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block' }} />
                Crafting Message via AI...
              </>
            ) : (
              '⚡ Compose Message'
            )}
          </button>
        </form>

        {/* Results Container */}
        <div style={{
          ...S.card,
          padding: '20px 24px',
          minHeight: '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: result ? 'flex-start' : 'center',
          alignItems: result ? 'stretch' : 'center',
          gap: 16,
        }}>
          {!result && !generating && (
            <div style={{ textAlign: 'center', color: C.muted, padding: '40px 0' }}>
              <span style={{ fontSize: 32 }}>⚡</span>
              <p style={{ fontFamily: F.mono, fontSize: 11, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Your generated outreach message will appear here.
              </p>
            </div>
          )}

          {generating && (
            <div style={{ textAlign: 'center', color: C.textDim, padding: '40px 0' }}>
              <span className="spin" style={{ width: 24, height: 24, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', display: 'inline-block', marginBottom: 10 }} />
              <p style={{ fontFamily: F.mono, fontSize: 11, textTransform: 'uppercase' }}>Reading user profile & job guidelines...</p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...S.label }}>AI Draft Output</span>
                <span style={{ fontFamily: F.mono, fontSize: 9, color: C.accent }}>
                  ✓ Copied & saved to target lead
                </span>
              </div>

              {/* Email subject separate parser */}
              {outreachType === 'email' && result.subject && (
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 12px' }}>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Subject Line</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: F.sans, fontSize: 13, color: C.text, fontWeight: 600 }}>{result.subject}</span>
                    <button
                      onClick={() => handleCopy(result.subject)}
                      style={{ background: 'transparent', border: 'none', color: C.accent, cursor: 'pointer', fontFamily: F.mono, fontSize: 10 }}
                    >COPY</button>
                  </div>
                </div>
              )}

              {/* Main outreach message */}
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '14px 16px', position: 'relative' }}>
                <label style={{ ...S.label, display: 'block', marginBottom: 8 }}>Draft Content</label>
                <p style={{
                  fontFamily: F.sans,
                  fontSize: 13,
                  color: C.text,
                  lineHeight: 1.5,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>{result.content || result}</p>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    onClick={() => handleCopy(result.content || result)}
                    style={{
                      ...S.btn.ghost,
                      padding: '5px 12px',
                      fontSize: 10,
                      color: C.accent,
                      borderColor: `${C.accent}40`
                    }}
                  >
                    📋 Copy Content
                  </button>
                </div>
              </div>

              <p style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, margin: 0, lineHeight: 1.3 }}>
                * Generated drafts are automatically saved to your lead's outreach timeline and dashboard tracker logs.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
