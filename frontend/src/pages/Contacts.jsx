import { useEffect, useState } from 'react'
import { getContacts, updateContact, deleteContact } from '../utils/api.js'
import { C, F, S, STATUS_META, PRIORITY_COLOR } from '../utils/styles.js'

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search & Filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Edit Modal State
  const [editContact, setEditContact] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchLeads = async () => {
    try {
      const res = await getContacts()
      setContacts(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      await deleteContact(id)
      setContacts(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  const handleEditClick = (contact) => {
    setEditContact({ ...contact })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editContact.person?.trim()) {
      alert('Person name is required')
      return
    }
    setSaving(true)
    try {
      const updated = await updateContact(editContact._id, editContact)
      setContacts(prev => prev.map(c => c._id === editContact._id ? updated.data : c))
      setEditContact(null)
    } catch (err) {
      alert('Update failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredContacts = contacts.filter(c => {
    const query = search.toLowerCase()
    const matchSearch =
      String(c.person || '').toLowerCase().includes(query) ||
      String(c.companies || '').toLowerCase().includes(query) ||
      String(c.position || '').toLowerCase().includes(query)

    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter

    return matchSearch && matchStatus && matchPriority
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 15, background: C.bg }}>
        <span className="spin" style={{ width: 32, height: 32, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, borderRadius: '50%', display: 'inline-block' }} />
        <p style={{ fontFamily: F.mono, fontSize: 13, color: C.textDim }}>Loading lead entries...</p>
      </div>
    )
  }

  return (
    <div className="fadeUp" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Header & Stats summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Leads Tracker Table</h1>
          <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, marginTop: 4 }}>
            Showing {filteredContacts.length} of {contacts.length} total leads
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}35`, borderRadius: 8, padding: '12px 16px', color: C.red, fontFamily: F.mono, fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{
        ...S.card,
        padding: '12px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search by name, company, position..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...S.input, padding: '8px 12px', fontSize: 12 }}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ ...S.input, padding: '8px 12px', fontSize: 12, cursor: 'pointer', background: C.bg }}
          >
            <option value="all">🔍 All Stages</option>
            {Object.entries(STATUS_META).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{ ...S.input, padding: '8px 12px', fontSize: 12, cursor: 'pointer', background: C.bg }}
          >
            <option value="all">⚡ All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Mid">🟡 Mid Priority</option>
            <option value="Low">⚪ Low Priority</option>
          </select>
        </div>
      </div>

      {/* Table grid container */}
      <div style={{
        ...S.card,
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <th style={TH_STYLE}>PERSON</th>
                <th style={TH_STYLE}>POSITION & COMPANY</th>
                <th style={TH_STYLE}>OUTREACH CHANNEL</th>
                <th style={TH_STYLE}>STAGE</th>
                <th style={TH_STYLE}>PRIORITY</th>
                <th style={TH_STYLE}>LINKS</th>
                <th style={{ ...TH_STYLE, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((lead, idx) => {
                  const statusMeta = STATUS_META[lead.status] || { label: lead.status, color: C.muted }
                  const priorityCol = PRIORITY_COLOR[lead.priority] || C.muted
                  return (
                    <tr
                      key={lead._id}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: idx % 2 === 0 ? 'transparent' : `${C.surface2}20`,
                        transition: 'background 0.2s',
                      }}
                      className="table-row-hover"
                    >
                      {/* Person Name */}
                      <td style={TD_STYLE}>
                        <span style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.text }}>{lead.person}</span>
                      </td>

                      {/* Position & Company */}
                      <td style={TD_STYLE}>
                        <p style={{ margin: 0, fontFamily: F.mono, fontSize: 11, color: C.text }}>{lead.position || 'Unknown Role'}</p>
                        <p style={{ margin: '2px 0 0 0', fontFamily: F.sans, fontSize: 11, color: C.textDim }}>
                          {lead.companies || 'Unknown Company'}{' '}
                          {lead.startups === 'Yes' && (
                            <span style={{
                              fontFamily: F.mono, fontSize: 8, color: C.accent, background: `${C.accent}12`,
                              border: `1px solid ${C.accent}25`, padding: '1px 4px', borderRadius: 4, marginLeft: 5
                            }}>Startup</span>
                          )}
                        </p>
                      </td>

                      {/* Socials / Platform */}
                      <td style={TD_STYLE}>
                        <span style={{
                          fontFamily: F.mono, fontSize: 10,
                          color: lead.socials?.toLowerCase() === 'linkedin' ? C.blue : C.yellow
                        }}>{lead.socials || 'LinkedIn'}</span>
                      </td>

                      {/* Stage Badge */}
                      <td style={TD_STYLE}>
                        <span style={{
                          fontFamily: F.mono, fontSize: 10, padding: '3px 8px', borderRadius: 4,
                          border: `1px solid ${statusMeta.color}35`, color: statusMeta.color, background: `${statusMeta.color}08`,
                          whiteSpace: 'nowrap', display: 'inline-block'
                        }}>{statusMeta.label}</span>
                      </td>

                      {/* Priority */}
                      <td style={TD_STYLE}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: F.mono, fontSize: 10, color: C.text }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: priorityCol }} />
                          {lead.priority || 'Mid'}
                        </span>
                      </td>

                      {/* Links */}
                      <td style={TD_STYLE}>
                        {lead.links ? (
                          <a
                            href={lead.links}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontFamily: F.mono, fontSize: 10, color: C.accent, textDecoration: 'none' }}
                          >
                            🔗 PROFILE
                          </a>
                        ) : (
                          <span style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditClick(lead)}
                            style={{
                              background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 4,
                              color: C.text, cursor: 'pointer', fontFamily: F.mono, fontSize: 10, padding: '4px 8px',
                            }}
                          >Edit</button>
                          
                          <button
                            onClick={() => handleDelete(lead._id, lead.person)}
                            style={{
                              background: 'rgba(255,84,84,0.06)', border: `1px solid rgba(255,84,84,0.2)`, borderRadius: 4,
                              color: C.red, cursor: 'pointer', fontFamily: F.mono, fontSize: 10, padding: '4px 8px',
                            }}
                          >Delete</button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', fontFamily: F.mono, fontSize: 12, color: C.muted }}>
                    No matching lead tracker entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal Dialog */}
      {editContact && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyCenter: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20, boxSizing: 'border-box'
        }}>
          <div style={{
            ...S.card, width: '600px', maxHeight: '90vh', overflowY: 'auto',
            padding: '24px 30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: F.sans, fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>Edit Lead Details</h2>
              <button
                onClick={() => setEditContact(null)}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontFamily: F.mono, fontSize: 18 }}
              >✕</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Full Name</label>
                  <input
                    type="text"
                    value={editContact.person || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, person: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                  />
                </div>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Position / Job Title</label>
                  <input
                    type="text"
                    value={editContact.position || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, position: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Company Name</label>
                  <input
                    type="text"
                    value={editContact.companies || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, companies: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                  />
                </div>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Company Type</label>
                  <select
                    value={editContact.startups || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, startups: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11, background: C.bg }}
                  >
                    <option value="No">MNC / Corporate</option>
                    <option value="Yes">Startup</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Outreach Stage</label>
                  <select
                    value={editContact.status || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, status: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11, background: C.bg }}
                  >
                    {Object.entries(STATUS_META).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Priority</label>
                  <select
                    value={editContact.priority || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, priority: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11, background: C.bg }}
                  >
                    <option value="High">🔴 High</option>
                    <option value="Mid">🟡 Mid</option>
                    <option value="Low">⚪ Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Social Link (LinkedIn profile)</label>
                  <input
                    type="url"
                    value={editContact.links || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, links: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                  />
                </div>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Platform</label>
                  <input
                    type="text"
                    value={editContact.socials || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, socials: e.target.value }))}
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Email Address</label>
                  <input
                    type="email"
                    value={editContact.email || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@company.com"
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                  />
                </div>
                <div>
                  <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Referral Status</label>
                  <input
                    type="text"
                    value={editContact.referrals || ''}
                    onChange={e => setEditContact(prev => ({ ...prev, referrals: e.target.value }))}
                    placeholder="Asked / Not asked / Future"
                    style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ ...S.label, display: 'block', marginBottom: 4 }}>Notes & Conversation Log</label>
                <textarea
                  value={editContact.notes || ''}
                  onChange={e => setEditContact(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  style={{ ...S.input, padding: '8px 10px', fontSize: 11 }}
                />
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setEditContact(null)}
                  style={{ ...S.btn.ghost, padding: '8px 16px', fontSize: 11 }}
                >Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ ...S.btn.primary, width: 'auto', padding: '8px 20px', fontSize: 11 }}
                >
                  {saving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

const TH_STYLE = {
  fontFamily: F.mono,
  fontSize: 10,
  fontWeight: 700,
  color: C.muted,
  padding: '12px 16px',
  letterSpacing: '1px',
}

const TD_STYLE = {
  padding: '12px 16px',
  verticalAlign: 'middle',
}
