// All design tokens in one place — no Tailwind needed
export const C = {
  bg:        '#0a0a0a',
  surface:   '#141414',
  surface2:  '#1a1a1a',
  border:    '#242424',
  border2:   '#2e2e2e',
  accent:    '#00e5a0',
  accentDim: 'rgba(0,229,160,0.12)',
  accentGlow:'rgba(0,229,160,0.35)',
  blue:      '#4d9eff',
  yellow:    '#ffc940',
  red:       '#ff5454',
  text:      '#f0f0f0',
  textDim:   '#888',
  textFaint: '#444',
  muted:     '#555',
}

export const F = {
  mono: "'JetBrains Mono', 'Courier New', monospace",
  sans: "'DM Sans', system-ui, sans-serif",
}

export const STATUS_META = {
  discovered:      { label: 'Discovered',      color: C.muted   },
  connection_sent: { label: 'Connection Sent', color: C.blue    },
  connected:       { label: 'Connected',       color: C.blue    },
  messaged:        { label: 'Messaged',        color: C.yellow  },
  email_sent:      { label: 'Email Sent',      color: C.yellow  },
  replied:         { label: 'Replied 🎉',      color: C.accent  },
  in_process:      { label: 'In Process',      color: C.accent  },
  rejected:        { label: 'Rejected',        color: C.red     },
  on_hold:         { label: 'On Hold',         color: C.muted   },
  NAN:             { label: 'No Stage',        color: C.textDim },
}

export const PRIORITY_COLOR = {
  High: C.red,
  Mid:  C.yellow,
  Low:  C.muted,
}

// Shared style helpers
export const S = {
  label: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
  },
  input: {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    fontFamily: F.mono,
    fontSize: 12,
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  btn: {
    primary: {
      background: C.accent,
      color: C.bg,
      border: 'none',
      borderRadius: 6,
      fontFamily: F.mono,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.5px',
      padding: '12px 18px',
      cursor: 'pointer',
      width: '100%',
      textTransform: 'uppercase',
      transition: 'opacity 0.2s ease',
    },
    ghost: {
      background: 'transparent',
      color: C.textDim,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      fontFamily: F.mono,
      fontSize: 11,
      padding: '9px 14px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'all 0.2s ease',
    },
    danger: {
      background: 'rgba(255,84,84,0.08)',
      color: C.red,
      border: `1px solid rgba(255,84,84,0.25)`,
      borderRadius: 6,
      fontFamily: F.mono,
      fontSize: 11,
      padding: '9px 14px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'all 0.2s ease',
    },
  },
}
