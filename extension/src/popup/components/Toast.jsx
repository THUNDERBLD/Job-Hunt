import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const color =
    type === 'success' ? 'border-accent text-accent' :
    type === 'error'   ? 'border-danger text-danger'  :
                         'border-warn  text-warn'

  return (
    <div className={`absolute bottom-4 left-4 right-4 z-50 bg-surface border ${color} rounded px-4 py-2.5 font-mono text-[11px] animate-slide-up flex items-center justify-between gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-muted hover:text-textMain transition-colors">✕</button>
    </div>
  )
}