import JSZip from 'jszip'

export type TrackResult = {
  full_track_url: string
  vocals_url: string
  instrumental_url: string
  drums_url?: string | null
  bass_url?: string | null
  track_id: string
  bpm?: number | null
  musical_key?: string | null
  prompt?: string
  lyrics?: string | null
  price_tag?: string | null
  mastered?: boolean
  created_at?: string
}

export type StemSeparationResult = {
  job_id: string
  original_url: string
  vocals_url: string
  drums_url: string
  bass_url: string
  other_url: string
  created_at: string
}

export type VoiceTransformResult = {
  job_id: string
  original_url: string
  transformed_url: string
  target_voice: string
  pitch_change: string
  created_at: string
}

export type TrackHistoryItem = {
  id: string
  prompt: string
  lyrics?: string | null
  raw_audio_url?: string | null
  full_track_url?: string | null
  vocals_url?: string | null
  instrumental_url?: string | null
  bpm?: number | null
  musical_key?: string | null
  created_at?: string | null
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('studio_backend_url')
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '')
    }
  }
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  return 'http://localhost:8000'
}

export function setBackendUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('studio_backend_url', url.trim().replace(/\/+$/, ''))
    } else {
      localStorage.removeItem('studio_backend_url')
    }
  }
}

export async function testBackendConnection(url?: string): Promise<{ ok: boolean; message: string }> {
  const target = (url || getBackendUrl()).replace(/\/+$/, '')
  try {
    const res = await fetch(`${target}/health`, { method: 'GET', signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      return { ok: true, message: data.service || 'Connected to AI Music Studio API' }
    }
    return { ok: false, message: `Server responded with status ${res.status}` }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Connection timed out' }
  }
}

function resolveEndpoint(path: string): string {
  const backend = getBackendUrl()
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const isLocalInsecure = backend.startsWith('http://localhost') || backend.startsWith('http://127.0.0.1')

  if (isHttps && isLocalInsecure) {
    // If on HTTPS (Vercel) and backend is local HTTP, route through Next.js proxy route
    const cleanPath = path.replace(/^\/+/, '')
    return `/api/proxy/${cleanPath}`
  }
  return `${backend}${path}`
}

/**
 * Full AI Music Production
 */
export async function produceTrack(
  audioBlob: Blob,
  prompt: string,
  lyrics?: string,
  mastering: boolean = true,
  voiceModel: string = 'Squidward',
  priceTag?: string,
): Promise<TrackResult> {
  const endpoint = resolveEndpoint('/api/v1/studio/produce')
  const formData = new FormData()
  formData.append('audio', audioBlob, 'input_audio.wav')
  formData.append('prompt', prompt)
  if (lyrics && lyrics.trim()) {
    formData.append('lyrics', lyrics.trim())
  }
  if (priceTag && priceTag.trim()) {
    formData.append('price_tag', priceTag.trim())
  }
  formData.append('mastering', String(mastering))
  formData.append('voice_model', voiceModel)

  const headers: Record<string, string> = {}
  if (typeof window !== 'undefined') {
    const customSuno = localStorage.getItem('studio_suno_key')
    const customReplicate = localStorage.getItem('studio_replicate_token')
    if (customSuno && customSuno.trim()) headers['X-Suno-Key'] = customSuno.trim()
    if (customReplicate && customReplicate.trim()) headers['X-Replicate-Token'] = customReplicate.trim()
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      message = errorData.detail ?? errorData.message ?? message
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as TrackResult
}

/**
 * Standalone AI Stem Separation
 */
export async function separateStems(audioBlob: Blob): Promise<StemSeparationResult> {
  const endpoint = resolveEndpoint('/api/v1/studio/separate-stems')
  const formData = new FormData()
  formData.append('audio', audioBlob, 'track_to_separate.mp3')

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = `Separation failed with status ${response.status}`
    try {
      const errorData = await response.json()
      message = errorData.detail ?? message
    } catch {}
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as StemSeparationResult
}

/**
 * Standalone Voice-to-Voice Transformation
 */
export async function transformVoice(
  audioBlob: Blob,
  modelName: string = 'Squidward',
  pitchChange: string = 'no-change',
): Promise<VoiceTransformResult> {
  const endpoint = resolveEndpoint('/api/v1/studio/voice-transform')
  const formData = new FormData()
  formData.append('audio', audioBlob, 'vocal_source.wav')
  formData.append('model_name', modelName)
  formData.append('pitch_change', pitchChange)

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = `Voice conversion failed with status ${response.status}`
    try {
      const errorData = await response.json()
      message = errorData.detail ?? message
    } catch {}
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as VoiceTransformResult
}

/**
 * Fetch Cloud Studio History
 */
export async function getTrackHistory(): Promise<TrackHistoryItem[]> {
  const endpoint = resolveEndpoint('/api/v1/studio/history')

  try {
    const response = await fetch(endpoint, { method: 'GET' })
    if (response.ok) {
      return (await response.json()) as TrackHistoryItem[]
    }
    return []
  } catch (err) {
    console.warn('Failed to load history from backend:', err)
    return []
  }
}

/**
 * Multi-Stem ZIP Archiver (Client-side JSZip with direct streaming download)
 */
export async function downloadStemsAsZip(
  stems: { vocals?: string | null; instrumental?: string | null; drums?: string | null; bass?: string | null },
  title: string = 'ai_master_stems',
): Promise<void> {
  const zip = new JSZip()
  const folder = zip.folder('stems') || zip

  const fetchTrack = async (name: string, url?: string | null) => {
    if (!url) return
    try {
      const res = await fetch(url)
      if (res.ok) {
        const blob = await res.blob()
        folder.file(name, blob)
      }
    } catch (e) {
      console.warn(`Could not add ${name} to zip:`, e)
    }
  }

  await Promise.all([
    fetchTrack('01_Vocals.mp3', stems.vocals),
    fetchTrack('02_Instrumental_Melody.mp3', stems.instrumental),
    fetchTrack('03_Drums_Percussion.mp3', stems.drums),
    fetchTrack('04_Bass.mp3', stems.bass),
  ])

  folder.file(
    'SESSION_NOTES.txt',
    `AI Music Studio V2 Multitrack Export\nTrack: ${title}\nExported: ${new Date().toISOString()}\nStems Included: Vocals, Instrumental, Drums, Bass\n`
  )

  const content = await zip.generateAsync({ type: 'blob' })
  const downloadUrl = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `${title.replace(/\s+/g, '_')}_stems.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000)
}
