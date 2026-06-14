import { useState } from 'react'
import { login, register } from '../utils/api.js'
import { C, F, S } from '../utils/styles.js'

export default function Auth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(false)
    setLoading(true)
    try {
      let res
      if (isRegister) {
        res = await register(name.trim(), email.trim(), password)
      } else {
        res = await login(email.trim(), password)
      }
      if (res.token) {
        onAuthSuccess(res.user || res.data)
      } else {
        setError('Login failed — no token returned')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        ...S.card,
        width: '420px',
        padding: '30px 35px',
        boxSizing: 'border-box',
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 50px ${C.accent}05`,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: F.mono,
            fontSize: 22,
            fontWeight: 800,
            color: C.accent,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: 0,
          }}>⊙ JobHunt.ai</h1>
          <p style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: C.muted,
            marginTop: 6,
            textTransform: 'uppercase',
          }}>
            {isRegister ? 'Create your tracker account' : 'Sign in to your outreach tracker'}
          </p>
        </div>

        {error && (
          <div style={{
            background: `${C.red}12`,
            border: `1px solid ${C.red}30`,
            borderRadius: 6,
            padding: '10px 12px',
            color: C.red,
            fontFamily: F.mono,
            fontSize: 11,
            lineHeight: 1.4,
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: 5 }}>Full Name</label>
              <input
                type="text"
                disabled={loading}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Faraz Mohammad"
                style={S.input}
              />
            </div>
          )}

          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 5 }}>Email Address</label>
            <input
              type="email"
              disabled={loading}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              style={S.input}
            />
          </div>

          <div>
            <label style={{ ...S.label, display: 'block', marginBottom: 5 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                disabled={loading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...S.input, paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  cursor: 'pointer',
                  fontFamily: F.mono,
                  fontSize: 10,
                  outline: 'none',
                }}
              >
                {showPass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...S.btn.primary,
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="spin" style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(0,0,0,0.1)',
                  borderTop: '2px solid #000',
                  borderRadius: '50%',
                  display: 'inline-block',
                }} />
                Authenticating...
              </>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontFamily: F.mono,
          fontSize: 11,
          color: C.textDim,
          marginTop: 10,
        }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            style={{
              color: C.accent,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  )
}
