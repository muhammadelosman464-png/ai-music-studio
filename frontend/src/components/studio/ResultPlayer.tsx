'use client'

import { useRef, useState } from 'react'
import { Play, Pause, Download } from 'lucide-react'
import clsx from 'clsx'

interface TrackPlayerProps {
  url: string
  title: string
  icon: string
  accentClass?: string
}

function TrackPlayer({ url, title, icon, accentClass }: TrackPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const formatTime = (secs: number) => {
    if (!isFinite(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3 hover:border-gold/20 transition-all duration-300">
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        preload="metadata"
      />

      {/* Track header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-white/90 text-sm">{title}</p>
          <p className="text-xs text-white/30">{formatTime(duration)}</p>
        </div>
        {/* Download button */}
        <a
          href={url}
          download={`${title.toLowerCase().replace(/\s+/g, '-')}.mp3`}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
            'bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light',
            'text-black transition-all duration-200 hover:shadow-md hover:shadow-gold/30',
          )}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </a>
      </div>

      {/* Player controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0',
            'bg-gradient-to-br from-gold-dark to-gold hover:from-gold hover:to-gold-light',
            'shadow-md shadow-gold/20 hover:shadow-gold/40 hover:scale-105',
          )}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-black" />
          ) : (
            <Play className="w-4 h-4 text-black ml-0.5" />
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1 relative group">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer">
            {/* Filled portion */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Glow on filled part */}
            {isPlaying && (
              <div
                className="absolute left-0 top-0 h-full bg-gold-light/30 rounded-full blur-sm transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            )}
          </div>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value)
              if (audioRef.current) audioRef.current.currentTime = t
              setCurrentTime(t)
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
          />
          {/* Time labels */}
          <div className="flex justify-between text-xs text-white/25 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ResultPlayerProps {
  fullTrackUrl: string
  vocalsUrl: string
  instrumentalUrl: string
}

export default function ResultPlayer({
  fullTrackUrl,
  vocalsUrl,
  instrumentalUrl,
}: ResultPlayerProps) {
  return (
    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full mb-4">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-gold text-xs font-semibold uppercase tracking-widest">
            Production Complete
          </span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
          Your Masterpiece Is Ready
        </h2>
        <p className="text-sm text-white/40 mt-1">
          Listen and download your AI-produced stems below
        </p>
      </div>

      {/* Track players */}
      <div className="space-y-3">
        <TrackPlayer
          url={fullTrackUrl}
          title="Full Mastered Track"
          icon="🏆"
          accentClass="text-gold"
        />
        <TrackPlayer
          url={vocalsUrl}
          title="Isolated AI Vocals"
          icon="🎤"
          accentClass="text-gold-light"
        />
        <TrackPlayer
          url={instrumentalUrl}
          title="Instrumental Only"
          icon="🎸"
          accentClass="text-gold-dark"
        />
      </div>

      {/* Download all hint */}
      <p className="text-center text-xs text-white/25">
        Click "Download" on each track to save it to your device
      </p>
    </div>
  )
}
