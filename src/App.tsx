import type { ReactNode } from 'react'
import { Link, Route, Routes } from 'react-router'

function Screen({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-950 px-6 py-16 text-center text-slate-100">
      {children}
    </main>
  )
}

function Home() {
  return (
    <Screen>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        NovaExplorer
      </h1>
      <p className="max-w-xl text-lg text-balance text-slate-200">
        Discover the stories that space left behind.
      </p>
      <p className="text-sm font-medium tracking-wide text-slate-300">
        NASA Space Apps Challenge 2026
      </p>
    </Screen>
  )
}

function NotFound() {
  return (
    <Screen>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Page not found
      </h1>
      <p className="max-w-xl text-lg text-slate-200">
        This address is not part of NovaExplorer yet.
      </p>
      <Link
        className="rounded-sm text-slate-100 underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-slate-100"
        to="/"
      >
        Back to home
      </Link>
    </Screen>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
