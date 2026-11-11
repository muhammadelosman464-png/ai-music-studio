export type TrackResult = {
  full_track_url: string
  vocals_url: string
  instrumental_url: string
  track_id: string
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

export async function produceTrack(audioBlob: Blob, prompt: string): Promise<TrackResult> {
  const backend = getBackendUrl()
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'

  // If the browser is loaded over HTTPS and the backend is an insecure localhost URL,
  // route through Next.js proxy route to prevent Mixed Content security blocking.
  const useProxy = isHttps && (backend.startsWith('http://localhost') || backend.startsWith('http://127.0.0.1'))
  const endpoint = useProxy ? '/api/produce' : `${backend}/api/v1/studio/produce`

  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('prompt', prompt)

  const response = await fetch(endpoint, {
    method: 'POST',
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

  const data: TrackResult = await response.json()
  return data
}
