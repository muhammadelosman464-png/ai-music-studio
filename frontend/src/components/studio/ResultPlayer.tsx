'use client'

import { useRef, useState, useEffect } from 'react'
import {
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Disc3,
  Layers,
  Sparkles,
  Archive,
  Music,
} from 'lucide-react'
import clsx from 'clsx'
import { TrackResult, downloadStemsAsZip } from '@/lib/api'
import { Locale, translations } from '@/lib/translations'

interface ResultPlayerProps {
  result: TrackResult
  locale: Locale
}

interface StemChannel {
  id: string
  name: string
  url: string
  icon: string
  color: string
}

export default function ResultPlayer({ result, locale }: ResultPlayerProps) {
  const t = translations[locale]
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isZipping, setIsZipping] = useState(false)

  // Track channels
  const channels: StemChannel[] = [
    { id: 'full', name: t.trackFull, url: result.full_track_url, icon: '🏆', color: 'from-amber-400 to-yellow-500' },
    { id: 'vocals', name: t.trackVocals, url: result.vocals_url, icon: '🎤', color: 'from-emerald-400 to-teal-500' },
    { id: 'instrumental', name: t.trackInstrumental, url: result.instrumental_url, icon: '🎸', color: 'from-blue-400 to-indigo-500' },
  ]

  if (result.drums_url) {
    channels.push({ id: 'drums', name: t.trackDrums, url: result.drums_url, icon: '🥁', color: 'from-red-400 to-rose-500' })
  }
  if (result.bass_url) {
    channels.push({ id: 'bass', name: t.trackBass, url: result.bass_url, icon: '🔊', color: 'from-purple-400 to-fuchsia-500' })
  }

  // Channel audio elements and mute/solo state
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})
  const [mutes, setMutes] = useState<{ [key: string]: boolean }>({})
  const [solos, setSolos] = useState<{ [key: string]: boolean }>({})

  const hasAnySolo = Object.values(solos).some(Boolean)

  // Sync master play/pause
  const toggleMasterPlay = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((a) => a?.pause())
      setIsPlaying(false)
    } else {
      Object.values(audioRefs.current).forEach((a) => {
        if (a) {
          a.currentTime = currentTime
          a.play().catch(() => {})
        }
      })
      setIsPlaying(true)
    }
  }

  // Update volume & muting based on Mute and Solo states
  useEffect(() => {
    channels.forEach((ch) => {
      const el = audioRefs.current[ch.id]
      if (!el) return

      if (hasAnySolo) {
        // If any channel is soloed, only soloed non-muted channels play
        el.muted = !solos[ch.id] || !!mutes[ch.id]
      } else {
        // Otherwise mute normally
        el.muted = !!mutes[ch.id]
      }
    })
  }, [mutes, solos, hasAnySolo, channels])

  const toggleMute = (id: string) => {
    setMutes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSolo = (id: string) => {
    setSolos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime)
    Object.values(audioRefs.current).forEach((a) => {
      if (a) a.currentTime = newTime
    })
  }

  const formatTime = (secs: number) => {
    if (!isFinite(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleDownloadAllZip = async () => {
    setIsZipping(true)
    try {
      await downloadStemsAsZip(
        {
          vocals: result.vocals_url,
          instrumental: result.instrumental_url,
          drums: result.drums_url,
          bass: result.bass_url,
        },
        result.prompt?.slice(0, 20) || 'ai_studio_track'
      )
    } catch (err) {
      console.error('ZIP export failed:', err)
    } finally {
      setIsZipping(false)
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="backdrop-blur-2xl bg-white/[0.04] border border-gold/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient gold flare */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.multitrackTitle}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
            {result.prompt || t.brandTitle}
          </h2>
          <p className="text-xs text-white/50 mt-1">{t.multitrackSubtitle}</p>
        </div>

        {/* Acoustic Badges & ZIP Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {result.price_tag && (
            <div className="px-3 py-1.5 rounded-xl bg-gold/15 border border-gold/40 text-xs text-gold font-bold flex items-center gap-1.5 shadow-md shadow-gold/10">
              <span>🏷️</span>
              <span>{result.price_tag}</span>
            </div>
          )}

          {result.bpm && (
            <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white/80 flex items-center gap-1.5 font-mono">
              <Disc3 className="w-3.5 h-3.5 text-gold animate-spin-slow" />
              <span>{result.bpm} BPM</span>
            </div>
          )}

          {result.musical_key && (
            <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-gold/90 font-medium">
              🎵 {result.musical_key}
            </div>
          )}

          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-xs shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Archive className="w-4 h-4" />
            <span>{isZipping ? t.downloadingZip : t.downloadZip}</span>
          </button>
        </div>
      </div>

      {/* Master Transport Bar */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        {/* Play/Pause */}
        <button
          type="button"
          onClick={toggleMasterPlay}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center text-black font-bold shadow-xl shadow-gold/30 hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Master Timeline Scrubber */}
        <div className="flex-1 w-full space-y-1">
          <div className="flex justify-between text-xs text-white/40 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
            {isPlaying && (
              <div
                className="absolute left-0 top-0 h-full bg-gold/40 rounded-full blur-sm"
                style={{ width: `${progressPercent}%` }}
              />
            )}
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.05}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>
        </div>
      </div>

      {/* Multitrack Console Channel Strips */}
      <div className="space-y-3">
        {channels.map((ch) => {
          const isMuted = hasAnySolo ? (!solos[ch.id] || mutes[ch.id]) : mutes[ch.id]
          const isSoloed = solos[ch.id]

          return (
            <div
              key={ch.id}
              className={clsx(
                'flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3',
                isSoloed
                  ? 'bg-gold/10 border-gold/60 shadow-lg shadow-gold/10'
                  : isMuted
                  ? 'bg-black/20 border-white/5 opacity-50'
                  : 'bg-white/[0.03] border-white/10 hover:border-gold/30'
              )}
            >
              {/* Audio node */}
              <audio
                ref={(el) => {
                  audioRefs.current[ch.id] = el
                }}
                src={ch.url}
                preload="metadata"
                onLoadedMetadata={(e) => {
                  if (ch.id === 'full') {
                    setDuration(e.currentTarget.duration)
                  }
                }}
                onTimeUpdate={(e) => {
                  if (ch.id === 'full') {
                    setCurrentTime(e.currentTarget.currentTime)
                  }
                }}
                onEnded={() => {
                  if (ch.id === 'full') {
                    setIsPlaying(false)
                    setCurrentTime(0)
                  }
                }}
              />

              {/* Channel Meta */}
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0">{ch.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{ch.name}</span>
                    {ch.id === 'full' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold font-bold">
                        MASTER
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-white/40 font-mono">Channel {ch.id.toUpperCase()}</p>
                </div>
              </div>

              {/* Channel Controls (Mute / Solo / Download) */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {/* Mute Button */}
                <button
                  type="button"
                  onClick={() => toggleMute(ch.id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5',
                    mutes[ch.id]
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  )}
                  title="Mute Track"
                >
                  {mutes[ch.id] ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{mutes[ch.id] ? t.muted : t.mute}</span>
                </button>

                {/* Solo Button */}
                <button
                  type="button"
                  onClick={() => toggleSolo(ch.id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1',
                    solos[ch.id]
                      ? 'bg-gold border-gold text-black shadow-md shadow-gold/20'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-gold hover:border-gold/30 hover:bg-gold/5'
                  )}
                  title="Solo Track"
                >
                  <span>{t.solo}</span>
                </button>

                {/* Download Individual Stem */}
                <a
                  href={ch.url}
                  download={`${ch.id}_stem.mp3`}
                  className="p-2 rounded-xl bg-white/5 hover:bg-gold/10 text-white/50 hover:text-gold border border-white/10 transition-colors"
                  title={`${t.download} ${ch.name}`}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
