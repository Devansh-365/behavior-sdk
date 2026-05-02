'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { BehaviorScanner } from 'behavior-sdk'
import type { BehaviorPayload } from 'behavior-sdk'

export interface ScannerHandle {
  payload: BehaviorPayload | null
  sessionId: string
  elapsedMs: number
  submitted: boolean
  formRef: React.RefObject<HTMLFormElement | null>
  submit: () => BehaviorPayload | null
  reset: () => void
}

export function useScanner(): ScannerHandle {
  const formRef = useRef<HTMLFormElement>(null)
  const scannerRef = useRef<BehaviorScanner | null>(null)
  const startedAtRef = useRef<number>(0)
  const intervalRef = useRef<number | null>(null)

  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID())
  const [payload, setPayload] = useState<BehaviorPayload | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)
  const [submitted, setSubmitted] = useState<boolean>(false)

  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const scanner = new BehaviorScanner().attach(form)
    scannerRef.current = scanner
    startedAtRef.current = performance.now()

    const tick = (): void => {
      if (!scannerRef.current) return
      setPayload(scannerRef.current.buildPayload(sessionId))
      setElapsedMs(performance.now() - startedAtRef.current)
    }

    tick()
    intervalRef.current = window.setInterval(tick, 250)

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current)
      intervalRef.current = null
      scanner.detach()
      scannerRef.current = null
    }
  }, [sessionId])

  const submit = useCallback((): BehaviorPayload | null => {
    if (!scannerRef.current) return null
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const finalPayload = scannerRef.current.buildPayload(sessionId)
    setPayload(finalPayload)
    setSubmitted(true)
    return finalPayload
  }, [sessionId])

  const reset = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    scannerRef.current?.detach()
    scannerRef.current = null
    setSubmitted(false)
    setPayload(null)
    setElapsedMs(0)
    setSessionId(crypto.randomUUID())
  }, [])

  return { payload, sessionId, elapsedMs, submitted, formRef, submit, reset }
}
