'use client'

import { useState } from 'react'
import { Sparkles, Sliders, AlignLeft, ChevronDown, ChevronUp, Mic2, Compass, Tag, DollarSign } from 'lucide-react'
import clsx from 'clsx'
import { Locale, translations } from '@/lib/translations'

interface PromptInputProps {
  value: string
  onChange: (v: string) => void
  lyrics: string
  onLyricsChange: (lyrics: string) => void
  priceTag: string
  onPriceTagChange: (price: string) => void
  mastering: boolean
  onMasteringChange: (enabled: boolean) => void
  voiceModel: string
  onVoiceModelChange: (model: string) => void
  locale: Locale
  disabled: boolean
}

export default function PromptInput({
  value,
  onChange,
  lyrics,
  onLyricsChange,
  priceTag,
  onPriceTagChange,
  mastering,
  onMasteringChange,
  voiceModel,
  onVoiceModelChange,
  locale,
  disabled,
}: PromptInputProps) {
  const t = translations[locale]
  const [showLyrics, setShowLyrics] = useState(false)
  const [showPricing, setShowPricing] = useState(true)

  // Curated Oriental & Global Presets with acoustic descriptions
  const ORIENTAL_PRESETS = [
    {
      id: 'levantine',
      label: t.presetLevantine,
      prompt: 'Modern Levantine Arabic pop, punchy dabke electronic percussion, buzuq lead, energetic rhythm, radio master',
      icon: '🌟',
    },
    {
      id: 'tarab',
      label: t.presetTarab,
      prompt: 'Deep emotional authentic Arabic Tarab, dramatic acoustic oud, cinematic string orchestra, soulful nay, vintage analog warmth',
      icon: '🎻',
    },
    {
      id: 'dabke',
      label: t.presetDabke,
      prompt: 'High-energy Iraqi Dabke Chobi, powerful driving mijwiz and tabla rhythm, explosive bass, vibrant dance festival energy',
      icon: '🥁',
    },
    {
      id: 'piano',
      label: t.presetPiano,
      prompt: 'Cinematic emotional piano ballad with lush orchestral strings, grand acoustic piano, ambient reverb, deeply expressive dynamics',
      icon: '🎹',
    },
    {
      id: 'lofi',
      label: t.presetLofi,
      prompt: 'Lo-Fi chill oriental hip-hop, vinyl crackle, mellow electric piano, warm sub-bass, relaxed melodic groove',
      icon: '☕',
    },
    {
      id: 'edm',
      label: t.presetEdm,
      prompt: 'Mainstage festival EDM with Arabic vocal hook, massive synth drops, driving 128 BPM four-on-the-floor beat',
      icon: '⚡',
    },
  ]

  const VOICE_MODELS = [
    { id: 'Squidward', label: 'Studio Soloist (خامة استوديو بوب)' },
    { id: 'SilkFemale', label: 'Silk Female Vocal (صوت نسائي مخملي)' },
    { id: 'ClassicTarab', label: 'Classic Arabic Singer (صوت طربي أصيل)' },
    { id: 'AutotuneTrap', label: 'Modern Urban Autotune (أوتوتيون حديث)' },
  ]

  const handlePresetSelect = (presetPrompt: string) => {
    if (disabled) return
    onChange(presetPrompt)
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl relative">
      {/* 1. Style & Preset Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-gold" />
            <label className="text-xs font-bold text-white/80 uppercase tracking-widest">
              {t.styleSectionTitle}
            </label>
          </div>
          <span className="text-xs text-white/30">{value.length} / 400 {t.charCount}</span>
        </div>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder={t.promptPlaceholder}
          className={clsx(
            'w-full bg-black/40 border rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/20',
            'resize-none transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold',
            disabled
              ? 'border-white/5 opacity-50 cursor-not-allowed'
              : 'border-white/10 hover:border-white/20'
          )}
        />

        {/* Presets Grid */}
        <div className="mt-3">
          <p className="text-xs text-gold/80 font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{t.presetsTitle}</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ORIENTAL_PRESETS.map((preset) => {
              const isSelected = value === preset.prompt
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.prompt)}
                  disabled={disabled}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-start transition-all',
                    'border backdrop-blur-sm',
                    isSelected
                      ? 'bg-gold/20 border-gold text-gold shadow-md shadow-gold/10'
                      : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-gold/40 hover:bg-gold/5 hover:text-white'
                  )}
                >
                  <span className="text-sm shrink-0">{preset.icon}</span>
                  <span className="truncate">{preset.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Lyrics Area (Feature 2) */}
      <div className="pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={() => setShowLyrics(!showLyrics)}
          className="w-full flex items-center justify-between text-start text-xs font-semibold text-white/70 hover:text-gold py-1 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-gold" />
            <span>{t.lyricsTitle}</span>
            {lyrics.trim() && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold font-bold">
                ✓
              </span>
            )}
          </div>
          {showLyrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLyrics && (
          <div className="mt-3 space-y-1.5 animate-in fade-in duration-200">
            <p className="text-xs text-white/40">{t.lyricsSubtitle}</p>
            <textarea
              value={lyrics}
              onChange={(e) => onLyricsChange(e.target.value)}
              disabled={disabled}
              rows={4}
              placeholder={t.lyricsPlaceholder}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
            />
          </div>
        )}
      </div>

      {/* 3. Track Pricing & Commercial License Box (كلمات وتفاصيل السعر الخاصة بي) */}
      <div className="pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={() => setShowPricing(!showPricing)}
          className="w-full flex items-center justify-between text-start text-xs font-semibold text-white/80 hover:text-gold py-1 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gold" />
            <span className="font-bold text-gold-light">{t.pricingTitle}</span>
            {priceTag.trim() && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold font-bold truncate max-w-[150px]">
                {priceTag}
              </span>
            )}
          </div>
          {showPricing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPricing && (
          <div className="mt-3 space-y-3 p-4 rounded-2xl bg-black/30 border border-gold/20 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">{t.pricingSubtitle}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30 font-bold">
                {t.priceTagLabel}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={priceTag}
                onChange={(e) => onPriceTagChange(e.target.value)}
                disabled={disabled}
                placeholder={t.pricingPlaceholder}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gold font-medium placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
              />
            </div>

            {/* Quick Price Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                t.pricingPreset1,
                t.pricingPreset2,
                t.pricingPreset3,
                t.pricingPreset4,
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPriceTagChange(p)}
                  disabled={disabled}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-gold/20 border border-white/10 hover:border-gold/40 text-white/70 hover:text-gold transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Studio Engine Controls: Mastering & Target Voice (Feature 7 & 5) */}
      <div className="pt-2 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Voice Character */}
        <div className="flex items-center justify-between gap-3 bg-black/30 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Mic2 className="w-4 h-4 text-gold" />
            <span>{t.voiceModelLabel}</span>
          </div>
          <select
            value={voiceModel}
            onChange={(e) => onVoiceModelChange(e.target.value)}
            disabled={disabled}
            className="bg-black/60 border border-white/10 text-gold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-gold"
          >
            {VOICE_MODELS.map((vm) => (
              <option key={vm.id} value={vm.id}>
                {vm.label}
              </option>
            ))}
          </select>
        </div>

        {/* AI Mastering Toggle (Feature 7) */}
        <div className="flex items-center justify-between gap-3 bg-black/30 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gold" />
            <div>
              <p className="text-xs font-bold text-white/90">{t.masteringToggle}</p>
              <p className="text-[10px] text-white/40">{t.masteringDesc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onMasteringChange(!mastering)}
            disabled={disabled}
            className={clsx(
              'w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0',
              mastering ? 'bg-gradient-to-r from-gold-dark to-gold' : 'bg-white/10'
            )}
          >
            <div
              className={clsx(
                'w-5 h-5 rounded-full bg-black shadow-md transition-transform',
                mastering ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
