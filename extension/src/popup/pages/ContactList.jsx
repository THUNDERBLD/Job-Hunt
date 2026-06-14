import { useState, useEffect } from 'react'
import { getContacts, downloadImportTemplate, exportContacts } from '../../utils/api.js'
import { Loader, PageHeader, Toast } from '../components/UI.jsx'
import ContactCard from '../components/ContactCard.jsx'
import { C, F, S, STATUS_META } from '../../styles.js'

const FILTERS = ['all', ...Object.keys(STATUS_META)]

export default function ContactList({ onSelect }) {
  const [contacts, setContacts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('all')
  const [focused,  setFocused]  = useState(false)
  const [toast,    setToast]    = useState(null)

  const fetch = (s = status, q = search) => {
    setLoading(true)
    const p = {}
    if (s !== 'all') p.status = s
    if (q.trim())    p.search = q.trim()
    getContacts(p)
      .then(r => setContacts(r.data || []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [status])
  useEffect(() => { const t = setTimeout(() => fetch(status, search), 450); return () => clearTimeout(t) }, [search])

  return (
    <div className="fadeUp" style={{ display:'flex', flexDirection:'column', flex:1, height:0, overflow:'hidden' }}>

      <PageHeader
        tag="Tracker"
        title={`${contacts.length} Contacts`}
        right={
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={downloadImportTemplate} style={{ ...S.btn.ghost, padding:'7px 8px' }}>
              Template
            </button>
            <button onClick={exportContacts} style={{ ...S.btn.ghost, padding:'7px 8px' }}>
              Export
            </button>
          </div>
        }
      />

      {/* Search + filters */}
      <div style={{ padding:'10px 14px 8px', borderBottom:`1px solid ${C.border}`, flexShrink:0, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:C.muted, fontSize:12 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Search name, company..."
            style={{ ...S.input, paddingLeft:28, borderColor: focused ? C.accent : C.border, transition:'border-color 0.15s' }} />
        </div>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:2 }}>
          {FILTERS.map(f => {
            const active = f === status
            const meta   = STATUS_META[f]
            return (
              <button key={f} onClick={() => setStatus(f)} style={{
                flexShrink:0,
                fontFamily:F.mono, fontSize:9,
                textTransform:'uppercase', letterSpacing:'0.6px',
                padding:'4px 9px', borderRadius:4,
                border:`1px solid ${active ? (meta?.color || C.accent) : C.border}`,
                background: active ? `${(meta?.color || C.accent)}18` : 'transparent',
                color: active ? (meta?.color || C.accent) : C.muted,
                cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap',
              }}>
                {f === 'all' ? 'All' : STATUS_META[f]?.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="scroll" style={{ flex:1, padding:'8px 14px', display:'flex', flexDirection:'column', gap:6, overflowY:'auto', minHeight:0 }}>
        {loading ? (
          <Loader text="Fetching contacts..." />
        ) : contacts.length === 0 ? (
          <Empty hasFilters={search || status !== 'all'} />
        ) : (
          contacts.map(c => <ContactCard key={c._id} contact={c} onClick={onSelect} />)
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

    </div>
  )
}

function Empty({ hasFilters }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', gap:10 }}>
      <p style={{ fontSize:36, lineHeight:1 }}>⊘</p>
      <p style={{ fontFamily:F.mono, fontSize:11, color:C.muted, textAlign:'center', lineHeight:1.6 }}>
        {hasFilters ? 'No contacts match\nyour current filter' : 'No contacts yet.\nAdd your first one.'}
      </p>
    </div>
  )
}
