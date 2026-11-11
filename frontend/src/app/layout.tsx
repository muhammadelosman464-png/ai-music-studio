import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Music Studio — Transform Your Hum Into a Masterpiece',
  description:
    'Professional AI-powered music production studio. Record a melody, describe your style, and get a fully produced track in minutes.',
  keywords: ['AI music', 'music production', 'vocal transformation', 'stem separation'],
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

      </head>
      <body className="bg-[#0a0a0a] text-white antialiased font-sans min-h-screen">
        {/* Ambient background gradients */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-96 -left-96 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[160px]" />
          <div className="absolute -bottom-96 -right-96 w-[800px] h-[800px] bg-gold-dark/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[200px]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
