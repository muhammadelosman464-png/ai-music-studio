'use client'

import { useRef, useEffect } from 'react'
import { Mic, MicOff, Trash2, CheckCircle2, Play, Pause } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import WaveformVisualizer from './WaveformVisualizer'
import clsx from 'clsx'
import { useState } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const {
    isRecording,
    audioBlob,
    audioBlobUrl,
    analyserNode,
    startRecording,
    stopRecording,
    resetRecording,
    error,
  } = useAudioRecorder()

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [audioBlobUrl])

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleUseRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob)
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-8 space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white/90">Record Your Melody</h2>
        <p className="text-sm text-white/40 mt-1">
          Hum, sing, or whistle your tune — we'll handle the rest
        </p>
      </div>

      {/* Central pulse circle or waveform */}
      <div className="flex flex-col items-center gap-6">
        {!isRecording && !audioBlobUrl && (
          <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            <div className="absolute w-40 h-40 rounded-full border border-gold/20 animate-ping" />
            <div
              className="absolute w-32 h-32 rounded-full border border-gold/30"
              style={{ animation: 'pulse-gold 2.5s ease-in-out infinite' }}
            />
            {/* Core button */}
            <button
              onClick={startRecording}
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold-dark to-gold hover:from-gold hover:to-gold-light transition-all duration-300 flex items-center justify-center group shadow-lg shadow-gold/30 animate-pulse-gold"
            >
              <Mic className="w-10 h-10 text-black group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Recording state */}
        {isRecording && (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-medium text-sm uppercase tracking-widest">
                Recording...
              </span>
            </div>
            <WaveformVisualizer analyser={analyserNode} isActive={isRecording} height={100} />
            <div className="flex justify-center">
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-8 py-3 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition-all duration-200"
              >
                <MicOff className="w-5 h-5" />
                Stop Recording
              </button>
            </div>
          </div>
        )}

        {/* Playback state */}
        {audioBlobUrl && !isRecording && (
          <div className="w-full space-y-4">
            {/* Hidden native audio */}
            <audio
              ref={audioRef}
              src={audioBlobUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
            />

            {/* Custom player */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-dark to-gold hover:from-gold hover:to-gold-light flex items-center justify-center transition-all duration-200 shadow-md shadow-gold/30 flex-shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-black" />
                  ) : (
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  )}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-dark to-gold-light rounded-full transition-all duration-100"
                      style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.01}
                      value={currentTime}
                      onChange={(e) => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = parseFloat(e.target.value)
                        }
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center">Recording captured ✓</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Idle start prompt */}
      {!isRecording && !audioBlobUrl && (
        <p className="text-center text-white/30 text-sm">
          Click the microphone to start recording
        </p>
      )}

      {/* Action buttons */}
      {audioBlobUrl && !isRecording && (
        <div className="flex gap-3">
          <button
            onClick={resetRecording}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleUseRecording}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300',
              'bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light',
              'text-black shadow-lg shadow-gold/30 hover:shadow-gold/50 hover:scale-[1.02]',
            )}
          >
            <CheckCircle2 className="w-5 h-5" />
            Use This Recording
          </button>
        </div>
      )}
    </div>
  )
}
