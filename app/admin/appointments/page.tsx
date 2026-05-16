"use client"

import { formatPhone } from '@/lib/utils/format'
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Phone, X, Check, Car, Calendar, Plus, Search, Edit2 } from "lucide-react"

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const HOURS  = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"]
const SERVICES = [
  "Professional Detailing","Paint Correction","Ceramic Coating",
  "Paint & Fabric Protection","Ozone Treatment","Headlight Restoration",
  "Window Tint","Paint Protection Film",
]

type Appointment = {
  id: number; time?: string; client_name: string; client_phone?: string
  service: string; vehicle_make?: string; vehicle_color?: string; vin?: string
  seller_name?: string; status: string; preferred_date?: string; notes?: string
  client_id?: number
}
type Client = { id: number; name: string; phone: string; seller_name?: string }

const MOCK: Record<string, Appointment[]> = {
  "2026-05-15": [
    { id:1,  time:"9:00 AM",  client_name:"John Martinez",  service:"Professional Detailing",                   vehicle_make:"BMW M4 2024",         vehicle_color:"Black", client_phone:"5611234567", seller_name:"Carlos Reyes", status:"confirmed" },
    { id:2,  time:"11:00 AM", client_name:"Sarah Johnson",  service:"Ceramic Coating",                          vehicle_make:"Tesla Model S 2023",  vehicle_color:"White", client_phone:"5612345678", status:"confirmed" },
    { id:3,  time:"2:00 PM",  client_name:"Mike Wilson",    service:"Paint & Fabric Protection, Ozone Treatment",vehicle_make:"Mercedes GLE 2022",   vehicle_color:"Gray",  client_phone:"5613456789", seller_name:"Ana Lopez", status:"pending" },
  ],
  "2026-05-16": [
    { id:4,  time:"10:00 AM", client_name:"Emily Davis",    service:"Paint Correction",       vehicle_make:"Porsche 911 2023",    client_phone:"5614567890", status:"confirmed" },
  ],
  "2026-05-17": [
    { id:5,  time:"9:00 AM",  client_name:"Robert Chen",    service:"Professional Detailing", vehicle_make:"Audi RS6 2024",       client_phone:"5615678901", seller_name:"Carlos Reyes", status:"pending" },
    { id:6,  time:"1:00 PM",  client_name:"Lisa Anderson",  service:"Ceramic Coating, Window Tint", vehicle_make:"Range Rover 2023", client_phone:"5616789012", status:"confirmed" },
  ],
  "2026-05-18": [
    { id:7,  time:"9:00 AM",  client_name:"David Kim",      service:"Professional Detailing", vehicle_make:"Lamborghini Urus",    client_phone:"5617890123", seller_name:"Ana Lopez", status:"confirmed" },
    { id:8,  time:"11:00 AM", client_name:"Jennifer White", service:"Ozone Treatment",        vehicle_make:"BMW X7 2022",         client_phone:"5618901234", status:"pending" },
    { id:9,  time:"2:00 PM",  client_name:"Tom Harris",     service:"Paint Correction",       vehicle_make:"Ferrari F8 2023",     client_phone:"5619012345", seller_name:"Carlos Reyes", status:"cancelled" },
    { id:10, time:"4:00 PM",  client_name:"Amanda Brown",   service:"Professional Detailing", vehicle_make:"McLaren 750S 2024",   client_phone:"5610123456", status:"confirmed" },
  ],
  "2026-05-20": [
    { id:11, time:"10:00 AM", client_name:"Chris Taylor",   service:"Ceramic Coating",        vehicle_make:"Bentley Continental", client_phone:"5611234500", seller_name:"Ana Lopez", status:"pending" },
  ],
  "2026-05-22": [
    { id:12, time:"9:00 AM",  client_name:"Rachel Green",   service:"Professional Detailing", vehicle_make:"Rolls Royce Ghost",   client_phone:"5612345600", seller_name:"Carlos Reyes", status:"confirmed" },
    { id:13, time:"2:00 PM",  client_name:"Mark Stevens",   service:"Ozone Treatment",        vehicle_make:"Maserati Levante",    client_phone:"5613456700", status:"pending" },
  ],
}

