'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ScanQrCode, Loader2, AlertCircle, ExternalLink, Check } from 'lucide-react'

interface ScanResult {
  name: string
  category?: string
  description: string
  healthBenefits?: string[]
  producer?: string
  price?: string
  origin?: string
  aiInfo: string
  isLocalProduct: boolean
  sourceUrl?: string
}

type Status = 'idle' | 'requesting' | 'scanning' | 'processing' | 'result' | 'error'

const BOX = 240

export function QRScannerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(false)

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [rawText, setRawText] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)

  const stopCamera = useCallback(() => {
    activeRef.current = false
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }, [])

  const reset = useCallback(() => {
    stopCamera()
    setStatus('idle')
    setResult(null)
    setRawText('')
    setErrorMsg('')
  }, [stopCamera])

  useEffect(() => {
    if (!open) { reset(); return }
    setStatus('requesting')
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().then(() => setStatus('scanning')).catch(() => setStatus('scanning'))
        }
      })
      .catch((err) => {
        setStatus('error')
        setErrorMsg(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access and try again.'
            : 'Cannot access camera. Check your device settings.',
        )
      })
    return () => stopCamera()
  }, [open, reset, stopCamera])

  useEffect(() => {
    if (status !== 'scanning') return
    activeRef.current = true

    async function tick() {
      if (!activeRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      type JsQRFn = typeof import('jsqr')['default']
      const mod = await import('jsqr')
      const jsQR: JsQRFn = (mod.default ?? mod) as JsQRFn
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })

      if (code?.data) {
        activeRef.current = false
        setRawText(code.data as string)
        setStatus('processing')
        if ('vibrate' in navigator) navigator.vibrate(100)
        try {
          const res = await fetch('/api/product-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: code.data }),
          })
          if (!res.ok) throw new Error()
          setResult(await res.json())
          setStatus('result')
        } catch {
          setStatus('error')
          setErrorMsg('Could not look up this product. Please try again.')
        }
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    tick()
    return () => { activeRef.current = false }
  }, [status])

  if (!open) return null

  const half = BOX / 2

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black shrink-0">
        <div className="flex items-center gap-2">
          <ScanQrCode className="h-5 w-5 text-[var(--highlight)]" />
          <span className="font-semibold text-white text-sm">Scan Local Product</span>
        </div>
        <button
          onClick={() => { reset(); onClose() }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Camera view */}
      {(status === 'requesting' || status === 'scanning') && (
        <div className="flex-1 relative overflow-hidden">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* 4-strip overlay leaving transparent centre box */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 bg-black/55" style={{ height: `calc(50% - ${half}px)` }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/55" style={{ height: `calc(50% - ${half}px)` }} />
            <div className="absolute left-0 bg-black/55"
              style={{ top: `calc(50% - ${half}px)`, bottom: `calc(50% - ${half}px)`, width: `calc(50% - ${half}px)` }} />
            <div className="absolute right-0 bg-black/55"
              style={{ top: `calc(50% - ${half}px)`, bottom: `calc(50% - ${half}px)`, width: `calc(50% - ${half}px)` }} />

            {/* Corner markers + scan line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ width: BOX, height: BOX }}>
                <div className="absolute top-0    left-0  w-7 h-7 border-t-[3px] border-l-[3px] border-[var(--highlight)] rounded-tl-lg" />
                <div className="absolute top-0    right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-[var(--highlight)] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0  w-7 h-7 border-b-[3px] border-l-[3px] border-[var(--highlight)] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-[var(--highlight)] rounded-br-lg" />
                {status === 'scanning' && (
                  <div className="absolute left-1 right-1 h-0.5 bg-[var(--highlight)] shadow-[0_0_8px_2px_var(--highlight)] animate-scanner-line" />
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
            {status === 'requesting' ? (
              <span className="inline-flex items-center gap-2 bg-black/70 text-white text-sm px-5 py-2.5 rounded-full">
                <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
              </span>
            ) : (
              <span className="inline-block bg-black/60 text-white/80 text-sm px-5 py-2.5 rounded-full">
                Point the box at a QR code on any local product
              </span>
            )}
          </div>
        </div>
      )}

      {/* Processing */}
      {status === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
          <div className="w-20 h-20 rounded-full bg-[var(--highlight)]/20 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-[var(--highlight)] animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">QR Code detected!</p>
            <p className="text-white/60 text-sm mt-1">Identifying product…</p>
            <p className="text-white/30 text-[11px] font-mono mt-3 break-all max-w-xs">
              {rawText.slice(0, 60)}{rawText.length > 60 ? '…' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Result */}
      {status === 'result' && result && (
        <div className="flex-1 overflow-y-auto bg-[var(--color-background)]">
          <div className="px-5 py-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,#15803d,#22c55e)' }}>
            <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Product Identified</p>
              {result.isLocalProduct && <p className="text-white/75 text-xs">✓ Cretan / Mediterranean product</p>}
            </div>
          </div>

          <div className="px-5 py-5 space-y-5">
            <div>
              {result.category && (
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--highlight)] mb-1">{result.category}</p>
              )}
              <h2 className="font-display text-2xl font-bold text-[var(--color-foreground)]">{result.name}</h2>
              {result.producer && (
                <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">by {result.producer}</p>
              )}
            </div>

            <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{result.description}</p>

            {(result.healthBenefits ?? []).length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-2">
                  Health Benefits
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.healthBenefits!.map((b) => (
                    <span key={b} className="tag-health">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {result.aiInfo && (
              <div className="rounded-[var(--radius-xl)] bg-[var(--color-muted)] border border-[var(--color-border)] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--highlight)] mb-2">
                  🫒 Cretan Insight
                </p>
                <p className="text-sm text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap">{result.aiInfo}</p>
              </div>
            )}

            {(result.price || result.origin) && (
              <div className="flex gap-6">
                {result.price && (
                  <div>
                    <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Price</p>
                    <p className="text-sm font-bold text-[var(--color-foreground)]">{result.price}</p>
                  </div>
                )}
                {result.origin && (
                  <div>
                    <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Origin</p>
                    <p className="text-sm font-bold text-[var(--color-foreground)]">{result.origin}</p>
                  </div>
                )}
              </div>
            )}

            {result.sourceUrl && (
              <a
                href={result.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-[var(--highlight)] hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Visit product page
              </a>
            )}
          </div>

          <div className="px-5 pb-10">
            <button
              onClick={() => { setResult(null); setRawText(''); setStatus('scanning') }}
              className="w-full py-3 rounded-[var(--radius-full)] border-2 border-[var(--highlight)] text-[var(--highlight)] font-semibold text-sm hover:bg-[var(--highlight)]/10 transition-colors"
            >
              Scan Another Product
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <AlertCircle className="h-14 w-14 text-red-400" />
          <div>
            <p className="text-white font-bold text-lg">Something went wrong</p>
            <p className="text-white/60 text-sm mt-2">{errorMsg}</p>
          </div>
          <button
            onClick={() => { setErrorMsg(''); setStatus('requesting') }}
            className="px-8 py-3 rounded-full bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
