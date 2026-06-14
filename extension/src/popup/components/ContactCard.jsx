import { useState } from 'react'
import { C, F, S, PRIORITY_COLOR } from '../../styles.js'
import { StatusBadge } from './UI.jsx'

export default function ContactCard({ contact, onClick }) {
  const [hovered, setHovered] = useState(false)
  const priColor = PRIORITY_COLOR[contact.priority] || C.muted

  return (
    <button onClick={() => onClick(contact)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:'100%', textAlign:'left',
        background: hovered ? C.surface2 : C.surface,
        border: `1px solid ${hovered ? C.accent + '40' : C.border}`,
        borderRadius:8, padding:'10px 12px',
        cursor:'pointer', transition:'all 0.15s',
        display:'block',
      }}>

      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <div style={{ flex:1, minWidth:0, marginRight:8 }}>
          <p style={{ fontFamily:F.sans, fontSize:13, fontWeight:600, color: hovered ? C.accent : C.text, transition:'color 0.15s', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {contact.name}
          </p>
          <p style={{ fontFamily:F.mono, fontSize:10, color:C.textDim, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {contact.position}{contact.company ? ` · ${contact.company}` : ''}
          </p>
        </div>
        <span style={{ fontFamily:F.mono, fontSize:9, color:priColor, textTransform:'uppercase', letterSpacing:'0.5px', flexShrink:0, marginTop:2 }}>
          {contact.priority}
        </span>
      </div>

      {/* Bottom row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <StatusBadge status={contact.status} />
        {contact.email && (
          <span style={{ fontFamily:F.mono, fontSize:9, color:`${C.accent}80` }}>✉ email</span>
        )}
      </div>
    </button>
  )
}