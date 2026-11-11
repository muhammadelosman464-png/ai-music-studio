'use client'

import { useState, useEffect } from 'react'
import { Cloud, Play, Pause, Disc3, RefreshCw, Layers, Calendar, Music } from 'lucide-react'
import clsx from 'clsx'
import { getTrackHistory, TrackHistoryItem, TrackResult } from '@/lib/api'
import { Locale, translations } from '@/lib/translations'

interface CloudLibraryTabProps {
  onLoadTrack: (track: TrackResult) => void
  locale: Locale
}

export default function CloudLibraryTab({ onLoadTrack, locale }: CloudLibraryTabProps) {
  const t = translations[locale]
  const [tracks, setTracks] = useState<TrackHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activePlayId, setActivePlayId] = useState<string | null>(null)

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const data = await getTrackHistory()
      setTracks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSelectTrack = (item: TrackHistoryItem) => {
    if (!item.full_track_url) return
    onLoadTrack({
      track_id: item.id,
      prompt: item.prompt,
      full_track_url: item.full_track_url,
      vocals_url: item.vocals_url || item.full_track_url,
      instrumental_url: item.instrumental_url || item.full_track_url,
      bpm: item.bpm,
      musical_key: item.musical_key,
      lyrics: item.lyrics,
      created_at: item.created_at || undefined,
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest mb-2">
            <Cloud className="w-4 h-4" />
            <span>Supabase Cloud Sync</span>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
            {t.libraryTabTitle}
          </h2>
          <p className="text-xs text-white/50 mt-1">{t.libraryTabSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 text-xs font-semibold text-white/80 hover:text-gold transition-colors"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          <span>Refresh Library</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gold">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-xs text-white/50">Fetching tracks from Supabase...</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="py-20 text-center backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mx-auto">
            <Music className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white/70">{t.noTracksYet}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="backdrop-blur-xl bg-white/[0.03] border border-white/10 hover:border-gold/40 rounded-2xl p-5 space-y-4 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/40 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {track.created_at ? new Date(track.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {track.bpm && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-gold">
                        {track.bpm} BPM
                      </span>
                    )}
                    {track.musical_key && (
                      <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-[10px] text-white/70 truncate max-w-[120px]">
                        {track.musical_key}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                  {track.prompt}
                </h3>

                {track.lyrics && (
                  <p className="text-xs text-white/40 italic line-clamp-2 bg-black/20 p-2 rounded-xl border border-white/5">
                    "{track.lyrics}"
                  </p>
                )}
              </div>

              {/* Audio & Actions */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                {track.full_track_url && (
                  <audio
                    src={track.full_track_url}
                    controls
                    className="w-full h-9 rounded-xl bg-white/5"
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleSelectTrack(track)}
                  className="w-full py-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold text-gold font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>{t.loadToPlayer}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
