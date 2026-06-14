import { useState, useEffect } from 'react'
import { getMe, logout, getStoredToken } from './utils/api.js'
import { C, F } from './utils/styles.js'

// Pages & Components
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddContact from './pages/AddContact.jsx'
import Contacts from './pages/Contacts.jsx'
import AiOutreach from './pages/AiOutreach.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nonAuthView, setNonAuthView] = useState('landing')
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await getMe()
        setUser(res.data)
      } catch (err) {
        console.error('Session expired or invalid:', err.message)
        logout()
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    setNonAuthView('landing')
    setActiveTab('dashboard')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        background: C.bg,
        gap: 15,
      }}>
        <span className="spin" style={{
          width: 36,
          height: 36,
          border: `4px solid ${C.border}`,
          borderTop: `4px solid ${C.accent}`,
          borderRadius: '50%',
          display: 'inline-block',
        }} />
        <p style={{ fontFamily: F.mono, fontSize: 13, color: C.textDim }}>Verifying session credentials...</p>
      </div>
    )
  }

  // If user is not authenticated, show Landing Page or Auth Page
  if (!user) {
    if (nonAuthView === 'landing') {
      return <Landing onGetStarted={() => setNonAuthView('auth')} />
    }
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh', background: C.bg }}>
        <button
          onClick={() => setNonAuthView('landing')}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'none',
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: C.textDim,
            fontFamily: F.mono,
            fontSize: 10,
            padding: '8px 12px',
            cursor: 'pointer',
            zIndex: 10,
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.color = C.text
            e.currentTarget.style.borderColor = C.accent
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = C.textDim
            e.currentTarget.style.borderColor = C.border
          }}
        >
          ← Back to Home
        </button>
        <Auth onAuthSuccess={(userData) => setUser(userData)} />
      </div>
    )
  }

  // Active Workspace Route Router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'addContact':
        return <AddContact onLeadAdded={() => setActiveTab('contacts')} />
      case 'contacts':
        return <Contacts />
      case 'aiOutreach':
        return <AiOutreach />
      case 'profile':
        return <Profile onUserUpdated={(userData) => setUser(userData)} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      background: C.bg,
      overflow: 'hidden',
    }}>
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <main style={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {renderActiveView()}
      </main>
    </div>
  )
}
