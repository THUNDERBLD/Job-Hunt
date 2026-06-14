import { useEffect, useState } from 'react'
import {
  getDashboardStats,
  getExcelTemplateBlob,
  getExportExcelBlob,
  uploadExcelTracker
} from '../utils/api.js'
import { C, F, S, STATUS_META } from '../utils/styles.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats()
      setStats(res.data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleDownloadTemplate = async () => {
    try {
      const blob = await getExcelTemplateBlob()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'jobhunt-tracker-template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      alert('Failed to download Excel template: ' + err.message)
    }
  }

  const handleExportData = async () => {
    try {
      const blob = await getExportExcelBlob()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'jobhunt-contacts-export.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      alert('Failed to export leads: ' + err.message)
    }
  }

  const handleUploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadExcelTracker(file)
      alert(res.message || 'Import successful!')
      fetchStats()
    } catch (err) {
      alert('Import failed: ' + err.message)
    } finally {
      setUploading(false)
      // reset file input
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 15, background: C.bg }}>
        <span className="spin" style={{ width: 32, height: 32, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, borderRadius: '50%', display: 'inline-block' }} />
        <p style={{ fontFamily: F.mono, fontSize: 13, color: C.textDim }}>Fetching tracker metrics...</p>
      </div>
    )
  }

  const { overview, charts, referrals, recentContacts } = stats || {}
  const totalLeads = overview?.total || 0

  // Colors for different charts
  const statusColors = {
    discovered: C.muted,
    connection_sent: C.blue,
    connected: C.blue,
    messaged: C.yellow,
    email_sent: C.yellow,
    replied: C.accent,
    in_process: C.accent,
    rejected: C.red,
    on_hold: C.muted,
    NAN: C.textDim,
  }

  return (
    <div className="fadeUp" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Banner Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Analytics Dashboard</h1>
          <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, marginTop: 4 }}>Monitor your application conversion rates and outreach channels</p>
        </div>
        
        {/* Excel Control Panel */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadTemplate}
            style={{ ...S.btn.ghost, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
          >
            📥 Template
          </button>
          
          <button
            onClick={handleExportData}
            style={{ ...S.btn.ghost, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
          >
            📤 Export Excel
          </button>
          
          <label style={{
            ...S.btn.primary,
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            margin: 0,
            padding: '9px 16px',
            borderRadius: 6,
          }}>
            {uploading ? '⌛ Importing...' : '⚡ Import Excel'}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleUploadFile}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {error && (
        <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}35`, borderRadius: 8, padding: '12px 16px', color: C.red, fontFamily: F.mono, fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <MetricCard label="Total Leads" value={totalLeads} desc="Added in tracker" border={C.border} />
        <MetricCard label="Messaged" value={overview?.messaged || 0} desc="LinkedIn Outreach" border={C.yellow} />
        <MetricCard label="Emails Sent" value={overview?.sentMails || 0} desc="Cold email outreach" border={C.blue} />
        <MetricCard label="Replies" value={overview?.replied || 0} desc={`Response rate: ${overview?.replyRate || '0%'}`} border={C.accent} />
        <MetricCard label="In-Process" value={overview?.inProcess || 0} desc="Active loops/Interviews" border={C.accent} />
      </div>

      {/* Grid: Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1.5fr))', gap: 20 }}>
        
        {/* Leads by Status Card */}
        <div style={{ ...S.card, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Leads by Stage</h3>
          {charts?.byStatus?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Stacked Percentage Bar */}
              <div style={{ height: 12, background: C.border2, borderRadius: 99, display: 'flex', overflow: 'hidden' }}>
                {charts.byStatus.map((item, idx) => {
                  const pct = totalLeads ? (item.value / totalLeads) * 100 : 0
                  return pct > 0 ? (
                    <div
                      key={idx}
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: statusColors[item.name] || C.muted,
                        transition: 'width 0.4s ease',
                      }}
                      title={`${item.name}: ${item.value} (${Math.round(pct)}%)`}
                    />
                  ) : null
                })}
              </div>
              
              {/* Legends list with detailed metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginTop: 8 }}>
                {charts.byStatus.map((item, idx) => {
                  const pct = totalLeads ? Math.round((item.value / totalLeads) * 100) : 0
                  const meta = STATUS_META[item.name] || { label: item.name, color: C.muted }
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderRadius: 4, border: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
                        <span style={{ fontFamily: F.sans, fontSize: 12, color: C.text }}>{meta.label}</span>
                      </div>
                      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim }}>{item.value} <span style={{ fontSize: 9, color: C.muted }}>({pct}%)</span></span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, margin: 0 }}>No leads tracked yet to populate graph data.</p>
          )}
        </div>

        {/* Channels & Priority Card */}
        <div style={{ ...S.card, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Priority allocation */}
          <div>
            <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>Leads by Priority</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['High', 'Mid', 'Low'].map(p => {
                const item = charts?.byPriority?.find(c => c.name.toLowerCase() === p.toLowerCase()) || { value: 0 }
                const pct = totalLeads ? Math.round((item.value / totalLeads) * 100) : 0
                const col = p === 'High' ? C.red : p === 'Mid' ? C.yellow : C.muted
                return (
                  <div key={p}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontFamily: F.mono, fontSize: 10 }}>
                      <span style={{ color: col, fontWeight: 600 }}>{p} Priority</span>
                      <span style={{ color: C.textDim }}>{item.value} leads ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 99 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Social Platforms */}
          <div>
            <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>Outreach Platforms</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {charts?.bySocials?.map((item, idx) => {
                const pct = totalLeads ? Math.round((item.value / totalLeads) * 100) : 0
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontFamily: F.mono, fontSize: 10 }}>
                      <span style={{ color: C.text }}>{item.name}</span>
                      <span style={{ color: C.textDim }}>{item.value} contacts ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: C.accent, borderRadius: 99 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Row: Target Companies & Referrals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1.5fr))', gap: 20 }}>
        
        {/* Top Companies */}
        <div style={{ ...S.card, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Top Targeted Companies</h3>
          {charts?.topCompanies?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {charts.topCompanies.map((comp, idx) => {
                const maxVal = charts.topCompanies[0]?.value || 1
                const barPct = Math.round((comp.value / maxVal) * 100)
                const priorityBadgeColor = comp.priority === 'High' ? C.red : comp.priority === 'Mid' ? C.yellow : C.muted
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: '120px', fontFamily: F.sans, fontSize: 12, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {comp.name}
                    </div>
                    <div style={{ flex: 1, height: 16, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: `${barPct}%`, height: '100%', background: `${C.accent}25`, borderRight: `2px solid ${C.accent}` }} />
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontFamily: F.mono, fontSize: 9, color: C.textDim }}>
                        {comp.value} lead{comp.value > 1 ? 's' : ''}
                      </span>
                    </div>
                    {comp.priority && (
                      <span style={{
                        fontFamily: F.mono, fontSize: 8, padding: '2px 6px', borderRadius: 4,
                        border: `1px solid ${priorityBadgeColor}35`, color: priorityBadgeColor, background: `${priorityBadgeColor}10`
                      }}>{comp.priority}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, margin: 0 }}>No targeted companies found yet.</p>
          )}
        </div>

        {/* Referral Statuses & Recent Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Referrals */}
          <div style={{ ...S.card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Referral Engagement</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <ReferralBox label="Asked" count={referrals?.asked || 0} color={C.accent} />
              <ReferralBox label="Not Asked" count={referrals?.notAsked || 0} color={C.yellow} />
              <ReferralBox label="Ask in Future" count={referrals?.askInFuture || 0} color={C.blue} />
            </div>
          </div>

          {/* Recent Contacts */}
          <div style={{ ...S.card, padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Recent Leads Added</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentContacts?.length > 0 ? (
                recentContacts.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < recentContacts.length - 1 ? `1px solid ${C.border}` : 'none', paddingBottom: 6 }}>
                    <div>
                      <p style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{c.person}</p>
                      <p style={{ fontFamily: F.mono, fontSize: 9, color: C.textDim, margin: '2px 0 0 0' }}>{c.position} @ {c.companies}</p>
                    </div>
                    <span style={{
                      fontFamily: F.mono, fontSize: 8, padding: '2px 6px', borderRadius: 4,
                      border: `1px solid ${STATUS_META[c.status]?.color || C.muted}40`,
                      color: STATUS_META[c.status]?.color || C.muted,
                      background: `${STATUS_META[c.status]?.color || C.muted}10`
                    }}>{STATUS_META[c.status]?.label || c.status}</span>
                  </div>
                ))
              ) : (
                <p style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, margin: 0 }}>No contacts recorded yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

function MetricCard({ label, value, desc, border }) {
  return (
    <div style={{
      ...S.card,
      padding: '16px 18px',
      borderLeft: `3px solid ${border}`,
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    }}>
      <p style={{ ...S.label, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 700, color: C.text, margin: '6px 0 4px 0' }}>{value}</p>
      <p style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, margin: 0 }}>{desc}</p>
    </div>
  )
}

function ReferralBox({ label, count, color }) {
  return (
    <div style={{
      flex: 1,
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: '10px 8px',
      textAlign: 'center',
    }}>
      <p style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 700, color, margin: 0 }}>{count}</p>
      <p style={{ fontFamily: F.mono, fontSize: 9, color: C.textDim, marginTop: 4, textTransform: 'uppercase', margin: 0 }}>{label}</p>
    </div>
  )
}
