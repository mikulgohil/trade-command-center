'use client'

import LivePill from './LivePill'
import SoundToggle from './SoundToggle'

interface TopBarProps {
  isExecutive: boolean
  onToggleExecutive: () => void
  onToggleSankey?: () => void
  showSankey?: boolean
  onToggleTimeScrubber?: () => void
  showTimeScrubber?: boolean
}

export default function TopBar({ isExecutive, onToggleExecutive, onToggleSankey, showSankey, onToggleTimeScrubber, showTimeScrubber }: TopBarProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-auto">
      <div className="flex items-center justify-between px-10 py-5">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <span className="text-[22px] font-bold tracking-tight text-text-primary">
            Globe Command
          </span>
          <span className="text-white/20 text-lg">|</span>
          <span className="text-[15px] font-medium text-text-secondary">
            Global Trade Command Center
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <LivePill />
          <SoundToggle />
          {onToggleSankey && (
            <button
              onClick={onToggleSankey}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200
                border hover:border-white/20
                hover:bg-white/[0.08]
                ${showSankey
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-60">
                <path d="M1 2h3c2 0 3 3 5 3h4" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M1 7h3c2 0 3 2 5 2h4" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M1 12h3c2 0 3-3 5-3h4" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
              Sankey
            </button>
          )}
          {onToggleTimeScrubber && (
            <button
              onClick={onToggleTimeScrubber}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200
                border hover:border-white/20
                hover:bg-white/[0.08]
                ${showTimeScrubber
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-60">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Timeline
            </button>
          )}
          <button
            onClick={onToggleExecutive}
            className="flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200
              border border-white/10 hover:border-white/20
              bg-white/[0.04] hover:bg-white/[0.08]
              text-text-secondary hover:text-text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-60">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1" y="8" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {isExecutive ? 'Full View' : 'Executive'}
          </button>
        </div>
      </div>
    </header>
  )
}
