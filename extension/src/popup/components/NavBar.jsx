const NAV = [
  { id: 'dashboard',  icon: '▦', label: 'Home'    },
  { id: 'add',        icon: '+', label: 'Add'     },
  { id: 'contacts',   icon: '≡', label: 'Contacts'},
  { id: 'generate',   icon: '✦', label: 'AI'      },
]

export default function NavBar({ current, onNavigate }) {
  return (
    <nav className="flex items-stretch border-t border-border bg-surface">
      {NAV.map(({ id, icon, label }) => {
        const active = current === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-150
              ${active
                ? 'text-accent border-t-2 border-accent -mt-px'
                : 'text-muted hover:text-textDim border-t-2 border-transparent -mt-px'
              }`}
          >
            <span className="font-mono text-[14px] leading-none">{icon}</span>
            <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}