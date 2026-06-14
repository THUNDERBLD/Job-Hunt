import { useState } from 'react'
import { createContact } from '../utils/api.js'
import { C, F, S, STATUS_META } from '../utils/styles.js'

export default function AddContact({ onLeadAdded }) {
  const [person, setPerson] = useState('')
  const [position, setPosition] = useState('')
  const [company, setCompany] = useState('')
  const [isStartup, setIsStartup] = useState('No')
  const [status, setStatus] = useState('discovered')
  const [priority, setPriority] = useState('Mid')
  const [socials, setSocials] = useState('LinkedIn')
  const [links, setLinks] = useState('')
  const [email, setEmail] = useState('')
  const [referrals, setReferrals] = useState('Not asked')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!person.trim()) return showToast('Person name is required', 'error')
    if (!company.trim()) return showToast('Company name is required', 'error')
    if (!position.trim()) return showToast('Position is required', 'error')

    setSaving(true)
    try {
      const payload = {
        person: person.trim(),
        position: position.trim(),
        companies: company.trim(),
        startups: isStartup,
        status,
        priority,
        socials: socials.trim(),
        links: links.trim(),
        email: email.trim() || null,
        referrals: referrals.trim(),
        notes: notes.trim()
      }

      await createContact(payload)
      showToast('✓ Lead successfully added to tracker!', 'success')
      
      // Reset form
      setPerson('')
      setPosition('')
      setCompany('')
      setIsStartup('No')
      setStatus('discovered')
      setPriority('Mid')
      setSocials('LinkedIn')
      setLinks('')
      setEmail('')
      setReferrals('Not asked')
      setNotes('')

      if (onLeadAdded) onLeadAdded()
    } catch (err) {
      showToast(err.message || 'Failed to save lead', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="fadeUp" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      <div>
        <h1 style={{ fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Add New Lead</h1>
        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, marginTop: 4 }}>Manually add a contact to your pipeline tracker</p>
      </div>

      {toast && (
        <div style={{
          background: toast.type === 'success' ? `${C.accent}12` : `${C.red}12`,
          border: `1px solid ${toast.type === 'success' ? C.accent : C.red}35`,
          borderRadius: 8,
          padding: '12px 16px',
          color: toast.type === 'success' ? C.accent : C.red,
          fontFamily: F.mono,
          fontSize: 12,
          transition: 'all 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        ...S.card,
        padding: '24px 30px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {/* Row 1: Person & Job Title */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Lead Person Name *</label>
            <input
              type="text"
              required
              value={person}
              onChange={e => setPerson(e.target.value)}
              placeholder="e.g. Ayana Ali"
              style={S.input}
            />
          </div>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Position / Job Title *</label>
            <input
              type="text"
              required
              value={position}
              onChange={e => setPosition(e.target.value)}
              placeholder="e.g. SDE-2 / Hiring Manager"
              style={S.input}
            />
          </div>
        </div>

        {/* Row 2: Company & Company Type */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Company Name *</label>
            <input
              type="text"
              required
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. Stripe / Google"
              style={S.input}
            />
          </div>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Company Type</label>
            <select
              value={isStartup}
              onChange={e => setIsStartup(e.target.value)}
              style={{ ...S.input, background: C.bg, cursor: 'pointer' }}
            >
              <option value="No">Corporate / MNC</option>
              <option value="Yes">Startup</option>
            </select>
          </div>
        </div>

        {/* Row 3: Stage & Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Initial Outreach Stage</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ ...S.input, background: C.bg, cursor: 'pointer' }}
            >
              {Object.entries(STATUS_META).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Pipeline Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              style={{ ...S.input, background: C.bg, cursor: 'pointer' }}
            >
              <option value="High">🔴 High Priority</option>
              <option value="Mid">🟡 Mid Priority</option>
              <option value="Low">⚪ Low Priority</option>
            </select>
          </div>
        </div>

        {/* Row 4: Links & Platform */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Social Profile Link</label>
            <input
              type="url"
              value={links}
              onChange={e => setLinks(e.target.value)}
              placeholder="e.g. https://linkedin.com/in/username"
              style={S.input}
            />
          </div>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Platform</label>
            <input
              type="text"
              value={socials}
              onChange={e => setSocials(e.target.value)}
              placeholder="e.g. LinkedIn"
              style={S.input}
            />
          </div>
        </div>

        {/* Row 5: Email & Referrals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. name@company.com"
              style={S.input}
            />
          </div>
          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Referral Status</label>
            <input
              type="text"
              value={referrals}
              onChange={e => setReferrals(e.target.value)}
              placeholder="e.g. Asked / Not asked / Future"
              style={S.input}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Conversation Log / Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add background notes or messages log..."
            rows={4}
            style={S.input}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...S.btn.primary,
              width: 'auto',
              minWidth: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? 'Creating Lead...' : 'Add Lead Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}
