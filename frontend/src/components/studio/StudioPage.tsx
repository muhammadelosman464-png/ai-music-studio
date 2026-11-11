'use client'

import { useState, useEffect } from 'react'
import {
  Music,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Server,
  Check,
  X,
  Disc3,
  Mic2,
  Cloud,
  Languages,
  Sliders,
  Layers,
} from 'lucide-react'
import clsx from 'clsx'

import AudioSourceSelector from './AudioSourceSelector'
import PromptInput from './PromptInput'
import ProductionStepper from './ProductionStepper'
import ResultPlayer from './ResultPlayer'
import StemSeparatorTab from './StemSeparatorTab'
import VoiceTransformerTab from './VoiceTransformerTab'
import CloudLibraryTab from './CloudLibraryTab'

import {
  produceTrack,
  TrackResult,
  getBackendUrl,
  setBackendUrl,
  testBackendConnection,
} from '@/lib/api'
import { Locale, translations } from '@/lib/translations'

type ActiveTab = 'studio' | 'stems' | 'voice' | 'library'
type StudioState = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export default function StudioPage() {
  const [locale, setLocale] = useState<Locale>('ar')
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio')
  const [state, setState] = useState<StudioState>('idle')

  // Production Inputs
  const [prompt, setPrompt] = useState('Modern Levantine Arabic pop, punchy dabke electronic percussion, buzuq lead, energetic rhythm, radio master')
  const [lyrics, setLyrics] = useState('')
  const [mastering, setMastering] = useState(true)
  const [voiceModel, setVoiceModel] = useState('Squidward')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  // Stepper & Results
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<TrackResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Backend settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [backendUrlInput, setBackendUrlInput] = useState('')
  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [connMessage, setConnMessage] = useState('')

  const t = translations[locale]

  // Read saved locale & backend URL on mount
  useEffect(() => {
    setBackendUrlInput(getBackendUrl())
    const savedLocale = localStorage.getItem('studio_locale') as Locale
    if (savedLocale === 'en' || savedLocale === 'ar') {
      setLocale(savedLocale)
    }
  }, [])

  const toggleLanguage = () => {
    const nextLocale: Locale = locale === 'en' ? 'ar' : 'en'
    setLocale(nextLocale)
    localStorage.setItem('studio_locale', nextLocale)
  }

  // Simulate step progression during processing
  useEffect(() => {
    if (state !== 'processing') return

    const stepTimings = [0, 2000, 5000, 8500]
    const timers: ReturnType<typeof setTimeout>[] = []

    stepTimings.forEach((delay, index) => {
      const timer = setTimeout(() => setCurrentStep(index), delay)
      timers.push(timer)
    })

    return () => timers.forEach(clearTimeout)
  }, [state])

  const handleTestConnection = async () => {
    setConnStatus('testing')
    setConnMessage(t.backendTesting)
    const res = await testBackendConnection(backendUrlInput)
    if (res.ok) {
      setConnStatus('success')
      setConnMessage(res.message)
      setBackendUrl(backendUrlInput)
    } else {
      setConnStatus('error')
      setConnMessage(res.message)
    }
  }

  const handleSaveBackendUrl = () => {
    setBackendUrl(backendUrlInput)
    setIsSettingsOpen(false)
  }

  const handleProduce = async () => {
    if (!audioBlob) return

    setState('processing')
    setCurrentStep(0)
    setErrorMessage('')

    try {
      const trackResult = await produceTrack(
        audioBlob,
        prompt.trim() || 'Modern Arabic Pop with orchestral strings',
        lyrics,
        mastering,
        voiceModel
      )
      setResult(trackResult)
      setCurrentStep(4)
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
    setCurrentStep(0)
    setResult(null)
    setErrorMessage('')
  }

  const handleLoadTrackFromLibrary = (loadedTrack: TrackResult) => {
    setResult(loadedTrack)
    setActiveTab('studio')
    setState('done')
  }

  const canProduce = audioBlob !== null

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen font-sans selection:bg-gold selection:text-black">
      {/* ------------------------------------------------------------- */}
      {/* 1. Luxury Navbar                                              */}
      {/* ------------------------------------------------------------- */}
      <header className="border-b border-white/5 backdrop-blur-2xl bg-black/40 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center shadow-lg shadow-gold/30 shrink-0">
              <Music className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent leading-none">
                  {t.brandTitle}
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gold/20 text-gold border border-gold/30">
                  V2 PRO
                </span>
              </div>
              <p className="text-xs text-white/40 leading-none mt-1 hidden sm:block">
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* Right Controls: Backend, Language Toggle & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-gold/10 hover:border-gold/30 text-white/80 hover:text-gold transition-all"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-gold" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Backend URL Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:bg-gold/10 hover:border-gold/30 text-white/60 hover:text-gold transition-all"
              title="Configure Backend API URL"
            >
              <Server className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.backendSettings}</span>
            </button>

            {/* Status badge */}
            <div
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0',
                state === 'idle' && 'bg-white/5 border-white/10 text-white/40',
                state === 'recording' && 'bg-red-500/10 border-red-500/30 text-red-400',
                state === 'processing' && 'bg-gold/10 border-gold/30 text-gold',
                state === 'done' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                state === 'error' && 'bg-red-500/10 border-red-500/30 text-red-400'
              )}
            >
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  state === 'idle' && 'bg-white/30',
                  state === 'recording' && 'bg-red-400 animate-pulse',
                  state === 'processing' && 'bg-gold animate-pulse',
                  state === 'done' && 'bg-emerald-400',
                  state === 'error' && 'bg-red-400'
                )}
              />
              <span className="hidden xs:inline">
                {state === 'idle' && t.statusReady}
                {state === 'recording' && t.statusRecording}
                {state === 'processing' && t.statusProcessing}
                {state === 'done' && t.statusDone}
                {state === 'error' && t.statusError}
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Navigation Tabs Bar                                           */}
        {/* ------------------------------------------------------------- */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-1 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0',
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black shadow-lg shadow-gold/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            )}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{t.tabStudio}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stems')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0',
              activeTab === 'stems'
                ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black shadow-lg shadow-gold/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            )}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>{t.tabStems}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0',
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black shadow-lg shadow-gold/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            )}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>{t.tabVoice}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0',
              activeTab === 'library'
                ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black shadow-lg shadow-gold/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            )}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{t.tabLibrary}</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Content Area                                          */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Tab 1: Studio Production */}
        {activeTab === 'studio' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Section */}
            <section className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.poweredBy}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent leading-tight">
                {t.heroTitle}
              </h2>
              <p className="text-sm md:text-base text-white/50 leading-relaxed">
                {t.heroSubtitle}
              </p>
            </section>

            {/* Error Message */}
            {state === 'error' && errorMessage && (
              <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Production Pipeline Alert</p>
                  <p className="mt-0.5 text-red-300/80">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1 rounded hover:bg-red-500/20 text-red-400"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Idle & Input Mode */}
            {state === 'idle' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Audio Input Selector (Feature 1) */}
                <AudioSourceSelector
                  onAudioReady={(blob) => setAudioBlob(blob)}
                  locale={locale}
                />

                {/* Prompt, Lyrics, Oriental Presets & Mastering (Features 2, 4, 7, 5) */}
                <PromptInput
                  value={prompt}
                  onChange={setPrompt}
                  lyrics={lyrics}
                  onLyricsChange={setLyrics}
                  mastering={mastering}
                  onMasteringChange={setMastering}
                  voiceModel={voiceModel}
                  onVoiceModelChange={setVoiceModel}
                  locale={locale}
                  disabled={false}
                />

                {/* Produce Button */}
                <button
                  type="button"
                  onClick={handleProduce}
                  disabled={!canProduce}
                  className={clsx(
                    'w-full py-4 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl',
                    canProduce
                      ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black hover:scale-[1.01] active:scale-[0.99] shadow-gold/25'
                      : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                  )}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{canProduce ? t.produceButton : t.produceRequirements}</span>
                </button>
              </div>
            )}

            {/* Processing Mode (Stepper) */}
            {state === 'processing' && (
              <div className="max-w-2xl mx-auto">
                <ProductionStepper currentStep={currentStep} locale={locale} />
              </div>
            )}

            {/* Done Mode (Multitrack Player - Features 10 & 9) */}
            {state === 'done' && result && (
              <div className="max-w-4xl mx-auto space-y-6">
                <ResultPlayer result={result} locale={locale} />

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-gold text-xs font-bold transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'إنتاج عمل موسيقي جديد' : 'Produce Another Track'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Standalone Stem Separator (Feature 3) */}
        {activeTab === 'stems' && <StemSeparatorTab locale={locale} />}

        {/* Tab 3: Standalone Voice Transformer (Feature 5) */}
        {activeTab === 'voice' && <VoiceTransformerTab locale={locale} />}

        {/* Tab 4: Cloud Studio Library (Feature 8) */}
        {activeTab === 'library' && (
          <CloudLibraryTab onLoadTrack={handleLoadTrackFromLibrary} locale={locale} />
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. Backend Settings Modal                                     */}
      {/* ------------------------------------------------------------- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#121212] border border-gold/30 shadow-2xl shadow-gold/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gold">
                <Server className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">{t.backendTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/60 mb-4">{t.backendDesc}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">
                  Endpoint URL:
                </label>
                <input
                  type="text"
                  value={backendUrlInput}
                  onChange={(e) => setBackendUrlInput(e.target.value)}
                  placeholder="https://ai-music-studio-backend.onrender.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-gold font-mono"
                />
              </div>

              {connMessage && (
                <div
                  className={clsx(
                    'p-2.5 rounded-xl text-xs flex items-center gap-2',
                    connStatus === 'success' && 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
                    connStatus === 'error' && 'bg-red-500/10 border border-red-500/30 text-red-400',
                    connStatus === 'testing' && 'bg-gold/10 border border-gold/30 text-gold'
                  )}
                >
                  {connStatus === 'success' && <Check className="w-4 h-4 shrink-0" />}
                  {connStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{connMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={connStatus === 'testing'}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-white/10 hover:border-gold/40 text-white/80 hover:text-gold transition-colors"
                >
                  {connStatus === 'testing' ? 'Testing...' : t.backendTest}
                </button>
                <button
                  type="button"
                  onClick={handleSaveBackendUrl}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black hover:opacity-90 transition-opacity"
                >
                  {t.backendSave}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
