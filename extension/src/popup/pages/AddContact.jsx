import { useState, useEffect } from 'react'
import { createContact } from '../../utils/api.js'
import { scrapeCurrentProfile, isLinkedInProfile } from '../../utils/linkedin.js'
import { Toast, PageHeader, Input, Select } from '../components/UI.jsx'
import { C, F, S } from '../../styles.js'

const EMPTY = {
  name:'', position:'', company:'', companyType:'startup',
  linkedinUrl:'', email:'', social:'LinkedIn', source:'wellfound',
  priority:'high', jobRole:'', notes:'',
}

export default function AddContact({ onNavigate }) {
  const [form,       setForm]       = useState(EMPTY)
  const [scraped,    setScraped]    = useState(false)
  const [scraping,   setScraping]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState(null)
  const [onLinkedIn, setOnLinkedIn] = useState(false)
  const [rawDebug,   setRawDebug]   = useState(null)  // shows what scraper returned

  useEffect(() => { isLinkedInProfile().then(setOnLinkedIn) }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const onChange = e => set(e.target.name, e.target.value)

  const handleScrape = async () => {
    setScraping(true)
    setRawDebug(null)
    try {
      const d = await scrapeCurrentProfile()
      setRawDebug(d) // store raw result for debug display

      // Only overwrite fields that actually got data
      setForm(p => ({
        ...p,
        ...(d.name        && { name:        d.name }),
        ...(d.position    && { position:    d.position }),
        ...(d.company     && { company:     d.company }),
        ...(d.companyType && { companyType: d.companyType }),
        ...(d.linkedinUrl && { linkedinUrl: d.linkedinUrl }),
        ...(d.email       && { email:       d.email }),
      }))
      setScraped(true)

      const filled = [d.name, d.position, d.company].filter(Boolean).length
      if (filled === 0) {
        setToast({ message: 'URL scraped but name/role missing — fill manually', type: 'warn' })
      } else {
        setToast({ message: `✓ Got ${filled}/3 fields`, type: 'success' })
      }
    } catch (e) {
      setToast({
        message: e.message === 'not_linkedin'
          ? 'Go to a linkedin.com/in/ profile first'
          : e.message === 'content_script_not_ready'
          ? 'Refresh the LinkedIn page, then try again'
          : 'Scrape failed — see debug below',
        type: 'error',
      })
    } finally { setScraping(false) }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.linkedinUrl) {
      setToast({ message: 'Name & LinkedIn URL required', type: 'error' })
      return
    }
    setSaving(true)
    try {
      await createContact(form)
      setToast({ message: `✓ ${form.name} saved!`, type: 'success' })
      setForm(EMPTY); setScraped(false); setRawDebug(null)
      setTimeout(() => onNavigate('contacts'), 1200)
    } catch (e) {
      setToast({
        message: e.status === 409 ? 'Already tracking this person' : `Save failed — ${e.message || 'is backend running?'}`,
        type: 'error',
      })
    } finally { setSaving(false) }
  }

  return (
    <div className="fadeUp" style={{ display:'flex', flexDirection:'column', flex:1, height:0, position:'relative', overflow:'hidden' }}>
      <PageHeader tag="New Contact" title="Add from LinkedIn" />

      {/* Scrape bar */}
      <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {onLinkedIn ? (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <ScrapeButton scraping={scraping} scraped={scraped} onClick={handleScrape} />

            {/* Debug output — shows exactly what was scraped */}
            {rawDebug && (
              <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:'7px 10px' }}>
                <p style={{ fontFamily:F.mono, fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:5 }}>Scraper returned</p>
                {['name','position','company','email'].map(k => (
                  <div key={k} style={{ display:'flex', gap:8, marginBottom:3, alignItems:'center' }}>
                    <span style={{ fontFamily:F.mono, fontSize:9, color:C.muted, width:52, flexShrink:0 }}>{k}</span>
                    <span style={{ fontFamily:F.mono, fontSize:9, color: rawDebug[k] ? C.accent : C.red }}>
                      {rawDebug[k] || '✗ empty'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, padding:'9px 12px', fontFamily:F.mono, fontSize:10, color:C.muted, textAlign:'center' }}>
            Navigate to a <span style={{ color:C.accent }}>linkedin.com/in/</span> profile to auto-fill
          </div>
        )}
      </div>

      {/* Form */}
      <div className="scroll" style={{ flex:1, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto', minHeight:0 }}>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Input label="Name *"   name="name"     value={form.name}     onChange={onChange} placeholder="Jane Doe" />
          <Input label="Position" name="position" value={form.position} onChange={onChange} placeholder="Hiring Manager" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Input label="Company" name="company" value={form.company} onChange={onChange} placeholder="Acme Corp" />
          <Select label="Type" name="companyType" value={form.companyType} onChange={onChange}
            options={[{value:'startup',label:'Startup'},{value:'mnc',label:'MNC'},{value:'unknown',label:'Unknown'}]} />
        </div>

        <Input label="LinkedIn URL *" name="linkedinUrl" value={form.linkedinUrl} onChange={onChange} placeholder="https://linkedin.com/in/..." />
        <Input label="Email"          name="email"       value={form.email}       onChange={onChange} placeholder="founder@company.com" />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Select label="Priority" name="priority" value={form.priority} onChange={onChange}
            options={[{value:'high',label:'🔴 High'},{value:'mid',label:'🟡 Mid'},{value:'low',label:'⚪ Low'}]} />
          <Select label="Source" name="source" value={form.source} onChange={onChange}
            options={[{value:'wellfound',label:'Wellfound'},{value:'ycombinator',label:'YC'},{value:'linkedin',label:'LinkedIn'},{value:'other',label:'Other'}]} />
        </div>

        <Input label="Job Role" name="jobRole" value={form.jobRole} onChange={onChange} placeholder="SDE Intern / Full Stack Dev" />
        <Input label="Notes" name="notes" value={form.notes} onChange={onChange} placeholder="Anything useful..." as="textarea" rows={2} />

        <button onClick={handleSubmit} disabled={saving}
          style={{ ...S.btn.primary, opacity: saving ? 0.5 : 1, marginTop:2 }}>
          {saving ? 'Saving...' : '+ Save Contact'}
        </button>

      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}

function ScrapeButton({ scraping, scraped, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={scraping}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width:'100%', padding:'9px 14px',
        background: scraped ? 'rgba(0,229,160,0.08)' : hov ? 'rgba(0,229,160,0.12)' : 'rgba(0,229,160,0.06)',
        border:`1px solid ${scraped ? C.accent+'60' : hov ? C.accent : 'rgba(0,229,160,0.25)'}`,
        borderRadius:6, cursor: scraping ? 'default' : 'pointer',
        fontFamily:F.mono, fontSize:11, fontWeight:600, color:C.accent,
        transition:'all 0.15s', display:'flex', alignItems:'center',
        justifyContent:'center', gap:8, opacity: scraping ? 0.7 : 1,
      }}>
      <span style={{ fontSize: scraping ? 14 : 12 }}>{scraping ? '⟳' : scraped ? '✓' : '⬇'}</span>
      {scraping ? 'Scraping...' : scraped ? 'Re-scrape' : 'Auto-Fill from This Profile'}
    </button>
  )
}