import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // allow up to 5 minutes on Vercel Pro, or standard execution

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8000'

    const targetUrl = `${backendUrl.replace(/\/+$/, '')}/api/v1/studio/produce`

    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { detail: `Backend error (${response.status}): ${errText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error'
    return NextResponse.json(
      { detail: `Failed to reach backend: ${message}` },
      { status: 502 }
    )
  }
}
