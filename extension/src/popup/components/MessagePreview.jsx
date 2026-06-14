import { useState } from 'react'

const CHAR_LIMITS = {
  linkedin: 200,
  message:  null,
  email:    null,
}

export default function MessagePreview({ result, type, onRegenerate, loading }) {
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedBody,    setCopiedBody]    = useState(false)
  const [copiedAll,     setCopiedAll]     = useState(false)

  if (!result && !loading) return null

  const copy = async (text, setter) => {
    await navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const copyAll = () => {
    const full = result.subject
      ? `Subject: ${result.subject}\n\n${result.content}`
      : result.content
    copy(full, setCopiedAll)
  }

  const charLimit = CHAR_LIMITS[type]
  const bodyLen   = result?.content?.length || 0
  const overLimit = charLimit && bodyLen > charLimit

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-3 space-y-2 animate-pulse">
        <div className="h-2 bg-border rounded w-1/3" />
        <div className="h-2 bg-border rounded w-full" />
        <div className="h-2 bg-border rounded w-5/6" />
        <div className="h-2 bg-border rounded w-4/6" />
        <p className="font-mono text-[10px] text-muted text-center pt-1">Asking Gemini...</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-accent/25 rounded-lg overflow-hidden animate-slide-up">

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-accent/5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] text-accent uppercase tracking-wider">
            {type === 'linkedin' ? 'Connection Note'
            : type === 'message'  ? 'LinkedIn DM'
            :                       'Cold Email'}
          </span>
        </div>
        <button
          onClick={copyAll}
          className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-all
            ${copiedAll
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border text-muted hover:border-accent/40 hover:text-textDim'
            }`}
        >
          {copiedAll ? '✓ Copied All' : 'Copy All'}
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Subject line — email only */}
        {result.subject && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="label-mono">Subject Line</span>
              <button
                onClick={() => copy(result.subject, setCopiedSubject)}
                className={`font-mono text-[9px] transition-colors
                  ${copiedSubject ? 'text-accent' : 'text-muted hover:text-textDim'}`}
              >
                {copiedSubject ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="font-mono text-[11px] text-accent bg-bg border border-border/60 rounded px-2.5 py-2 leading-relaxed">
              {result.subject}
            </p>
          </div>
        )}

        {/* Message / Email body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="label-mono">
              {result.subject ? 'Body' : type === 'linkedin' ? 'Note' : 'Message'}
            </span>
            <div className="flex items-center gap-2">
              {/* Char count for LinkedIn */}
              {charLimit && (
                <span className={`font-mono text-[9px] ${overLimit ? 'text-danger' : 'text-muted'}`}>
                  {bodyLen}/{charLimit}
                  {overLimit && ' ⚠'}
                </span>
              )}
              <button
                onClick={() => copy(result.content, setCopiedBody)}
                className={`font-mono text-[9px] transition-colors
                  ${copiedBody ? 'text-accent' : 'text-muted hover:text-textDim'}`}
              >
                {copiedBody ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="font-mono text-[11px] text-textDim bg-bg border border-border/60 rounded px-2.5 py-2 leading-relaxed whitespace-pre-wrap">
            {result.content}
          </p>
          {overLimit && (
            <p className="font-mono text-[9px] text-danger mt-1">
              Over LinkedIn's 200 char limit — try regenerating for a shorter version.
            </p>
          )}
        </div>

        {/* Regenerate */}
        <button
          onClick={onRegenerate}
          className="w-full border border-border hover:border-accent/30 text-muted hover:text-textDim font-mono text-[10px] uppercase tracking-wider py-2 rounded transition-all flex items-center justify-center gap-1.5"
        >
          ↺ Regenerate
        </button>
      </div>
    </div>
  )
}