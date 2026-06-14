import { useState, useEffect } from 'react'
import { getContacts, exportContacts } from '../../utils/api.js'
import { Loader, PageHeader } from '../components/UI.jsx'
import { C, F, S } from '../../styles.js'

const PIPELINE = [
  { key:'connection_sent', label:'Req Sent',   color:'#4d9eff' },
  { key:'connected',       label:'Connected',  color:'#4d9eff' },
  { key:'messaged',        label:'Messaged',   color:'#ffc940' },
  { key:'replied',         label:'Replied',    color:'#00e5a0' },
  { key:'in_process',      label:'In Process', color:'#00e5a0' },
  { key:'rejected',        label:'Rejected',   color:'#ff5454' },
]

export default function Dashboard({ onNavigate }) {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContacts()
      .then(r => setStats(r.stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading..." />

  const total    = stats?.total || 0
  const high     = stats?.highPriority || 0
  const byStatus = stats?.byStatus || {}

  return (
    <div className="fadeUp" style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      <PageHeader tag="JobHunt" title="Dashboard"
        right={
          <button onClick={exportContacts} style={{
            ...S.btn.ghost, display:'flex', alignItems:'center', gap:5,
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor=C.accent; e.currentTarget.style.color=C.accent }}
            onMouseOut={e =>  { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textDim }}
          >
            <span style={{ fontSize:12 }}>↓</span> Export
          </button>
        }
      />

      <div className="scroll" style={{ flex:1, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>

        {/* Totals row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <StatBox label="Total Tracked" value={total} color={C.accent} glow />
          <StatBox label="High Priority"  value={high}  color={C.red} />
        </div>

        {/* Pipeline card */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'8px 14px 7px', borderBottom:`1px solid ${C.border}` }}>
            <p style={{ ...S.label }}>Pipeline</p>
          </div>
          {PIPELINE.map(({ key, label, color }) => {
            const count = byStatus[key] || 0
            const pct   = total > 0 ? Math.min(100, Math.round(count / total * 100)) : 0
            return (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 14px', borderBottom:`1px solid ${C.border}20` }}>
                <span style={{ fontFamily:F.mono, fontSize:10, color, width:76, flexShrink:0 }}>{label}</span>
                <div style={{ flex:1, height:3, background:C.border, borderRadius:99, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:99, transition:'width 0.6s ease' }} />
                </div>
                <span style={{ fontFamily:F.mono, fontSize:11, color:C.textDim, width:16, textAlign:'right' }}>{count}</span>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <QuickAction icon="+" label="Add Contact" sub="from LinkedIn" accent onClick={() => onNavigate('add')} />
          <QuickAction icon="◈" label="Generate"    sub="AI outreach"         onClick={() => onNavigate('generate')} />
        </div>

      </div>
    </div>
  )
}

function StatBox({ label, value, color, glow }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
      <p style={{ ...S.label, marginBottom:8 }}>{label}</p>
      <p className={glow ? 'glow' : ''} style={{ fontFamily:F.mono, fontSize:36, fontWeight:700, color, lineHeight:1 }}>{value}</p>
    </div>
  )
}

function QuickAction({ icon, label, sub, accent, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: accent ? (hov ? 'rgba(0,229,160,0.18)' : 'rgba(0,229,160,0.08)') : (hov ? C.surface2 : C.surface),
        border:`1px solid ${hov ? (accent ? C.accent : C.border2) : (accent ? 'rgba(0,229,160,0.25)' : C.border)}`,
        borderRadius:10, padding:'12px 14px', textAlign:'left', cursor:'pointer', transition:'all 0.15s', width:'100%',
      }}>
      <p style={{ fontFamily:F.mono, fontSize:20, color:C.accent, lineHeight:1, marginBottom:5 }}>{icon}</p>
      <p style={{ fontFamily:F.sans, fontSize:12, fontWeight:600, color:C.text }}>{label}</p>
      <p style={{ fontFamily:F.mono, fontSize:9, color:C.muted, marginTop:2 }}>{sub}</p>
    </button>
  )
}