const STATUS_DOT: Record<string,string>   = { pending:"bg-yellow-500", confirmed:"bg-green-500", cancelled:"bg-red-500", completed:"bg-[#4a8fe8]" }
const STATUS_BADGE: Record<string,string> = {
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-[#4a8fe8]/10 text-[#4a8fe8] border-[#4a8fe8]/20",
}

const emptyForm = () => ({
  date: "", time: "", services: [] as string[], notes: "",
  vehicle_make: "", vehicle_color: "", vin: "",
})

export default function AppointmentsPage() {
  const [currentDate,    setCurrentDate]    = useState(new Date(2026, 4, 15))
  const [selectedDate,   setSelectedDate]   = useState<string|null>(null)
  const [apiApts,        setApiApts]        = useState<Appointment[]>([])
  const [saving,         setSaving]         = useState(false)
  const [showModal,      setShowModal]      = useState(false)
  const [editingApt,     setEditingApt]     = useState<Appointment|null>(null)

  const [form,           setForm]           = useState(emptyForm())
  const [clientQuery,    setClientQuery]    = useState("")
  const [clientResults,  setClientResults]  = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client|null>(null)
  const [isNewClient,    setIsNewClient]    = useState(false)
  const [newName,        setNewName]        = useState("")
  const [newPhone,       setNewPhone]       = useState("")
  const [showClientDrop, setShowClientDrop] = useState(false)
  const [vinLoading,     setVinLoading]     = useState(false)
  const [vinResult,      setVinResult]      = useState("")
  const [vinError,       setVinError]       = useState("")
  const [formError,      setFormError]      = useState("")
  const searchTimeout = useRef<any>(null)

  const year        = currentDate.getFullYear()
  const month       = currentDate.getMonth()
  const todayStr    = new Date().toISOString().split('T')[0]
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()

  useEffect(() => {
    loadApts()
  }, [])

  async function loadApts() {
    try {
      const res = await fetch('/api/appointments')
      setApiApts((await res.json()).appointments||[])
    } catch {}
  }

  function getAptsForKey(key: string): Appointment[] {
    const real = apiApts.filter(a => {
      if (!a.preferred_date) return false
      const d = a.preferred_date.includes('T') ? a.preferred_date.split('T')[0] : a.preferred_date
      return d === key
    })
    return [...(MOCK[key]||[]), ...real]
  }

  function getDayKey(day: number) {
    return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }

  const selectedApts  = selectedDate ? getAptsForKey(selectedDate) : []
  const selectedLabel = selectedDate
    ? new Date(selectedDate+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})
    : ''

  async function updateStatus(id: number, status: string) {
    setSaving(true)
    try {
      await fetch('/api/appointments/update', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id, status, confirmed_by:1 }),
      })
      await loadApts()
    } catch {}
    setSaving(false)
  }

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clients/search?q=${encodeURIComponent(clientQuery)}`)
        setClientResults((await res.json()).clients||[])
      } catch {}
    }, 200)
  }, [clientQuery])

  function openNew(preDate?: string) {
    setEditingApt(null)
    setForm({ ...emptyForm(), date: preDate || selectedDate || todayStr })
    resetClientFields()
    setShowModal(true)
    fetch('/api/clients/search?q=').then(r=>r.json()).then(d=>setClientResults(d.clients||[])).catch(()=>{})
  }

  function openEdit(apt: Appointment) {
    setEditingApt(apt)
    const dateStr = apt.preferred_date
      ? (apt.preferred_date.includes('T') ? apt.preferred_date.split('T')[0] : apt.preferred_date)
      : ""
    setForm({
      date:          dateStr,
      time:          apt.time || "",
      services:      apt.service ? apt.service.split(',').map(s=>s.trim()).filter(Boolean) : [],
      notes:         apt.notes || "",
      vehicle_make:  apt.vehicle_make || "",
      vehicle_color: apt.vehicle_color || "",
      vin:           apt.vin || "",
    })
    // For mock appointments, just show client name
    setSelectedClient(apt.client_id ? { id: apt.client_id, name: apt.client_name, phone: apt.client_phone||"" } : null)
    setIsNewClient(false)
    setClientQuery(apt.client_name)
    setShowClientDrop(false)
    setVinResult(apt.vehicle_make ? `Loaded: ${apt.vehicle_make}` : "")
    setVinError("")
    setFormError("")
    setShowModal(true)
  }

  function resetClientFields() {
    setSelectedClient(null); setIsNewClient(false)
    setClientQuery(""); setClientResults([]); setShowClientDrop(false)
    setNewName(""); setNewPhone("")
    setVinResult(""); setVinError(""); setFormError("")
  }

  function toggleService(s: string) {
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x=>x!==s) : [...f.services, s]
    }))
  }

  async function decodeVin(vin: string) {
    if (vin.length !== 17) { setVinError("VIN must be 17 characters"); return }
    setVinLoading(true); setVinError(""); setVinResult("")
    try {
      const res  = await fetch(`/api/vin?vin=${vin.toUpperCase()}`)
      const data = await res.json()
      if (!res.ok) setVinError(data.error||"Invalid VIN")
      else {
        setVinResult(data.display)
        setForm(f=>({...f, vehicle_make: data.display, vin: vin.toUpperCase()}))
      }
    } catch { setVinError("VIN lookup failed") }
    setVinLoading(false)
  }

  async function handleSave() {
    if (form.services.length === 0) { setFormError("Select at least one service"); return }
    if (!form.date) { setFormError("Select a date"); return }

    // Editing existing appointment
    if (editingApt) {
      setSaving(true); setFormError("")
      try {
        await fetch('/api/appointments/update', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            id:            editingApt.id,
            service:       form.services.join(', '),
            preferred_date: form.date,
            time:          form.time,
            vehicle_make:  form.vehicle_make,
            vehicle_color: form.vehicle_color,
            vin:           form.vin,
            notes:         form.notes,
          }),
        })
        setShowModal(false)
        await loadApts()
        if (form.date) setSelectedDate(form.date)
      } catch { setFormError('Connection error') }
      setSaving(false)
      return
    }

    // New appointment
    if (!selectedClient && !isNewClient) { setFormError("Select or create a client"); return }
    if (isNewClient && (!newName||!newPhone)) { setFormError("Name and phone required"); return }
    setSaving(true); setFormError("")
    try {
      let clientId = selectedClient?.id
      if (isNewClient) {
        const cr = await fetch('/api/clients', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ name:newName, phone:newPhone }),
        })
        const cd = await cr.json()
        if (!cr.ok) { setFormError(cd.error||'Error creating client'); setSaving(false); return }
        clientId = cd.id
      }
      const res = await fetch('/api/appointments', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          fullName:       selectedClient?.name || newName,
          phone:          selectedClient?.phone || newPhone,
          service:        form.services.join(', '),
          preferred_date: form.date,
          time:           form.time,
          vehicle_make:   form.vehicle_make,
          vehicle_color:  form.vehicle_color,
          vin:            form.vin,
          notes:          form.notes,
          client_id:      clientId,
        }),
      })
      if (!res.ok) { const d=await res.json(); setFormError(d.error||'Error'); setSaving(false); return }
      setShowModal(false)
      await loadApts()
      if (form.date) setSelectedDate(form.date)
    } catch { setFormError('Connection error') }
    setSaving(false)
  }

  function getAptsByHour(hour: string) {
    return selectedApts.filter(a => a.time?.toLowerCase().replace(' ','') === hour.toLowerCase().replace(' ',''))
  }

  return (
    <div className="space-y-6 p-4 md:p-0">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          <p className="text-sm text-gray-400">Manage your appointment calendar</p>
        </div>
        <button onClick={() => openNew()}
          className="flex items-center gap-2 px-4 py-2 bg-[#e8151a] hover:bg-[#c91016] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4"/> New Appointment
        </button>
      </div>

      <div className="flex gap-6 items-start">

        {/* CALENDAR */}
        <div className={`transition-all duration-300 ${selectedDate ? 'flex-shrink-0' : 'w-full'}`}>
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4" style={{minWidth: selectedDate ? '340px' : undefined}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{MONTHS[month]} {year}</h2>
              <div className="flex gap-2">
                <button onClick={()=>setCurrentDate(new Date(year,month-1,1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <button onClick={()=>setCurrentDate(new Date(year,month+1,1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map(d=><div key={d} className="py-1 text-center text-xs font-medium text-gray-500">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day  = i+1
                const key  = getDayKey(day)
                const apts = getAptsForKey(key)
                const isToday    = key===todayStr
                const isSelected = key===selectedDate
                return (
                  <button key={day} onClick={()=>setSelectedDate(isSelected?null:key)}
                    className={`h-12 rounded-lg p-1 flex flex-col items-center justify-start pt-1 gap-0.5 transition-colors
                      ${isSelected?'bg-[#4a8fe8]':isToday?'ring-2 ring-[#e8151a] hover:bg-[#2a2a2a]':'hover:bg-[#2a2a2a]'}`}>
                    <span className={`font-medium text-sm ${isSelected?'text-white':isToday?'text-[#e8151a]':'text-white'}`}>{day}</span>
                    {apts.length>0&&(
                      <div className="flex flex-wrap justify-center gap-0.5">
                        {apts.slice(0,4).map((a,j)=>(
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${isSelected?'bg-white/70':STATUS_DOT[a.status]||'bg-gray-500'}`}/>
                        ))}
                        {apts.length>4&&<span className="text-[9px] text-gray-600">+{apts.length-4}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex flex-wrap gap-4">
              {[['pending','Pending','bg-yellow-500'],['confirmed','Confirmed','bg-green-500'],['cancelled','Cancelled','bg-red-500'],['completed','Completed','bg-[#4a8fe8]']].map(([s,l,c])=>(
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${c}`}/>
                  <span className="text-xs text-gray-500">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DAY PANEL */}
        {selectedDate && (
          <div className="flex-1 min-w-0">
            <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl flex flex-col" style={{maxHeight:'calc(100vh - 220px)'}}>
              <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] flex-shrink-0">
                <div>
                  <p className="text-white font-semibold">{selectedLabel}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedApts.length} appointment{selectedApts.length!==1?'s':''}</p>
                </div>
                <button onClick={()=>setSelectedDate(null)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {selectedApts.length===0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="w-10 h-10 text-gray-700 mb-3"/>
                    <p className="text-gray-500 text-sm">No appointments this day</p>
                    <button onClick={()=>openNew(selectedDate)} className="mt-3 text-xs text-[#4a8fe8] hover:underline">+ Add appointment</button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {HOURS.map(hour=>{
                      const apts = getAptsByHour(hour)
                      return (
                        <div key={hour} className="flex gap-3">
                          <span className="text-xs text-gray-600 w-16 flex-shrink-0 text-right pt-3 font-mono">{hour}</span>
                          <div className="flex-1">
                            {apts.length===0
                              ? <div className="border-b border-dashed border-[#222] my-3"/>
                              : <div className="space-y-2 pb-2">
                                  {apts.map(apt=>(
                                    <AppCard key={apt.id} apt={apt} onUpdate={updateStatus} onEdit={openEdit} saving={saving}/>
                                  ))}
                                </div>
                            }
                          </div>
                        </div>
                      )
                    })}
                    {selectedApts.filter(a=>!a.time).length>0&&(
                      <div className="pt-3 border-t border-[#2a2a2a]">
                        <p className="text-xs text-gray-600 mb-2 pl-[76px]">No time specified</p>
                        {selectedApts.filter(a=>!a.time).map(apt=>(
                          <div key={apt.id} className="flex gap-3">
                            <span className="w-16 flex-shrink-0"/>
                            <div className="flex-1 pb-2">
                              <AppCard apt={apt} onUpdate={updateStatus} onEdit={openEdit} saving={saving}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL (New & Edit) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white text-lg">
                {editingApt ? `Edit Appointment` : 'New Appointment'}
              </h3>
              <button onClick={()=>setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">

              {/* CLIENT — show name only when editing */}
              {editingApt ? (
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">Client</p>
                  <p className="text-white font-medium">{editingApt.client_name}</p>
                  {editingApt.client_phone && <p className="text-gray-400 text-xs">{editingApt.client_phone}</p>}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Client</label>
                    <button onClick={()=>{setIsNewClient(!isNewClient);setSelectedClient(null);setClientQuery("");setShowClientDrop(false)}}
                      className="text-xs text-[#4a8fe8] hover:underline">
                      {isNewClient?"Search existing":"+ New client"}
                    </button>
                  </div>
                  {isNewClient ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Full Name *"
                        className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                      <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="Phone *"
                        className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                    </div>
                  ) : selectedClient ? (
                    <div className="flex items-center justify-between bg-[#4a8fe8]/10 border border-[#4a8fe8]/30 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{selectedClient.name}</p>
                        <p className="text-gray-400 text-xs">{formatPhone(selectedClient.phone)}</p>
                      </div>
                      <button onClick={()=>{setSelectedClient(null);setClientQuery("");setShowClientDrop(true)}} className="text-gray-400 hover:text-white ml-3">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                      <input value={clientQuery}
                        onChange={e=>{setClientQuery(e.target.value);setShowClientDrop(true)}}
                        onFocus={()=>setShowClientDrop(true)}
                        onBlur={()=>setTimeout(()=>setShowClientDrop(false),150)}
                        placeholder="Click or type to search..."
                        className="w-full pl-9 pr-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                      {showClientDrop && clientResults.length>0 && (
                        <div className="absolute z-20 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl max-h-44 overflow-y-auto">
                          {clientResults.map(c=>(
                            <button key={c.id} onMouseDown={()=>{setSelectedClient(c);setClientQuery(c.name);setShowClientDrop(false)}}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] text-left border-b border-[#2a2a2a] last:border-0">
                              <p className="text-white text-sm">{c.name}</p>
                              <p className="text-gray-500 text-xs">{formatPhone(c.phone)}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* DATE & TIME */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Date *</label>
                  <input type="date" value={form.date}
                    onChange={e=>setForm(f=>({...f, date:e.target.value}))}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#4a8fe8] text-sm [color-scheme:dark]"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time</label>
                  <select value={form.time} onChange={e=>setForm(f=>({...f, time:e.target.value}))}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#4a8fe8] text-sm">
                    <option value="">-- No time --</option>
                    {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* SERVICES */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Services * <span className="text-gray-600 text-xs">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map(s=>(
                    <button key={s} type="button" onClick={()=>toggleService(s)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors
                        ${form.services.includes(s)
                          ? 'border-[#4a8fe8] bg-[#4a8fe8]/10 text-white'
                          : 'border-[#2a2a2a] bg-[#0f0f0f] text-gray-400 hover:border-[#3a3a3a] hover:text-white'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                        ${form.services.includes(s) ? 'border-[#4a8fe8] bg-[#4a8fe8]' : 'border-[#3a3a3a]'}`}>
                        {form.services.includes(s)&&<Check className="w-3 h-3 text-white"/>}
                      </div>
                      <span className="text-xs leading-tight">{s}</span>
                    </button>
                  ))}
                </div>
                {form.services.length>0&&(
                  <p className="text-xs text-[#4a8fe8] mt-2">{form.services.length} selected: {form.services.join(' · ')}</p>
                )}
              </div>

              {/* VEHICLE */}
              <div className="space-y-3">
                <label className="block text-sm text-gray-400">Vehicle</label>
                <div>
                  <div className="flex gap-2">
                    <input value={form.vin}
                      onChange={e=>{setForm(f=>({...f,vin:e.target.value.toUpperCase()}));setVinResult("");setVinError("")}}
                      maxLength={17} placeholder="VIN # (optional — 17 chars)"
                      className={`flex-1 px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm font-mono tracking-wider uppercase
                        ${vinResult?'border-green-500/50':vinError?'border-red-500/50':'border-[#2a2a2a]'}`}/>
                    <button type="button" onClick={()=>decodeVin(form.vin)}
                      disabled={form.vin.length!==17||vinLoading}
                      className="px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] hover:border-[#4a8fe8] rounded-lg text-gray-400 hover:text-white disabled:opacity-40 text-xs font-medium transition-colors flex-shrink-0 min-w-[60px] flex items-center justify-center">
                      {vinLoading
                        ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        : "Lookup"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{form.vin.length}/17</p>
                  {vinResult&&<p className="text-xs text-green-400 mt-1">✓ {vinResult}</p>}
                  {vinError&&<p className="text-xs text-red-400 mt-1">✗ {vinError}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.vehicle_make} onChange={e=>setForm(f=>({...f,vehicle_make:e.target.value}))}
                    placeholder="Make & Model"
                    className="px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                  <input value={form.vehicle_color} onChange={e=>setForm(f=>({...f,vehicle_color:e.target.value}))}
                    placeholder="Color"
                    className="px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm"/>
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm resize-none"/>
              </div>

              {formError&&<p className="text-sm text-red-400">{formError}</p>}
            </div>

            <div className="flex gap-3 p-6 border-t border-[#2a2a2a]">
              <button onClick={()=>setShowModal(false)}
                className="flex-1 py-3 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-[#e8151a] hover:bg-[#c91016] disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                {saving ? 'Saving...' : <><Check className="w-4 h-4"/>{editingApt ? 'Save Changes' : 'Save Appointment'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AppCard({ apt, onUpdate, onEdit, saving }: {
  apt: Appointment
  onUpdate: (id:number, s:string) => void
  onEdit:   (apt:Appointment) => void
  saving:   boolean
}) {
  return (
    <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a]">
        {apt.time && <span className="text-xs text-gray-500 font-mono">{apt.time}</span>}
        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[apt.status]||''}`}>{apt.status}</span>
          <button onClick={()=>onEdit(apt)}
            className="p-1 text-gray-600 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            title="Edit appointment">
            <Edit2 className="w-3 h-3"/>
          </button>
        </div>
      </div>

      {/* 3 columns */}
      <div className="grid grid-cols-3 gap-0 divide-x divide-[#1a1a1a]">
        {/* Client */}
        <div className="p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Client</p>
          <p className="text-white font-semibold text-sm leading-tight">{apt.client_name}</p>
          {apt.client_phone && (
            <a href={`tel:${formatPhone(apt.client_phone)}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#4a8fe8] transition-colors">
              <Phone className="w-3 h-3 flex-shrink-0"/>
              <span>{formatPhone(apt.client_phone)}</span>
            </a>
          )}
          {apt.seller_name && apt.seller_name !== 'Direct' && (
            <p className="text-xs text-gray-600">Ref: <span className="text-[#4a8fe8]">{apt.seller_name}</span></p>
          )}
        </div>

        {/* Vehicle */}
        <div className="p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Vehicle</p>
          {apt.vehicle_make ? (
            <div className="flex items-start gap-1">
              <Car className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5"/>
              <p className="text-white text-xs leading-tight">{apt.vehicle_make}</p>
            </div>
          ) : <p className="text-gray-600 text-xs">—</p>}
          {apt.vehicle_color && <p className="text-xs text-gray-500">{apt.vehicle_color}</p>}
          {apt.vin && (
            <p className="text-[10px] text-gray-600 font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded leading-tight break-all">{apt.vin}</p>
          )}
        </div>

        {/* Services */}
        <div className="p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Services</p>
          <div className="flex flex-col gap-1">
            {apt.service.split(',').map(s=>(
              <span key={s} className="text-xs bg-[#4a8fe8]/10 text-[#4a8fe8] px-2 py-0.5 rounded border border-[#4a8fe8]/20 leading-tight text-center">{s.trim()}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {apt.notes && (
        <div className="px-3 pb-2 border-t border-[#1a1a1a]">
          <p className="text-xs text-gray-600 italic pt-2">{apt.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 px-3 py-2 border-t border-[#1a1a1a] flex-wrap">
        {apt.status==='pending' && (
          <button onClick={()=>onUpdate(apt.id,'confirmed')} disabled={saving}
            className="flex items-center gap-1 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded text-xs font-medium transition-colors">
            <Check className="w-3 h-3"/> Confirm
          </button>
        )}
        {apt.status==='confirmed' && (
          <button onClick={()=>onUpdate(apt.id,'completed')} disabled={saving}
            className="flex items-center gap-1 px-2 py-1 bg-[#4a8fe8]/10 hover:bg-[#4a8fe8]/20 text-[#4a8fe8] border border-[#4a8fe8]/20 rounded text-xs font-medium transition-colors">
            <Check className="w-3 h-3"/> Done
          </button>
        )}
        {apt.status!=='cancelled' && apt.status!=='completed' && (
          <button onClick={()=>onUpdate(apt.id,'cancelled')} disabled={saving}
            className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-xs font-medium transition-colors">
            <X className="w-3 h-3"/> Cancel
          </button>
        )}
        {apt.client_phone && (
          <a href={`tel:${formatPhone(apt.client_phone)}`}
            className="flex items-center gap-1 px-2 py-1 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-400 border border-[#2a2a2a] rounded text-xs font-medium transition-colors ml-auto">
            <Phone className="w-3 h-3"/> Call
          </a>
        )}
      </div>
    </div>
  )
}
