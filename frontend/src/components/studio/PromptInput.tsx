'use client'

import clsx from 'clsx'

interface PromptInputProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

const STYLE_PILLS = [
  'Arabic Pop',
  'Lo-Fi Hip-Hop',
  'Cinematic Orchestra',
  'Dark Trap',
  'Jazz Ballad',
  'EDM Festival',
]

export default function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  const handlePillClick = (style: string) => {
    if (disabled) return
    // If textarea is empty or ends with space, just set; else append
    if (!value.trim()) {
      onChange(style)
    } else {
      // Replace entire content with pill if nothing typed yet, else append style
      onChange(value.trimEnd() + ' — ' + style)
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-4">
      <div>
        <label className="text-sm font-semibold text-white/70 uppercase tracking-widest block mb-3">
          Describe Your Style
        </label>
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Describe your music style... (e.g. 'Cinematic Arabic Pop with orchestral strings')"
            className={clsx(
              'w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-white placeholder-white/25',
              'resize-none transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold/60',
              disabled
                ? 'border-white/5 opacity-50 cursor-not-allowed'
                : 'border-white/10 hover:border-white/20',
            )}
          />
          {/* Character count */}
          <span className="absolute bottom-3 right-3 text-xs text-white/20">
            {value.length}/300
          </span>
        </div>
      </div>

      {/* Quick-pick style pills */}
      <div className="space-y-2">
        <p className="text-xs text-white/30 uppercase tracking-wider">Quick picks</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_PILLS.map((style) => (
            <button
              key={style}
              onClick={() => handlePillClick(style)}
              disabled={disabled}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                'border',
                disabled
                  ? 'border-white/5 text-white/20 cursor-not-allowed'
                  : value.includes(style)
                    ? 'border-gold/60 bg-gold/10 text-gold hover:bg-gold/20'
                    : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-gold/40 hover:bg-gold/5 hover:text-gold/80',
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
