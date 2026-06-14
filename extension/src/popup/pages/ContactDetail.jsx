import { useState } from 'react'
import { updateContact, deleteContact } from '../../utils/api.js'
import { Toast, StatusBadge } from '../components/UI.jsx'
import { C, F, S, STATUS_META, PRIORITY_COLOR, NEXT_STATUS } from '../../styles.js'

export default function ContactDetail({ contact: init, onBack, onNavigateGenerate }) {
  const [contact, setContact] = useState(init)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)
  const [confirm, setConfirm] = useState(false)

  const priColor  = PRIORITY_COLOR[contact.priority] || C.muted
  const nextSt    = NEXT_STATUS[contact.status]

  const updateStatus = async (s) => {
    setSaving(true)
    try {
      const r = await updateContact(contact._id, { status: s })
      setContact(r.data)
      setToast({ message: `→ ${STATUS_META[s]?.label}`, type: 'success' })
    } catch { setToast({ message: 'Update failed', type: 'error' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await deleteContact(contact._id)
      setToast({ message: 'Deleted', type: 'success' })
      setTimeout(onBack, 900)
    } catch { setToast({ message: 'Delete failed', type: 'error' }); setSaving(false) }
  }

  const saveEmail = async (email) => {
    try { const r = await updateContact(contact._id, { email }); setContact(r.data); setToast({ message: 'Email saved', type: 'success' }) }
    catch { setToast({ message: 'Failed', type: 'error' }) }
  }

  return (
    <div className="fadeUp" style={{ display:'flex', flexDirection:'column', height:'100%', position:'relative' }}>

      {/* Header */}
      <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F.mono, fontSize:10, color:C.muted, marginBottom:8, padding:0, display:'flex', alignItems:'center', gap:4 }}
          onMouseOver={e => e.currentTarget.style.color=C.accent}
          onMouseOut={e =>  e.currentTarget.style.color=C.muted}>
          ← Back
        </button>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:F.sans, fontSize:15, fontWeight:700, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{contact.name}</p>
            <p style={{ fontFamily:F.mono, fontSize:10, color:C.textDim, marginTop:2 }}>{contact.position} · {contact.company}</p>
          </div>
          <span style={{ fontFamily:F.mono, fontSize:9, color:priColor, textTransform:'uppercase', flexShrink:0, marginTop:3, marginLeft:8 }}>{contact.priority}</span>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'10px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {/* Status card */}
        <Card title="Status">
          <StatusBadge status={contact.status} size="md" />
          {nextSt && (
            <Btn onClick={() => updateStatus(nextSt)} disabled={saving} style={{ marginTop:8, background:'rgba(0,229,160,0.08)', border:`1px solid rgba(0,229,160,0.25)`, color:C.accent, width:'100%' }}>
              → Mark as {STATUS_META[nextSt]?.label}
            </Btn>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
            {Object.keys(STATUS_META).map(s => {
              const active = s === contact.status
              const meta   = STATUS_META[s]
              return (
                <button key={s} disabled={saving || active} onClick={() => updateStatus(s)} style={{
                  fontFamily:F.mono, fontSize:9, padding:'3px 8px', borderRadius:4,
                  border:`1px solid ${active ? meta.color + '60' : C.border}`,
                  background: active ? `${meta.color}15` : 'transparent',
                  color: active ? meta.color : C.muted,
                  cursor: active ? 'default' : 'pointer', transition:'all 0.15s',
                  textTransform:'uppercase', letterSpacing:'0.5px',
                }}>
                  {meta.label}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Info card */}
        <Card title="Contact Info">
          <InfoRow label="LinkedIn" value={contact.linkedinUrl} link />
          {contact.email
            ? <InfoRow label="Email" value={contact.email} />
            : <AddEmail onSave={saveEmail} />
          }
          {contact.jobRole && <InfoRow label="Role"   value={contact.jobRole} />}
          {contact.source   && <InfoRow label="Source" value={contact.source} />}
        </Card>

        {/* Generated content */}
        {(contact.generatedLinkedInNote || contact.generatedLinkedInDM || contact.generatedEmail || contact.generatedMessage) && (
          <Card title="Generated Messages">
            {contact.generatedLinkedInNote && <CopyBlock label="Connection Note" text={contact.generatedLinkedInNote} />}
            {contact.generatedLinkedInDM   && <CopyBlock label="LinkedIn DM" text={contact.generatedLinkedInDM} />}
            {contact.generatedEmail        && <CopyBlock label={contact.generatedEmailSubject || 'Cold Email'} text={contact.generatedEmail} />}
            {contact.generatedMessage &&
              contact.generatedMessage !== contact.generatedLinkedInNote &&
              contact.generatedMessage !== contact.generatedLinkedInDM && (
                <CopyBlock label="Message (Legacy)" text={contact.generatedMessage} />
            )}
          </Card>
        )}

        {/* Notes */}
        {contact.notes && (
          <Card title="Notes">
            <p className='py-4' style={{
              fontFamily:F.mono, fontSize:10, color:C.textDim, lineHeight:2.2,
              whiteSpace:'pre-wrap', wordBreak:'break-word',
            }}>
              {contact.notes}
            </p>
          </Card>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => onNavigateGenerate(contact)} style={{ ...S.btn.ghost, flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
            onMouseOver={e => { e.currentTarget.style.borderColor=C.accent; e.currentTarget.style.color=C.accent }}
            onMouseOut={e =>  { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textDim }}>
            ◈ Generate AI
          </button>
          <button onClick={() => setConfirm(true)} style={{ ...S.btn.danger }}
            onMouseOver={e => e.currentTarget.style.background='rgba(255,84,84,0.14)'}
            onMouseOut={e =>  e.currentTarget.style.background='rgba(255,84,84,0.08)'}>
            ✕ Delete
          </button>
        </div>

        {/* Confirm delete */}
        {confirm && (
          <div className="fadeUp" style={{ background:C.surface, border:`1px solid rgba(255,84,84,0.3)`, borderRadius:8, padding:12, display:'flex', flexDirection:'column', gap:10 }}>
            <p style={{ fontFamily:F.mono, fontSize:11, color:C.text }}>
              Delete <span style={{ color:C.red }}>{contact.name}</span>? Cannot be undone.
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleDelete} disabled={saving} style={{ ...S.btn.danger, flex:1 }}>
                {saving ? '...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setConfirm(false)} style={{ ...S.btn.ghost, flex:1 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div className="overflow-auto" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8 }}>
      <div style={{ padding:'7px 12px', borderBottom:`1px solid ${C.border}` }}>
        <p style={{ fontFamily:F.mono, fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:'1px' }}>{title}</p>
      </div>
      {/* No maxHeight — let page scroll handle it */}
      <div style={{ padding:'10px 12px' }}>{children}</div>
    </div>
  )
}

function Btn({ children, style, ...props }) {
  return (
    <button style={{ fontFamily:F.mono, fontSize:10, padding:'7px 12px', borderRadius:6, cursor:'pointer', transition:'all 0.15s', textTransform:'uppercase', letterSpacing:'0.5px', ...style }} {...props}>
      {children}
    </button>
  )
}

function InfoRow({ label, value, link }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:7 }}>
      <span style={{ fontFamily:F.mono, fontSize:9, color:C.muted, textTransform:'uppercase', width:52, flexShrink:0, marginTop:1 }}>{label}</span>
      {link
        ? <a href={value} target="_blank" rel="noreferrer" style={{ fontFamily:F.mono, fontSize:10, color:C.accent, textDecoration:'none', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</a>
        : <span style={{ fontFamily:F.mono, fontSize:10, color:C.textDim, flex:1, wordBreak:'break-all' }}>{value}</span>
      }
    </div>
  )
}

function AddEmail({ onSave }) {
  const [show, setShow] = useState(false)
  const [val,  setVal]  = useState('')
  if (!show) return (
    <button onClick={() => setShow(true)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F.mono, fontSize:10, color:`${C.accent}80`, padding:0, marginBottom:4 }}
      onMouseOver={e => e.currentTarget.style.color=C.accent}
      onMouseOut={e =>  e.currentTarget.style.color=`${C.accent}80`}>
      + Add email
    </button>
  )
  return (
    <div style={{ display:'flex', gap:6, marginBottom:4 }}>
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="email@company.com"
        style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, color:C.text, fontFamily:F.mono, fontSize:10, padding:'6px 8px', outline:'none' }} />
      <button onClick={() => { onSave(val); setShow(false) }}
        style={{ background:'rgba(0,229,160,0.1)', border:`1px solid rgba(0,229,160,0.3)`, borderRadius:5, color:C.accent, fontFamily:F.mono, fontSize:11, padding:'6px 10px', cursor:'pointer' }}>
        ✓
      </button>
    </div>
  )
}

function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <span style={{ fontFamily:F.mono, fontSize:9, color:C.muted, textTransform:'uppercase' }}>{label}</span>
        <button onClick={copy} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F.mono, fontSize:9, color: copied ? C.accent : C.muted, transition:'color 0.15s' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      {/* Removed line-clamp, added maxHeight + scroll */}
      <p style={{
        fontFamily:F.mono, fontSize:10, color:C.textDim,
        background:C.bg, border:`1px solid ${C.border}30`,
        borderRadius:5, padding:'8px 10px', lineHeight:1.7,
        maxHeight:120, overflowY:'auto',
        whiteSpace:'pre-wrap', wordBreak:'break-word',
      }}>
        {text}
      </p>
    </div>
  )
}