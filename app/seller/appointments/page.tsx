"use client"

import { formatPhone } from '@/lib/utils/format'
import { useState, useEffect, useRef } from "react"
import { X, Check, Search, Plus } from "lucide-react"

const SERVICES = [
  "Professional Detailing","Paint Correction","Ceramic Coating",
  "Paint & Fabric Protection","Ozone Treatment","Headlight Restoration",
  "Window Tint","Paint Protection Film",
]
const HOURS = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"]

type Client = { id: number; name: string; phone: string }
type VinResult = { display: string } | null

export default function SellerAppointmentsPage() {
  const [showModal, setShowModal]           = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [success, setSuccess]               = useState(false)
  const [error, setError]                   = useState("")
  const [sellerId, setSellerId]             = useState<string|null>(null)

  const [clientQuery, setClientQuery]       = useState("")
  const [clientResults, setClientResults]   = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client|null>(null)
  const [isNewClient, setIsNewClient]       = useState(false)
  const [newName, setNewName]               = useState("")
  const [newPhone, setNewPhone]             = useState("")
  const [showDrop, setShowDrop]             = useState(false)

  const [date, setDate]                     = useState("")
  const [time, setTime]                     = useState("")
  const [services, setServices]             = useState<string[]>([])
  const [vehicleMake, setVehicleMake]       = useState("")
  const [vehicleColor, setVehicleColor]     = useState("")
  const [vin, setVin]                       = useState("")
  const [vinLoading, setVinLoading]         = useState(false)
  const [vinResult, setVinResult]           = useState<VinResult>(null)
  const [vinError, setVinError]             = useState("")
  const [showScanner, setShowScanner]       = useState(false)
  const [notes, setNotes]                   = useState("")

  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const scannerRef = useRef<any>(null)
  const searchTimeout = useRef<any>(null)

  useEffect(() => {
    const id = localStorage.getItem('seller_id')
    setSellerId(id)
  }, [])

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    if (!showDrop) return
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clients/search?q=${encodeURIComponent(clientQuery)}`)
        setClientResults((await res.json()).clients || [])
      } catch {}
    }, 200)
  }, [clientQuery, showDrop])

  async function decodeVin(v: string) {
    if (v.length !== 17) { setVinError("VIN must be 17 characters"); return }
    setVinLoading(true); setVinError(""); setVinResult(null)
    try {
      const res  = await fetch(`/api/vin?vin=${v.toUpperCase()}`)
      const data = await res.json()
      if (!res.ok) setVinError(data.error || "Invalid VIN")
      else { setVinResult(data); setVehicleMake(data.display); setVin(v.toUpperCase()) }
    } catch { setVinError("VIN lookup failed") }
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
          const match = text.match(/[A-HJ-NPR-Z0-9]{17}/)
          if (match) { setVin(match[0]); stopScanner(); decodeVin(match[0]) }
        }
      })
    } catch {
      setVinError("Camera access denied. Enter VIN manually.")
      setShowScanner(false)
    }
  }

  function stopScanner() {
    scannerRef.current?.reset?.()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setShowScanner(false)
  }

  function openModal() {
    setDate(""); setTime(""); setServices([]); setVehicleMake(""); setVehicleColor("")
    setVin(""); setVinResult(null); setVinError(""); setShowScanner(false); setNotes("")
    setSelectedClient(null); setIsNewClient(false); setClientQuery(""); setShowDrop(false)
    setNewName(""); setNewPhone(""); setError(""); setSuccess(false)
    setShowModal(true)
    fetch('/api/clients/search?q=').then(r=>r.json()).then(d=>setClientResults(d.clients||[])).catch(()=>{})
  }

  function toggleService(s: string) {
    setServices(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s])
  }

  async function handleSave() {
    if (!selectedClient && !isNewClient) { setError("Select or create a client"); return }
    if (isNewClient && (!newName||!newPhone)) { setError("Name and phone required"); return }
    if (services.length === 0) { setError("Select at least one service"); return }
    if (!date) { setError("Select a date"); return }
    setSaving(true); setError("")
    try {
      let clientId = selectedClient?.id
      if (isNewClient) {
        const cr = await fetch('/api/clients', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ name:newName, phone:newPhone }),
        })
        const cd = await cr.json()
        if (!cr.ok) { setError(cd.error||'Error'); setSaving(false); return }
        clientId = cd.id
      }
      const res = await fetch('/api/appointments', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          fullName: selectedClient?.name || newName,
          phone:    selectedClient?.phone || newPhone,
          service:  services.join(', '),
          preferred_date: date, time,
          vehicle_make: vehicleMake, vehicle_color: vehicleColor, vin, notes,
          client_id: clientId, seller_id: sellerId,
        }),
      })
      if (!res.ok) { const d=await res.json(); setError(d.error||'Error'); setSaving(false); return }
      setSuccess(true)
      setTimeout(() => setShowModal(false), 1500)
    } catch { setError('Connection error') }
    setSaving(false)
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Appointments</h1>
          <p className="text-sm text-neutral-400">Book for your clients</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <p className="text-neutral-400 text-sm mb-4">Book an appointment for a client</p>
        <button onClick={openModal}
          className="px-6 py-2.5 bg-[#4a8fe8] hover:bg-[#3a7fd8] text-white rounded-xl text-sm font-medium transition-colors">
          + New Appointment
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-t-3xl w-full max-w-[430px] max-h-[92vh] flex flex-col"
            style={{colorScheme:'dark'}}>

            {/* Header — sticky */}
            <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a] flex-shrink-0">
              <h3 className="font-semibold text-white">New Appointment</h3>
              <button onClick={()=>setShowModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* Scrollable content — dark scrollbar */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5"
              style={{scrollbarColor:'#3a3a3a #1a1a1a', scrollbarWidth:'thin'}}>

              {success ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500"/>
                  </div>
                  <p className="text-white font-semibold">Appointment Booked!</p>
                  <p className="text-neutral-400 text-sm mt-1">The team will confirm shortly</p>
                </div>
              ) : (
                <>
                  {/* Client */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-neutral-300">Client</label>
                      <button onClick={()=>{setIsNewClient(!isNewClient);setSelectedClient(null);setClientQuery("");setShowDrop(false)}}
                        className="text-xs text-[#4a8fe8]">
                        {isNewClient ? "Search existing" : "+ New client"}
                      </button>
                    </div>
                    {isNewClient ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Full Name *"
                          className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                        <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="Phone *"
                          className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                      </div>
                    ) : selectedClient ? (
                      <div className="flex items-center justify-between bg-[#4a8fe8]/10 border border-[#4a8fe8]/30 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-white text-sm font-medium">{selectedClient.name}</p>
                          <p className="text-neutral-400 text-xs">{formatPhone(selectedClient.phone)}</p>
                        </div>
                        <button onClick={()=>{setSelectedClient(null);setClientQuery("");setShowDrop(true)}} className="text-neutral-400">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"/>
                        <input value={clientQuery}
                          onChange={e=>{setClientQuery(e.target.value);setShowDrop(true)}}
                          onFocus={()=>setShowDrop(true)}
                          onBlur={()=>setTimeout(()=>setShowDrop(false),150)}
                          placeholder="Click or type to search..."
                          className="w-full pl-9 pr-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                        {showDrop && clientResults.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl shadow-xl max-h-40 overflow-y-auto">
                            {clientResults.map(c=>(
                              <button key={c.id} onMouseDown={()=>{setSelectedClient(c);setClientQuery(c.name);setShowDrop(false)}}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] text-left border-b border-[#2a2a2a] last:border-0">
                                <p className="text-white text-sm">{c.name}</p>
                                <p className="text-neutral-500 text-xs">{formatPhone(c.phone)}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">Date *</label>
                      <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-[#4a8fe8] text-sm [color-scheme:dark]"/>
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">Time</label>
                      <select value={time} onChange={e=>setTime(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-[#4a8fe8] text-sm">
                        <option value="">-- No time --</option>
                        {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Services * <span className="text-neutral-600 text-xs">(select all that apply)</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICES.map(s=>(
                        <button key={s} type="button" onClick={()=>toggleService(s)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors
                            ${services.includes(s)
                              ? 'border-[#4a8fe8] bg-[#4a8fe8]/10 text-white'
                              : 'border-[#2a2a2a] bg-[#0f0f0f] text-neutral-400'}`}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${services.includes(s)?'border-[#4a8fe8] bg-[#4a8fe8]':'border-[#3a3a3a]'}`}>
                            {services.includes(s)&&<Check className="w-3 h-3 text-white"/>}
                          </div>
                          <span className="text-xs leading-tight">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle + VIN */}
                  <div className="space-y-3">
                    <label className="block text-sm text-neutral-400">Vehicle</label>
                    {/* VIN */}
                    <div>
                      <div className="flex gap-2">
                        <input value={vin}
                          onChange={e=>{setVin(e.target.value.toUpperCase());setVinResult(null);setVinError("")}}
                          maxLength={17} placeholder="VIN # (optional)"
                          className={`flex-1 px-4 py-2.5 bg-[#0f0f0f] border rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4a8fe8] text-sm font-mono uppercase
                            ${vinResult?'border-green-500/50':vinError?'border-red-500/50':'border-[#2a2a2a]'}`}/>
                        {/* Scanner */}
                        <button type="button" onClick={()=>showScanner?stopScanner():startScanner()}
                          className={`px-3 py-2.5 rounded-xl border text-sm transition-colors flex-shrink-0
                            ${showScanner?'border-red-500 bg-red-500/10 text-red-400':'border-[#2a2a2a] bg-[#0f0f0f] text-neutral-400 hover:border-[#4a8fe8] hover:text-white'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                          </svg>
                        </button>
                        {/* Lookup */}
                        <button type="button" onClick={()=>decodeVin(vin)} disabled={vin.length!==17||vinLoading}
                          className="px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] hover:border-[#4a8fe8] rounded-xl text-neutral-400 hover:text-white disabled:opacity-40 text-xs font-medium transition-colors flex-shrink-0 min-w-[56px] flex items-center justify-center">
                          {vinLoading
                            ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            : "Look"}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">{vin.length}/17</p>
                      {showScanner && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-[#2a2a2a] bg-black relative">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-40 object-cover"/>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-3/4 h-12 border-2 border-[#4a8fe8] rounded opacity-70"/>
                          </div>
                          <p className="absolute bottom-1 left-0 right-0 text-center text-xs text-white/70 bg-black/50 py-1">
                            Point at VIN barcode
                          </p>
                        </div>
                      )}
                      {vinResult && (
                        <div className="mt-1 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0"/>
                          <span className="text-xs text-green-400">{vinResult.display}</span>
                        </div>
                      )}
                      {vinError && (
                        <p className="text-xs text-red-400 mt-1">✗ {vinError}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={vehicleMake} onChange={e=>setVehicleMake(e.target.value)} placeholder="Make & Model"
                        className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                      <input value={vehicleColor} onChange={e=>setVehicleColor(e.target.value)} placeholder="Color"
                        className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Notes</label>
                    <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                      placeholder="Additional notes..."
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#4a8fe8] text-sm resize-none"/>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <div className="flex gap-3 pb-4">
                    <button onClick={()=>setShowModal(false)}
                      className="flex-1 py-3 border border-[#2a2a2a] text-neutral-400 rounded-xl text-sm font-medium">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 py-3 bg-[#e8151a] hover:bg-[#c91016] disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                      {saving?'Saving...':<><Check className="w-4 h-4"/>Book</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
