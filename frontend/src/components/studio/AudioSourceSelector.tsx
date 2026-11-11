'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { Mic, Upload, Play, Pause, Trash2, Check, Music2, FileAudio } from 'lucide-react'
import clsx from 'clsx'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import WaveformVisualizer from './WaveformVisualizer'
import { Locale, translations } from '@/lib/translations'

interface AudioSourceSelectorProps {
  onAudioReady: (blob: Blob | null) => void
  locale: Locale
  disabled?: boolean
}

export default function AudioSourceSelector({
  onAudioReady,
  locale,
  disabled = false,
}: AudioSourceSelectorProps) {
  const t = translations[locale]
  const [mode, setMode] = useState<'mic' | 'upload'>('mic')
  const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const audioPreviewRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Mic hook
  const {
    isRecording,
    audioBlob: micBlob,
    audioBlobUrl: micUrl,
    analyserNode,
    startRecording,
    stopRecording,
    resetRecording,
    error: micError,
  } = useAudioRecorder()

  // Handle mic stop
  const handleStopMic = () => {
    stopRecording()
  }

  // Effect when mic records a blob
  const handleUseMic = () => {
    if (micBlob) {
      onAudioReady(micBlob)
    }
  }

  // Handle file upload
  const handleFile = (file: File) => {
    if (!file) return
    const blob = new Blob([file], { type: file.type || 'audio/mpeg' })
    const url = URL.createObjectURL(blob)
    setUploadedBlob(blob)
    setUploadedUrl(url)
    setUploadedFileName(file.name)
    onAudioReady(blob)
  }

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = () => {
    setIsDragOver(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleClearUpload = () => {
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl)
    setUploadedBlob(null)
    setUploadedUrl(null)
    setUploadedFileName('')
    setIsPlayingPreview(false)
    onAudioReady(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleTogglePreview = () => {
    if (!audioPreviewRef.current) return
    if (isPlayingPreview) {
      audioPreviewRef.current.pause()
      setIsPlayingPreview(false)
    } else {
      audioPreviewRef.current.play()
      setIsPlayingPreview(true)
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow accent */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-gold" />
          <h3 className="font-bold text-base text-white">{t.audioInputMode}</h3>
        </div>

        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('mic')
              if (micBlob) onAudioReady(micBlob)
            }}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
              mode === 'mic' ? 'bg-gold text-black shadow-md shadow-gold/20' : 'text-white/60 hover:text-white'
            )}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{t.tabRecord}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('upload')
              if (uploadedBlob) onAudioReady(uploadedBlob)
            }}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
              mode === 'upload' ? 'bg-gold text-black shadow-md shadow-gold/20' : 'text-white/60 hover:text-white'
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.tabUpload}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Microphone */}
      {mode === 'mic' && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          {/* Waveform view when recording or previewing */}
          <div className="w-full h-24 mb-6 rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
            {isRecording ? (
              <WaveformVisualizer analyser={analyserNode} isActive={true} />
            ) : micUrl ? (
              <div className="flex items-center gap-3 px-4 py-2 text-emerald-400 text-sm">
                <Check className="w-5 h-5" />
                <span>{t.audioReady}</span>
              </div>
            ) : (
              <p className="text-xs text-white/30">{t.micListening}</p>
            )}
          </div>

          {micError && <p className="text-xs text-red-400 mb-3">{micError}</p>}

          <div className="flex items-center gap-4">
            {!isRecording && !micUrl && (
              <button
                type="button"
                onClick={startRecording}
                disabled={disabled}
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-sm shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Mic className="w-5 h-5 animate-pulse" />
                <span>{t.micRecordStart}</span>
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={handleStopMic}
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all animate-pulse"
              >
                <div className="w-3.5 h-3.5 bg-white rounded-sm" />
                <span>{t.micRecordStop}</span>
              </button>
            )}

            {micUrl && !isRecording && (
              <div className="flex items-center gap-3">
                <audio
                  src={micUrl}
                  controls
                  className="h-10 rounded-xl bg-white/5 border border-white/10"
                  onPlay={() => onAudioReady(micBlob)}
                />
                <button
                  type="button"
                  onClick={() => {
                    resetRecording()
                    onAudioReady(null)
                  }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 transition-colors"
                  title={t.reRecord}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Audio File Upload */}
      {mode === 'upload' && (
        <div className="flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
            onChange={onFileInputChange}
            className="hidden"
          />

          {!uploadedBlob ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'w-full py-10 px-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center',
                isDragOver
                  ? 'border-gold bg-gold/10'
                  : 'border-white/10 hover:border-gold/50 bg-black/30 hover:bg-black/40'
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold shadow-lg">
                <FileAudio className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{t.uploadPrompt}</p>
                <p className="text-xs text-white/40">MP3, WAV, M4A, OGG, FLAC (Max 50MB)</p>
              </div>
            </div>
          ) : (
            <div className="w-full p-4 rounded-2xl bg-black/40 border border-gold/30 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-white truncate">{uploadedFileName}</p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.uploadSuccess}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <audio
                  ref={audioPreviewRef}
                  src={uploadedUrl || undefined}
                  onEnded={() => setIsPlayingPreview(false)}
                />
                <button
                  type="button"
                  onClick={handleTogglePreview}
                  className="p-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 transition-colors"
                >
                  {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleClearUpload}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
