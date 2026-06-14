import { C, F, S } from '../utils/styles.js'

export default function Sidebar({ user, activeTab, onSelectTab, onLogout }) {
  const isUnlimited = user?.plan === 'pro' || user?.hasCohereKey || user?.hasGeminiKey

  const menuItems = [
    { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
    { id: 'addContact', icon: '➕', label: 'Add Lead' },
    { id: 'contacts',   icon: '📇', label: 'Leads Table' },
    { id: 'aiOutreach', icon: '⚡', label: 'AI Generator' },
    { id: 'profile',    icon: '👤', label: 'Settings' },
  ]

  return (
    <aside style={{
      width: '260px',
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          fontFamily: F.mono,
          fontSize: 18,
          fontWeight: 800,
          color: C.accent,
          letterSpacing: '1px',
        }}>⊙ JobHunt.ai</span>
      </div>

      {/* Navigation items */}
      <nav style={{
        flex: 1,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {menuItems.map(item => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: 'none',
                background: active ? `${C.accent}12` : 'transparent',
                color: active ? C.accent : C.textDim,
                cursor: 'pointer',
                fontFamily: F.mono,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={e => {
                if (!active) {
                  e.currentTarget.style.background = `${C.border}50`
                  e.currentTarget.style.color = C.text
                }
              }}
              onMouseOut={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = C.textDim
                }
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div style={{
        padding: '16px 20px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}>
            <span style={{
              fontFamily: F.sans,
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '140px',
            }}>{user?.name}</span>
            
            <span style={{
              fontFamily: F.mono,
              fontSize: 8,
              fontWeight: 600,
              padding: '2px 5px',
              borderRadius: 4,
              border: `1px solid ${isUnlimited ? C.accent : C.yellow}40`,
              color: isUnlimited ? C.accent : C.yellow,
              background: isUnlimited ? `${C.accent}10` : `${C.yellow}10`,
              textTransform: 'uppercase',
            }}>
              {isUnlimited ? 'Unlimited' : 'Free'}
            </span>
          </div>
          <span style={{
            fontFamily: F.mono,
            fontSize: 9,
            color: C.muted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}>{user?.email}</span>
        </div>

        <button
          onClick={onLogout}
          style={{
            ...S.btn.danger,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 12px',
            fontSize: 10,
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,84,84,0.15)' }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,84,84,0.08)' }}
        >
          📴 Logout
        </button>
      </div>
    </aside>
  )
}
