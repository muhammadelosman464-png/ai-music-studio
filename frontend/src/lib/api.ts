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

export async function produceTrack(audioBlob: Blob, prompt: string): Promise<TrackResult> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'


  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('prompt', prompt)

  const response = await fetch(`${apiUrl}/api/v1/studio/produce`, {
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
