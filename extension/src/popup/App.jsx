import { useState, useEffect } from 'react'
import { isLoggedIn, getMe }  from '../utils/api.js'
import { NavBar }              from './components/UI.jsx'
import { Loader }              from './components/UI.jsx'
import Auth                    from './pages/Auth.jsx'
import Dashboard               from './pages/Dashboard.jsx'
import AddContact              from './pages/AddContact.jsx'
import ContactList             from './pages/ContactList.jsx'
import ContactDetail           from './pages/ContactDetail.jsx'
import Generate                from './pages/Generate.jsx'
import Profile                 from './pages/Profile.jsx'
import { C }                   from '../styles.js'

export default function App() {
  const [authState, setAuthState] = useState('checking') // 'checking' | 'logged_out' | 'logged_in'
  const [user,      setUser]      = useState(null)
  const [page,      setPage]      = useState('dashboard')
  const [contact,   setContact]   = useState(null)
  const [genCtx,    setGenCtx]    = useState(null)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setAuthState('checking')
    const hasToken = await isLoggedIn()
    if (!hasToken) {
      setAuthState('logged_out')
      return
    }
    try {
      const r = await getMe()
      setUser(r.data)
      setAuthState('logged_in')
    } catch {
      // Token invalid or expired
      setAuthState('logged_out')
    }
  }

  const handleAuth = (userData) => {
    setUser(userData)
    setAuthState('logged_in')
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setAuthState('logged_out')
    setPage('dashboard')
  }

  const go = (dest) => {
    setPage(dest)
    if (dest !== 'detail')   setContact(null)
    if (dest !== 'generate') setGenCtx(null)
  }

  const openDetail = (c) => { setContact(c); setPage('detail') }
  const openGen    = (c) => { setGenCtx(c);  setPage('generate') }

  // Loading state
  if (authState === 'checking') {
    return (
      <div style={{ width: 420, height: 580, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Checking auth..." />
      </div>
    )
  }

  // Not logged in → show auth page
  if (authState === 'logged_out') {
    return (
      <div style={{ width: 420, height: 580, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
        <Auth onAuth={handleAuth} />
      </div>
    )
  }

  // Logged in → normal app
  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={go} />
      case 'add':       return <AddContact onNavigate={go} />
      case 'contacts':  return <ContactList onSelect={openDetail} />
      case 'detail':    return contact ? <ContactDetail contact={contact} onBack={() => go('contacts')} onNavigateGenerate={openGen} /> : null
      case 'generate':  return <Generate preselectedContact={genCtx} />
      case 'profile':   return <Profile user={user} onLogout={handleLogout} />
      default:          return <Dashboard onNavigate={go} />
    }
  }

  return (
    <div style={{ width: 420, height: 580, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderPage()}
      </div>
      {page !== 'detail' && <NavBar current={page} onNavigate={go} />}
    </div>
  )
}