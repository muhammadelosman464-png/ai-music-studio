'use client'

import { useState, useEffect } from 'react'
import { Music, Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import AudioRecorder from './AudioRecorder'
import PromptInput from './PromptInput'
import ProductionStepper from './ProductionStepper'
import ResultPlayer from './ResultPlayer'
import { produceTrack, TrackResult } from '@/lib/api'

type StudioState = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export default function StudioPage() {
  const [state, setState] = useState<StudioState>('idle')
  const [prompt, setPrompt] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<TrackResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Simulate step progression during processing
  useEffect(() => {
    if (state !== 'processing') return

    const stepTimings = [0, 1500, 4000, 7000] // ms delays per step
    const timers: ReturnType<typeof setTimeout>[] = []

    stepTimings.forEach((delay, index) => {
      const t = setTimeout(() => setCurrentStep(index), delay)
      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [state])

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob)
    // Don't auto-advance; let user optionally set prompt first
  }

  const handleProduce = async () => {
    if (!audioBlob) return
    if (!prompt.trim()) {
      // Allow production without prompt (backend will use a default)
    }

    setState('processing')
    setCurrentStep(0)
    setErrorMessage('')

    try {
      const trackResult = await produceTrack(audioBlob, prompt.trim())
      setResult(trackResult)
      setCurrentStep(4) // all steps done
      setState('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMessage(message)
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setAudioBlob(null)
    setPrompt('')
    setCurrentStep(0)
    setResult(null)
    setErrorMessage('')
  }

  const canProduce = audioBlob !== null

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-black/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center shadow-lg shadow-gold/30">
              <Music className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent leading-none">
                AI Music Studio
              </h1>
              <p className="text-xs text-white/30 leading-none mt-0.5">
                Transform your hum into a masterpiece
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
              state === 'idle' && 'bg-white/5 border-white/10 text-white/40',
              state === 'recording' && 'bg-red-500/10 border-red-500/30 text-red-400',
              state === 'processing' && 'bg-gold/10 border-gold/30 text-gold',
              state === 'done' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
              state === 'error' && 'bg-red-500/10 border-red-500/30 text-red-400',
            )}
          >
            <span
              className={clsx(
                'w-1.5 h-1.5 rounded-full',
                state === 'idle' && 'bg-white/30',
                state === 'recording' && 'bg-red-400 animate-pulse',
                state === 'processing' && 'bg-gold animate-pulse',
                state === 'done' && 'bg-emerald-400',
                state === 'error' && 'bg-red-400',
              )}
            />
            {state === 'idle' && 'Ready'}
            {state === 'recording' && 'Recording'}
            {state === 'processing' && 'Producing'}
            {state === 'done' && 'Complete'}
            {state === 'error' && 'Error'}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-gold text-sm font-medium">Powered by Advanced AI</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
          <span className="bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
            🎵 AI Music Studio
          </span>
        </h2>
        <p className="text-lg text-white/50 max-w-xl mx-auto">
          Record a melody, describe your vision, and let AI transform it into a fully produced
          professional track in minutes.
        </p>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {['Record', 'Describe', 'Produce', 'Download'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={clsx(
                  'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300',
                  (state === 'done' && i < 4) ||
                    (state === 'processing' && i < 3) ||
                    (canProduce && i < 2) ||
                    (audioBlob && i < 1)
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'bg-white/5 text-white/30 border border-white/10',
                )}
              >
                <span
                  className={clsx(
                    'w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold',
                    (state === 'done' && i < 4) ||
                      (state === 'processing' && i < 3) ||
                      (canProduce && i < 2) ||
                      (audioBlob && i < 1)
                      ? 'bg-gold text-black'
                      : 'bg-white/10 text-white/30',
                  )}
                >
                  {i + 1}
                </span>
                {label}
              </div>
              {i < 3 && <span className="text-white/20 text-xs">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 pb-20">
        {/* IDLE / RECORDING state */}
        {(state === 'idle' || state === 'recording') && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Audio Recorder */}
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />

            {/* Prompt Input — show when recording is done */}
            {audioBlob && (
              <div className="animate-fade-in-up">
                <PromptInput value={prompt} onChange={setPrompt} disabled={false} />
              </div>
            )}

            {/* Produce button */}
            {canProduce && (
              <div className="animate-fade-in-up flex justify-center">
                <button
                  onClick={handleProduce}
                  className={clsx(
                    'flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg',
                    'bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light',
                    'text-black shadow-xl shadow-gold/30 hover:shadow-gold/50',
                    'transition-all duration-300 hover:scale-105',
                  )}
                >
                  <Sparkles className="w-6 h-6" />
                  Produce My Track
                </button>
              </div>
            )}
          </div>
        )}

        {/* PROCESSING state */}
        {state === 'processing' && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <ProductionStepper currentStep={currentStep} />
          </div>
        )}

        {/* DONE state */}
        {state === 'done' && result && (
          <div className="space-y-6 animate-fade-in-up">
            <ResultPlayer
              fullTrackUrl={result.full_track_url}
              vocalsUrl={result.vocals_url}
              instrumentalUrl={result.instrumental_url}
            />
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Create Another Track
              </button>
            </div>
          </div>
        )}

        {/* ERROR state */}
        {state === 'error' && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="backdrop-blur-xl bg-white/[0.04] border border-red-500/20 rounded-2xl p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white/90 mb-2">Production Failed</h3>
                <p className="text-white/50 text-sm">{errorMessage}</p>
              </div>
              <button
                onClick={handleReset}
                className={clsx(
                  'flex items-center gap-2 px-8 py-3 rounded-xl font-bold mx-auto',
                  'bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light',
                  'text-black transition-all duration-200',
                )}
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-white/20">
          <span>© 2024 AI Music Studio</span>
          <span className="flex items-center gap-1">
            Powered by <span className="text-gold/60 ml-1">Advanced AI</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
