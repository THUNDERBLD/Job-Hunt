import { useState, useEffect } from 'react'
import { getContacts, generateContent } from '../../utils/api.js'
import { Loader, Toast, PageHeader } from '../components/UI.jsx'
import { C, F, S } from '../../styles.js'

const TYPES = [
  { id:'linkedin', label:'Connection Note', desc:'≤200 chars' },
  { id:'message',  label:'LinkedIn DM',     desc:'After connecting' },
  { id:'email',    label:'Cold Email',       desc:'With subject' },
]

export default function Generate({ preselectedContact = null }) {
  const [contacts,    setContacts]    = useState([])
  const [contactId,   setContactId]   = useState(preselectedContact?._id || '')
  const [type,        setType]        = useState('linkedin')
  const [jd,          setJd]          = useState('')
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [toast,       setToast]       = useState(null)
  const [jdFocused,   setJdFocused]   = useState(false)
  const [jdExpanded,  setJdExpanded]  = useState(false)

  useEffect(() => {
    getContacts().then(r => setContacts(r.data||[])).finally(() => setLoadingList(false))
  }, [])

  useEffect(() => {
    if (loading) return
    if (!contactId) {
      setResult(null)
      return
    }
    const selContact = contacts.find(c => c._id === contactId)
    if (!selContact) return

    if (type === 'linkedin' && selContact.generatedLinkedInNote) {
      setResult({ content: selContact.generatedLinkedInNote })
    } else if (type === 'message' && selContact.generatedLinkedInDM) {
      setResult({ content: selContact.generatedLinkedInDM })
    } else if (type === 'email' && selContact.generatedEmail) {
      setResult({ subject: selContact.generatedEmailSubject || '', content: selContact.generatedEmail })
    } else {
      setResult(null)
    }
  }, [contactId, type, contacts, loading])

  const generate = async () => {
    if (!contactId) { setToast({ message:'Select a contact first', type:'error' }); return }
    setLoading(true); setResult(null)
    try {
      const r = await generateContent(contactId, type, jd)
      setResult(r.data)
      setContacts(prev => prev.map(c => {
        if (c._id === contactId) {
          if (type === 'email') {
            return {
              ...c,
              generatedEmail: r.data.content,
              generatedEmailSubject: r.data.subject,
              generatedAt: new Date()
            }
          } else if (type === 'linkedin') {
            return {
              ...c,
              generatedLinkedInNote: r.data.content,
              generatedAt: new Date()
            }
          } else if (type === 'message') {
            return {
              ...c,
              generatedLinkedInDM: r.data.content,
              generatedAt: new Date()
            }
          }
        }
        return c
      }))
    } catch (e) {
      const msg = e.message || 'Generation failed';
      setToast({ message: msg.toLowerCase().includes('profile') ? 'Set up your profile first' : msg, type: 'error' })
    } finally { setLoading(false) }
  }

  const sel = contacts.find(c => c._id === contactId)

  return (
    <div className="fadeUp" style={{ display:'flex', flexDirection:'column', flex:1, height:0, position:'relative', overflow:'hidden' }}>
      <PageHeader tag="AI Generate" title="Write Outreach" />

      <div className="scroll" style={{ flex:1, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto', minHeight:0 }}>

        {/* Contact picker */}
        <div>
          <p style={{ ...S.label, marginBottom:5 }}>Contact</p>
          <select value={contactId} onChange={e => { setContactId(e.target.value); setResult(null) }}
            style={{ ...S.input, appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', paddingRight:28 }}>
            <option value="">— Choose a contact —</option>
            {loadingList
              ? <option disabled>Loading...</option>
              : contacts.map(c => <option key={c._id} value={c._id}>{c.name} · {c.company}</option>)
            }
          </select>
          {sel && <p style={{ fontFamily:F.mono, fontSize:9, color:C.muted, marginTop:4 }}>{sel.position} · {sel.companyType}</p>}
        </div>

        {/* Type selector */}
        <div>
          <p style={{ ...S.label, marginBottom:5 }}>Message Type</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
            {TYPES.map(t => (
              <TypeCard key={t.id} {...t} active={type===t.id} onClick={() => { setType(t.id); setResult(null) }} />
            ))}
          </div>
        </div>

        {/* Job description */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
            <p style={{ ...S.label }}>Job Description</p>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {jd && <button onClick={() => setJd('')} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F.mono, fontSize:9, color:C.muted }}
                onMouseOver={e=>e.currentTarget.style.color=C.red} onMouseOut={e=>e.currentTarget.style.color=C.muted}>Clear</button>}
              <button onClick={() => setJdExpanded(x=>!x)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F.mono, fontSize:9, color:C.muted }}
                onMouseOver={e=>e.currentTarget.style.color=C.accent} onMouseOut={e=>e.currentTarget.style.color=C.muted}>
                {jdExpanded ? '↑ Collapse' : '↓ Expand'}
              </button>
            </div>
          </div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} rows={jdExpanded ? 7 : 3}
            onFocus={() => setJdFocused(true)} onBlur={() => setJdFocused(false)}
            placeholder="Paste job description from Wellfound / YC..."
            style={{ ...S.input, borderColor: jdFocused ? C.accent : C.border, transition:'all 0.15s' }} />
          {jd && <p style={{ fontFamily:F.mono, fontSize:9, color:C.accent, marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:C.accent, display:'inline-block' }} />
            JD loaded · {jd.length} chars
          </p>}
        </div>

        {/* Generate button */}
        <button onClick={generate} disabled={loading || !contactId} style={{ ...S.btn.primary, opacity: (loading||!contactId) ? 0.45 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading
            ? <><span className="spin" style={{ width:12, height:12, border:'2px solid rgba(0,0,0,0.2)', borderTop:'2px solid #000', borderRadius:'50%', display:'inline-block' }} />Generating...</>
            : '◈ Generate'}
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:12, display:'flex', flexDirection:'column', gap:8 }}>
            {[80,100,65].map((w,i) => <div key={i} className="pulse" style={{ height:8, background:C.border2, borderRadius:4, width:`${w}%` }} />)}
            <p style={{ fontFamily:F.mono, fontSize:10, color:C.muted, textAlign:'center', marginTop:4 }}>Asking AI...</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="fadeUp" style={{ background:C.surface, border:`1px solid ${C.accent}30`, borderRadius:10, overflow:'hidden' }}>

            {/* Result header */}
            <div style={{ padding:'8px 12px', borderBottom:`1px solid ${C.border}`, background:`${C.accent}08`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.accent, display:'inline-block' }} />
                <span style={{ fontFamily:F.mono, fontSize:9, color:C.accent, textTransform:'uppercase', letterSpacing:'1px' }}>
                  {type==='linkedin' ? 'Connection Note' : type==='message' ? 'LinkedIn DM' : 'Cold Email'}
                </span>
              </div>
              <CopyBtn text={result.subject ? `Subject: ${result.subject}\n\n${result.content}` : result.content} label="Copy All" />
            </div>

            <div style={{ padding:12, display:'flex', flexDirection:'column', gap:10 }}>
              {result.subject && (
                <ResultBlock label="Subject Line" text={result.subject} accent />
              )}
              <ResultBlock
                label={result.subject ? 'Body' : type==='linkedin' ? 'Note' : 'Message'}
                text={result.content}
                charLimit={type==='linkedin' ? 200 : null}
              />
              <button onClick={generate} style={{ ...S.btn.ghost, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                onMouseOver={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textDim}}>
                ↺ Regenerate
              </button>
            </div>
          </div>
        )}

      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}

