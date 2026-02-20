'use client'

export default function LivePill() {
  return (
    <div className="flex items-center gap-2 rounded-full px-4 py-1.5 bg-accent-cyan/10 border border-accent-cyan/25">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
      </span>
      <span className="text-xs font-semibold tracking-wider text-accent-cyan">LIVE</span>
    </div>
  )
}
