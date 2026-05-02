import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <Link href="/demo" className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
        Go to demo →
      </Link>
    </main>
  )
}