function TypeCard({ id, label, desc, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        border:`1px solid ${active ? C.accent : hov ? C.border2 : C.border}`,
        background: active ? `${C.accent}12` : hov ? C.surface2 : C.surface,
        borderRadius:6, padding:'8px 8px', textAlign:'left',
        cursor:'pointer', transition:'all 0.15s',
      }}>
      <p style={{ fontFamily:F.mono, fontSize:10, fontWeight:700, color: active ? C.accent : C.text, marginBottom:3 }}>{label}</p>
      <p style={{ fontFamily:F.mono, fontSize:8.5, color:C.muted }}>{desc}</p>
    </button>
  )
}

function ResultBlock({ label, text, charLimit, accent }) {
  const [expanded, setExpanded] = useState(false)
  const over = charLimit && text.length > charLimit
  const isLong = text.length > 120

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
        <span style={{ fontFamily:F.mono, fontSize:9, color:C.muted, textTransform:'uppercase' }}>{label}</span>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {charLimit && <span style={{ fontFamily:F.mono, fontSize:9, color: over ? C.red : C.muted }}>{text.length}/{charLimit}{over&&' ⚠'}</span>}
          {isLong && (
            <button onClick={() => setExpanded(x=>!x)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F.mono, fontSize:9, color:C.muted }}
              onMouseOver={e=>e.currentTarget.style.color=C.accent} onMouseOut={e=>e.currentTarget.style.color=C.muted}>
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <CopyBtn text={text} />
        </div>
      </div>
      <p style={{ fontFamily:F.mono, fontSize:10.5, color: accent ? C.accent : C.textDim, background:C.bg, border:`1px solid ${C.border}40`, borderRadius:6, padding:'9px 11px', lineHeight:1.75, whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight: expanded ? 'none' : 130, overflowY: expanded ? 'visible' : 'auto' }}>
        {text}
      </p>
      {over && <p style={{ fontFamily:F.mono, fontSize:9, color:C.red, marginTop:4 }}>Over LinkedIn's 200-char limit — regenerate for a shorter version.</p>}
    </div>
  )
}

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <button onClick={copy} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:F.mono, fontSize:9, color: copied ? C.accent : C.muted, transition:'color 0.15s' }}
      onMouseOver={e=>!copied&&(e.currentTarget.style.color=C.textDim)}
      onMouseOut={e=>!copied&&(e.currentTarget.style.color=C.muted)}>
      {copied ? '✓ Copied' : label}
    </button>
  )
}