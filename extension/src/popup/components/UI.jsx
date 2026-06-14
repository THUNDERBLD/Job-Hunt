import { useState, useEffect } from 'react'
import { C, F, S, STATUS_META, NEXT_STATUS } from '../../styles.js'

// ── Loader ────────────────────────────────────────────────────
export function Loader({ text = 'Loading...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:'40px 0' }}>
      <div className="spin" style={{ width:20, height:20, border:`2px solid ${C.border2}`, borderTop:`2px solid ${C.accent}`, borderRadius:'50%' }} />
      <span style={{ ...S.label, fontSize:10 }}>{text}</span>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const color = type === 'success' ? C.accent : type === 'error' ? C.red : C.yellow

  return (
    <div className="fadeUp" style={{
      position:'absolute', bottom:56, left:12, right:12, zIndex:99,
      background: C.surface2, border:`1px solid ${color}33`,
      borderLeft:`3px solid ${color}`,
      borderRadius:8, padding:'10px 12px',
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
    }}>
      <span style={{ fontFamily:F.mono, fontSize:11, color }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:14, lineHeight:1 }}>×</button>
    </div>
  )
}

// ── StatusBadge ───────────────────────────────────────────────
export function StatusBadge({ status, size = 'sm' }) {
  const meta  = STATUS_META[status] || { label: status, color: C.muted }
  const pad   = size === 'sm' ? '3px 8px' : '4px 10px'
  const fsize = size === 'sm' ? 9 : 10

  return (
    <span style={{
      fontFamily: F.mono, fontSize: fsize,
      color: meta.color,
      background: `${meta.color}15`,
      border: `1px solid ${meta.color}35`,
      borderRadius: 4,
      padding: pad,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  )
}

// ── NavBar ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', icon: '⊞', label: 'Home'     },
  { id: 'add',       icon: '⊕', label: 'Add'      },
  { id: 'contacts',  icon: '⊟', label: 'Contacts' },
  { id: 'generate',  icon: '◈', label: 'AI'       },
  { id: 'profile',   icon: '⊙', label: 'Profile'  },
]

export function NavBar({ current, onNavigate }) {
  const [hovered, setHovered] = useState(null)

  return (
    <nav style={{
      display:'flex', flexShrink:0,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      height: 54,
    }}>
      {NAV_ITEMS.map(({ id, icon, label }) => {
        const active = current === id
        const hover  = hovered === id
        return (
          <button key={id} onClick={() => onNavigate(id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              flex:1, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:3,
              background: 'none', border: 'none', cursor:'pointer',
              borderTop: `2px solid ${active ? C.accent : 'transparent'}`,
              marginTop: -1,
              transition: 'all 0.15s',
            }}>
            <span style={{
              fontSize: 16,
              color: active ? C.accent : hover ? C.textDim : C.muted,
              transition: 'color 0.15s',
            }}>{icon}</span>
            <span style={{
              fontFamily: F.mono, fontSize: 8.5,
              textTransform:'uppercase', letterSpacing:'0.8px',
              color: active ? C.accent : hover ? C.textDim : C.muted,
              transition: 'color 0.15s',
            }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ── PageHeader ────────────────────────────────────────────────
export function PageHeader({ tag, title, right }) {
  return (
    <div style={{
      padding:'14px 16px 12px',
      borderBottom:`1px solid ${C.border}`,
      flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <div>
        <p className="glow" style={{ fontFamily:F.mono, fontSize:9, color:C.accent, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:3 }}>{tag}</p>
        <p style={{ fontFamily:F.sans, fontSize:16, fontWeight:700, color:C.text }}>{title}</p>
      </div>
      {right}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  const isTextarea = props.as === 'textarea'
  const El = isTextarea ? 'textarea' : 'input'
  const { as, ...rest } = props

  return (
    <div>
      {label && <p style={{ ...S.label, marginBottom:5 }}>{label}</p>}
      <El {...rest}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e  => { setFocused(false); props.onBlur?.(e) }}
        style={{
          ...S.input,
          borderColor: focused ? C.accent : C.border,
          transition: 'border-color 0.15s',
          ...(props.style || {}),
        }}
      />
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, options, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && <p style={{ ...S.label, marginBottom:5 }}>{label}</p>}
      <select {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...S.input,
          borderColor: focused ? C.accent : C.border,
          transition: 'border-color 0.15s',
          appearance:'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E")`,
          backgroundRepeat:'no-repeat',
          backgroundPosition:'right 10px center',
          paddingRight:28,
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height:1, background:C.border, margin:'4px 0' }} />
}