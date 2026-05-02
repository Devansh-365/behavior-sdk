import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'behavior-sdk — Real-time human / bot / AI classification',
  description:
    'Browser-side behavioral analysis SDK. Classifies sessions as human, authorized AI agent, or unauthorized bot using behavioral, fingerprint, and network signals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
