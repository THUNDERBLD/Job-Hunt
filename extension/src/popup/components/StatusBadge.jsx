import { STATUS_LABELS, STATUS_COLORS } from '../../utils/linkedin.js'

export default function StatusBadge({ status, size = 'sm' }) {
  const label  = STATUS_LABELS[status] || status
  const colors = STATUS_COLORS[status] || 'text-textDim border-border'
  const pad    = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'

  return (
    <span className={`inline-block border rounded font-mono ${pad} ${colors}`}>
      {label}
    </span>
  )
}