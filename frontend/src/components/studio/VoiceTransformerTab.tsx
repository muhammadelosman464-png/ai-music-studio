'use client'

import { useState, useRef } from 'react'
import { Mic2, Upload, Play, Pause, Download, Loader2, Sparkles, Check, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'
import { transformVoice, VoiceTransformResult } from '@/lib/api'
import { Locale, translations } from '@/lib/translations'

interface VoiceTransformerTabProps {
  locale: Locale
}

export default function VoiceTransformerTab({ locale }: VoiceTransformerTabProps) {
  const t = translations[locale]
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [targetVoice, setTargetVoice] = useState('Squidward')
  const [pitchChange, setPitchChange] = useState('no-change')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<VoiceTransformResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const VOICE_OPTIONS = [
    { id: 'Squidward', name: 'Studio Soloist (خامة استوديو بوب)' },
    { id: 'SilkFemale', name: 'Silk Female Vocal (صوت نسائي مخملي)' },
    { id: 'ClassicTarab', name: 'Classic Arabic Singer (طرب كلاسيكي أصيل)' },
    { id: 'AutotuneTrap', name: 'Modern Urban Autotune (أوتوتيون تراب)' },
  ]

  const PITCH_OPTIONS = [
    { id: 'no-change', name: 'Original Pitch (الطبقة الأصلية)' },
    { id: 'male-to-female', name: 'Male to Female (+12 st)' },
    { id: 'female-to-male', name: 'Female to Male (-12 st)' },
    { id: '+12', name: 'Octave Up (+12 st)' },
    { id: '-12', name: 'Octave Down (-12 st)' },
  ]

  const handleTransform = async () => {
    if (!audioFile) return
    setIsProcessing(true)
    setError(null)

    try {
      const res = await transformVoice(audioFile, targetVoice, pitchChange)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice conversion failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest">
          <Mic2 className="w-4 h-4 text-gold" />
          <span>RVC AI Voice Studio</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
          {t.voiceTabTitle}
        </h2>
        <p className="text-sm text-white/50 max-w-xl mx-auto">{t.voiceTabSubtitle}</p>
      </div>

      {/* Main Settings Card */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a"
          onChange={(e) => e.target.files?.[0] && setAudioFile(e.target.files[0])}
          className="hidden"
        />

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="py-10 px-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-gold/50 bg-black/30 hover:bg-black/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">
              {audioFile ? audioFile.name : t.voiceUploadPrompt}
            </p>
            <p className="text-xs text-white/40">Raw Acapella, Singing, or Speech (.wav, .mp3, .m4a)</p>
          </div>
          {audioFile && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" /> Vocal Track Ready
            </span>
          )}
        </div>

        {/* Voice & Pitch Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
              {t.targetVoiceLabel}
            </label>
            <select
              value={targetVoice}
              onChange={(e) => setTargetVoice(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-gold focus:outline-none focus:border-gold"
            >
              {VOICE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider block">
              {t.pitchLabel}
            </label>
            <select
              value={pitchChange}
              onChange={(e) => setPitchChange(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
            >
              {PITCH_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleTransform}
          disabled={!audioFile || isProcessing}
          className={clsx(
            'w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl',
            !audioFile || isProcessing
              ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black hover:scale-[1.01] active:scale-[0.99] shadow-gold/20'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t.transformingWait}</span>
            </>
          ) : (
            <span>{t.transformButton}</span>
          )}
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="backdrop-blur-2xl bg-white/[0.04] border border-gold/30 rounded-3xl p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold text-white">Transformed Studio Vocal</h3>
              <p className="text-xs text-white/40">Model: {result.target_voice} • Pitch: {result.pitch_change}</p>
            </div>
            <a
              href={result.transformed_url}
              download="transformed_vocal.mp3"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-xs shadow-lg shadow-gold/20 hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.download}</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-gold/30 space-y-3">
            <audio src={result.transformed_url} controls className="w-full h-11 rounded-xl bg-white/5" />
          </div>
        </div>
      )}
    </div>
  )
}
