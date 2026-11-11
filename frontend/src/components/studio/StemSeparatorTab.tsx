'use client'

import { useState, useRef } from 'react'
import { Disc3, Upload, Play, Pause, Download, Archive, Loader2, Sparkles, Check, FileAudio } from 'lucide-react'
import clsx from 'clsx'
import { separateStems, downloadStemsAsZip, StemSeparationResult } from '@/lib/api'
import { Locale, translations } from '@/lib/translations'

interface StemSeparatorTabProps {
  locale: Locale
}

export default function StemSeparatorTab({ locale }: StemSeparatorTabProps) {
  const t = translations[locale]
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<StemSeparationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isZipping, setIsZipping] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = (file: File) => {
    if (!file) return
    setAudioFile(file)
    setError(null)
    setResult(null)
  }

  const handleSeparate = async () => {
    if (!audioFile) return
    setIsProcessing(true)
    setError(null)

    try {
      const res = await separateStems(audioFile)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stem separation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleZip = async () => {
    if (!result) return
    setIsZipping(true)
    try {
      await downloadStemsAsZip(
        {
          vocals: result.vocals_url,
          instrumental: result.other_url,
          drums: result.drums_url,
          bass: result.bass_url,
        },
        audioFile?.name.replace(/\.[^/.]+$/, '') || 'separated_stems'
      )
    } catch (e) {
      console.error(e)
    } finally {
      setIsZipping(false)
    }
  }

  const stemsList = result
    ? [
        { name: t.trackVocals, url: result.vocals_url, icon: '🎤', color: 'text-emerald-400' },
        { name: t.trackInstrumental, url: result.other_url, icon: '🎸', color: 'text-blue-400' },
        { name: t.trackDrums, url: result.drums_url, icon: '🥁', color: 'text-amber-400' },
        { name: t.trackBass, url: result.bass_url, icon: '🔊', color: 'text-purple-400' },
      ]
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest">
          <Disc3 className="w-4 h-4 animate-spin-slow" />
          <span>Meta HTDemucs AI</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
          {t.stemsTabTitle}
        </h2>
        <p className="text-sm text-white/50 max-w-xl mx-auto">{t.stemsTabSubtitle}</p>
      </div>

      {/* Upload Zone */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.flac"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="py-12 px-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-gold/50 bg-black/30 hover:bg-black/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">
              {audioFile ? audioFile.name : t.stemsUploadPrompt}
            </p>
            <p className="text-xs text-white/40">MP3, WAV, M4A, FLAC • Up to 100MB</p>
          </div>
          {audioFile && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" /> Ready for Demixing
            </span>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSeparate}
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
              <span>{t.separatingWait}</span>
            </>
          ) : (
            <span>{t.separateButton}</span>
          )}
        </button>
      </div>

      {/* Stem Results */}
      {result && (
        <div className="backdrop-blur-2xl bg-white/[0.04] border border-gold/30 rounded-3xl p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-xl font-bold text-white">Isolated Stems (4 Channels)</h3>
              <p className="text-xs text-white/40">Studio quality 320kbps MP3 exports</p>
            </div>

            <button
              type="button"
              onClick={handleZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-xs shadow-lg shadow-gold/20 hover:scale-105 transition-all"
            >
              <Archive className="w-4 h-4" />
              <span>{isZipping ? t.downloadingZip : t.downloadZip}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stemsList.map((stem) => (
              <div
                key={stem.name}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-gold/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{stem.icon}</span>
                    <span className={clsx('text-sm font-bold', stem.color)}>{stem.name}</span>
                  </div>
                  <a
                    href={stem.url}
                    download={`${stem.name.toLowerCase().replace(/\s+/g, '_')}.mp3`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-gold/10 text-white/50 hover:text-gold border border-white/10 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                <audio src={stem.url} controls className="w-full h-10 rounded-xl bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
