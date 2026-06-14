export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin" />
      <span className="font-mono text-[10px] text-muted uppercase tracking-widest">{text}</span>
    </div>
  )
}