import { useState } from 'react'

export default function JobDescInput({ value, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const charCount = value.length

  return (
    <div className="space-y-1">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="label-mono">
          Job Description
          <span className="text-muted normal-case tracking-normal ml-1">(from Wellfound / YC)</span>
        </label>
        <div className="flex items-center gap-2">
          {charCount > 0 && (
            <span className="font-mono text-[9px] text-muted">{charCount} chars</span>
          )}
          {charCount > 0 && (
            <button
              onClick={() => onChange('')}
              className="font-mono text-[9px] text-muted hover:text-danger transition-colors"
            >
              ✕ Clear
            </button>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="font-mono text-[9px] text-muted hover:text-accent transition-colors"
          >
            {expanded ? '↑ Collapse' : '↓ Expand'}
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste the full job description here. The more context you give, the better the AI output will be..."
        rows={expanded ? 8 : 3}
        className="input-terminal transition-all duration-200"
      />

      {/* Helper hint */}
      {charCount === 0 && (
        <p className="font-mono text-[9px] text-muted/60 leading-relaxed">
          Tip: copy the entire JD including role, responsibilities, and tech stack.
        </p>
      )}

      {/* Filled indicator */}
      {charCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          <span className="font-mono text-[9px] text-accent">JD loaded — AI will use this context</span>
        </div>
      )}
    </div>
  )
}