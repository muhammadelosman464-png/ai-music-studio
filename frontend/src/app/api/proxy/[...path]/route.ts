import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // Allow up to 5 minutes for AI audio generation

function getTargetBackendUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000'
  ).replace(/\/+$/, '')
}

async function forwardRequest(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const backendBase = getTargetBackendUrl()
    const subPath = (params.path || []).join('/')
    const url = new URL(req.url)
    const targetUrl = `${backendBase}/${subPath}${url.search}`

    const method = req.method
    const headers = new Headers()

    // Pass authorization or custom headers if present
    const auth = req.headers.get('authorization')
    if (auth) headers.set('authorization', auth)

    let body: BodyInit | undefined = undefined

    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        // Forward FormData directly
        body = await req.formData()
      } else {
        const rawBody = await req.arrayBuffer()
        if (rawBody.byteLength > 0) {
          body = rawBody
          headers.set('content-type', contentType)
        }
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    })

    const responseContentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      const errText = await response.text()
      let parsedDetail = errText
      try {
        const json = JSON.parse(errText)
        parsedDetail = json.detail || json.message || errText
      } catch {}

      return NextResponse.json(
        { detail: parsedDetail },
        { status: response.status }
      )
    }

    // Binary / Audio or Streamed content (e.g. ZIP or Audio bytes)
    if (
      responseContentType.includes('audio/') ||
      responseContentType.includes('application/zip') ||
      responseContentType.includes('application/octet-stream')
    ) {
      const blob = await response.arrayBuffer()
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          'content-type': responseContentType,
          'content-disposition': response.headers.get('content-disposition') || '',
        },
      })
    }

    // Default JSON response
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy connection error'
    return NextResponse.json(
      { detail: `Proxy failed to connect to backend: ${message}` },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(req, context)
}

export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(req, context)
}
