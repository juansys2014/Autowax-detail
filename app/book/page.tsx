"use client"

import { formatPhone } from '@/lib/utils/format'
import { useState, Suspense, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

const SERVICES = [
  "Professional Detailing",
  "Paint Correction",
  "Ceramic Coating",
  "Paint & Fabric Protection",
  "Ozone Treatment",
  "Headlight Restoration",
  "Window Tint",
  "Paint Protection Film",
]

const HOURS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
]

type VinResult = { display: string; make: string; model: string; year: string; vin: string } | null

const SELLER_REF_KEY = 'aw_seller_ref'

function BookForm() {
  const searchParams = useSearchParams()
  const urlRef = searchParams.get("ref") || ""

  const [sellerRef,  setSellerRef]  = useState(urlRef)
  const [sellerName, setSellerName] = useState("")

  // Persist ref from URL to localStorage; restore it if URL has no ref
  useEffect(() => {
    if (urlRef) {
      localStorage.setItem(SELLER_REF_KEY, urlRef)
      setSellerRef(urlRef)
    } else {
      const stored = localStorage.getItem(SELLER_REF_KEY)
      if (stored) setSellerRef(stored)
    }
  }, [urlRef])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess,    setIsSuccess]    = useState(false)
  const [error,        setError]        = useState("")

  const [formData, setFormData] = useState({
    fullName: "", phone: "", email: "",
    preferredDate: "", time: "",
    make: "", color: "", vin: "", notes: "",
  })

  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // VIN state
  const [vinLoading,  setVinLoading]  = useState(false)
  const [vinResult,   setVinResult]   = useState<VinResult>(null)
  const [vinError,    setVinError]    = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    if (!sellerRef) return
    fetch(`/api/sellers/by-ref?ref=${sellerRef}`)
      .then(r => r.json())
      .then(d => { if (d.name) setSellerName(d.name) })
      .catch(() => {})
  }, [sellerRef])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'vin') { setVinResult(null); setVinError("") }
  }

  function toggleService(s: string) {
    setSelectedServices(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  async function decodeVin(vin: string) {
    if (vin.length !== 17) { setVinError("VIN must be exactly 17 characters"); return }
    setVinLoading(true); setVinError(""); setVinResult(null)
    try {
      const res  = await fetch(`/api/vin?vin=${vin.trim().toUpperCase()}`)
      const data = await res.json()
      if (!res.ok) setVinError(data.error || "Could not decode VIN")
      else {
        setVinResult(data)
        setFormData(prev => ({ ...prev, make: data.display, vin: vin.toUpperCase() }))
      }
    } catch { setVinError("VIN lookup failed. Check your connection.") }
    setVinLoading(false)
  }

  async function startScanner() {
    setShowScanner(true); setVinError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const reader = new BrowserMultiFormatReader()
      scannerRef.current = reader
      reader.decodeFromVideoElement(videoRef.current!, (result) => {
        if (result) {
          const text = result.getText().trim().toUpperCase()
          const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/)
          if (vinMatch) {
            const vin = vinMatch[0]
            setFormData(prev => ({ ...prev, vin }))
            stopScanner()
            decodeVin(vin)
          }
        }
      })
    } catch {
      setVinError("Camera access denied. Please enter VIN manually.")
      setShowScanner(false)
    }
  }

  function stopScanner() {
    scannerRef.current?.reset?.()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setShowScanner(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedServices.length === 0) { setError("Please select at least one service"); return }
    setError(""); setIsSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: selectedServices.join(', '),
          seller_ref: sellerRef,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error submitting request'); setIsSubmitting(false); return }
      localStorage.removeItem(SELLER_REF_KEY)
      setIsSuccess(true)
    } catch { setError('Connection error. Please try again.') }
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-2xl text-foreground mb-3">Request Sent!</h2>
          <p className="text-muted-foreground mb-6">Thank you! We&apos;ll call you shortly to confirm your appointment.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {sellerRef && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded">REFERRAL</span>
            <span className="text-foreground text-sm">
              Referred by <span className="font-semibold text-primary">{sellerName || sellerRef}</span>
            </span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <div className="font-heading text-xl tracking-wider">
              <span className="text-primary">AUTO</span><span className="text-foreground">WAX</span>
            </div>
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">Book an Appointment</h1>
          <p className="text-muted-foreground">Fill out the form and we&apos;ll call you to confirm</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off"
          className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-8">

          {/* 1 — Your Information */}
          <div>
            <h2 className="font-condensed text-lg font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded flex items-center justify-center">1</span>
              Your Information
            </h2>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" name="fullName" required autoComplete="off"
                    value={formData.fullName} onChange={handleChange} placeholder="John Smith"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Phone <span className="text-red-400">*</span></label>
                  <input type="tel" name="phone" required autoComplete="off"
                    value={formatPhone(formData.phone)} onChange={handleChange} placeholder="(561) 000-0000"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"/>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                  <input type="email" name="email" autoComplete="off"
                    value={formData.email} onChange={handleChange} placeholder="john@email.com"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Preferred Date</label>
                  <input type="date" name="preferredDate"
                    value={formData.preferredDate} onChange={handleChange}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors [color-scheme:dark]"/>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Preferred Time</label>
                <div className="grid grid-cols-5 gap-2">
                  {HOURS.map(h => (
                    <button key={h} type="button" onClick={() => setFormData(prev => ({...prev, time: h}))}
                      className={`py-2 rounded-lg border text-xs font-medium transition-colors text-center
                        ${formData.time === h
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-input text-muted-foreground hover:border-primary hover:text-foreground'}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2 — Your Vehicle */}
          <div>
            <h2 className="font-condensed text-lg font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded flex items-center justify-center">2</span>
              Your Vehicle
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">
                  VIN # <span className="text-xs text-muted-foreground">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" name="vin" autoComplete="off"
                    value={formData.vin} onChange={handleChange} maxLength={17}
                    placeholder="17-character VIN"
                    className={`flex-1 bg-input border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors uppercase tracking-wider font-mono text-sm
                      ${vinResult ? 'border-green-500/50' : vinError ? 'border-red-500/50' : 'border-border focus:border-primary'}`}/>
                  <button type="button" onClick={() => showScanner ? stopScanner() : startScanner()}
                    className={`px-3 py-3 rounded-lg border text-sm font-medium transition-colors flex-shrink-0
                      ${showScanner ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-border bg-input text-muted-foreground hover:border-primary hover:text-foreground'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => decodeVin(formData.vin)}
                    disabled={formData.vin.length !== 17 || vinLoading}
                    className="px-3 py-3 rounded-lg border border-border bg-input text-muted-foreground hover:border-primary hover:text-foreground disabled:opacity-40 text-sm transition-colors flex-shrink-0">
                    {vinLoading
                      ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    }
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formData.vin.length}/17</p>
                {showScanner && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border bg-black relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-48 object-cover"/>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3/4 h-16 border-2 border-primary rounded opacity-70"/>
                    </div>
                    <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/70 bg-black/50 py-1">
                      Point camera at VIN barcode
                    </p>
                  </div>
                )}
                {vinResult && (
                  <div className="mt-2 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-sm text-green-400 font-medium">{vinResult.display}</span>
                  </div>
                )}
                {vinError && (
                  <div className="mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span className="text-sm text-red-400">{vinError}</span>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Make & Model</label>
                  <input type="text" name="make" autoComplete="off"
                    value={formData.make} onChange={handleChange} placeholder="Toyota Camry 2023"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Color</label>
                  <input type="text" name="color" autoComplete="off"
                    value={formData.color} onChange={handleChange} placeholder="White"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"/>
                </div>
              </div>
            </div>
          </div>

          {/* 3 — Services */}
          <div>
            <h2 className="font-condensed text-lg font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/20 text-primary text-xs font-bold rounded flex items-center justify-center">3</span>
              Services <span className="text-xs text-muted-foreground normal-case font-normal">(select all that apply)</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map(s => (
                <button key={s} type="button" onClick={() => toggleService(s)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-left transition-colors
                    ${selectedServices.includes(s)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-input text-muted-foreground hover:border-primary hover:text-foreground'}`}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                    ${selectedServices.includes(s) ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {selectedServices.includes(s) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs leading-tight">{s}</span>
                </button>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <p className="text-xs text-primary mt-2">{selectedServices.length} selected: {selectedServices.join(' · ')}</p>
            )}

            <div className="mt-4">
              <label className="block text-sm text-muted-foreground mb-1.5">Additional Notes</label>
              <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange}
                placeholder="Any special requests or details about your vehicle..."
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"/>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-accent-foreground font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            {isSubmitting ? (
              <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>Sending...</>
            ) : "Send Request"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

function BookFormLoading() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
    </main>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<BookFormLoading />}>
      <BookForm />
    </Suspense>
  )
}
