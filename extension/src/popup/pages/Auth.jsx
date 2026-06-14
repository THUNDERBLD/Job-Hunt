import { useState } from 'react'
import { login, register } from '../../utils/api.js'
import { Toast } from '../components/UI.jsx'
import { C, F, S } from '../../styles.js'

export default function Auth({ onAuth }) {
  const [mode,     setMode]     = useState('login') // 'login' | 'register'
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)
  const [showPwd,  setShowPwd]  = useState(false)

  const isRegister = mode === 'register'

  const handleSubmit = async () => {
    if (!email || !password) {
      setToast({ message: 'Email & password required', type: 'error' })
      return
    }
    if (isRegister && !name) {
      setToast({ message: 'Name is required', type: 'error' })
      return
    }
    if (password.length < 6) {
      setToast({ message: 'Password must be 6+ chars', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const data = isRegister
        ? await register(name.trim(), email.trim(), password)
        : await login(email.trim(), password)

      setToast({ message: isRegister ? '✓ Account created!' : '✓ Logged in!', type: 'success' })
      setTimeout(() => onAuth(data.data), 600)
    } catch (e) {
      const msg = e.message || 'Something went wrong'
      setToast({ message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="fadeUp" style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: C.bg, justifyContent: 'center', alignItems: 'center',
    }}>

      {/* Logo area */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p className="glow" style={{
          fontFamily: F.mono, fontSize: 28, fontWeight: 700,
          color: C.accent, lineHeight: 1, marginBottom: 6,
        }}>🎯</p>
        <p style={{
          fontFamily: F.sans, fontSize: 20, fontWeight: 700,
          color: C.text, letterSpacing: '-0.3px',
        }}>JobHunt</p>
        <p style={{
          fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 4,
        }}>Track outreach. Generate AI messages.</p>
      </div>

      {/* Form card */}
      <div style={{
        width: 320, background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 14,
      }}>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: C.bg,
          border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden',
        }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
              background: mode === m ? `${C.accent}15` : 'transparent',
              borderBottom: mode === m ? `2px solid ${C.accent}` : '2px solid transparent',
              fontFamily: F.mono, fontSize: 10, fontWeight: 600,
              color: mode === m ? C.accent : C.muted,
              textTransform: 'uppercase', letterSpacing: '1px',
              transition: 'all 0.15s',
            }}>{m}</button>
          ))}
        </div>

        {/* Name field (register only) */}
        {isRegister && (
          <div className="fadeUp">
            <label style={{ ...S.label, marginBottom: 5, display: 'block' }}>Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your full name"
              style={{ ...S.input }}
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label style={{ ...S.label, marginBottom: 5, display: 'block' }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="you@example.com"
            style={{ ...S.input }}
          />
        </div>

        {/* Password */}
        <div>
          <label style={{ ...S.label, marginBottom: 5, display: 'block' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Min 6 characters"
              style={{ ...S.input, paddingRight: 36 }}
            />
            <button onClick={() => setShowPwd(p => !p)} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: F.mono, fontSize: 9, color: C.muted,
            }}>{showPwd ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} style={{
          ...S.btn.primary,
          opacity: loading ? 0.5 : 1,
          marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {loading
            ? <><span className="spin" style={{ width: 12, height: 12, border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block' }} />{isRegister ? 'Creating...' : 'Logging in...'}</>
            : isRegister ? '→ Create Account' : '→ Log In'}
        </button>

        {/* Switch mode hint */}
        <p style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, textAlign: 'center' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setMode(isRegister ? 'login' : 'register')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: F.mono, fontSize: 10, color: C.accent,
            textDecoration: 'underline', padding: 0,
          }}>{isRegister ? 'Log in' : 'Sign up'}</button>
        </p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
