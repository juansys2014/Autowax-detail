"use client"

import { formatPhone } from '@/lib/utils/format'
import { useState, useEffect, useRef } from "react"
import { Search, FileText, Plus, X, Check, DollarSign, Printer, Pencil, Trash2 } from "lucide-react"

type Invoice = {
  id: number; invoice_number: string; client_name: string; client_phone: string
  total: number; payment_method: string; status: string; paid_at: string | null; created_at: string
  seller_name: string | null
}
type Stats = { month_revenue: number; month_invoices: number; avg_ticket: number; pending_revenue: number }
type Client = { id: number; name: string; phone: string; email: string | null; seller_name: string | null; last_service: string | null }
type CatalogItem = { id: number; name: string; category: string; price: number }
type LineItem = { description: string; quantity: number; unit_price: number; showDrop: boolean }

const PAY_METHODS = [
  { value: "cash",  label: "Cash",  icon: "💵" },
  { value: "card",  label: "Card",  icon: "💳" },
  { value: "zelle", label: "Zelle", icon: "📱" },
  { value: "venmo", label: "Venmo", icon: "🅥" },
]

const today = new Date().toISOString().split('T')[0]
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState(firstOfMonth)
  const [dateTo, setDateTo] = useState(today)
  const [datePreset, setDatePreset] = useState("month")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [clientQuery, setClientQuery] = useState("")
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isNewClient, setIsNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [showClientDrop, setShowClientDrop] = useState(false)
  const searchTimeout = useRef<any>(null)

  const emptyItem = (): LineItem => ({ description: "", quantity: 1, unit_price: 0, showDrop: false })
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [payMethod, setPayMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [payModalMethod, setPayModalMethod] = useState("cash")

  type InvoiceDetail = Invoice & { items?: {description:string;quantity:number;unit_price:number;total:number}[] }
  const [showViewModal,   setShowViewModal]   = useState<InvoiceDetail | null>(null)
  const [showEditModal,   setShowEditModal]   = useState<InvoiceDetail | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<Invoice | null>(null)
  const [editItems,       setEditItems]       = useState<LineItem[]>([emptyItem()])
  const [editPayMethod,   setEditPayMethod]   = useState("cash")
  const [editNotes,       setEditNotes]       = useState("")
  const [deleting,        setDeleting]        = useState(false)
  const [editError,       setEditError]       = useState("")
  const [adminConfirm,    setAdminConfirm]    = useState<{action:'edit'|'delete', invoice:Invoice}|null>(null)

  useEffect(() => { loadData(); loadCatalog() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      setInvoices(data.invoices || [])
      setStats(data.stats || null)
    } catch {}
    setLoading(false)
  }

  async function loadCatalog() {
    try {
      const res = await fetch('/api/catalog')
      const data = await res.json()
      setCatalog(data.items || [])
    } catch {}
  }

  async function searchClients(q: string) {
    try {
      const res = await fetch(`/api/clients/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setClientResults(data.clients || [])
    } catch {}
  }

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchClients(clientQuery), 200)
  }, [clientQuery])

  function applyPreset(preset: string) {
    const now = new Date()
    const t = now.toISOString().split('T')[0]
    setDatePreset(preset)
    if (preset === 'today') { setDateFrom(t); setDateTo(t) }
    else if (preset === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay())
      setDateFrom(start.toISOString().split('T')[0]); setDateTo(t)
    }
    else if (preset === 'month') { setDateFrom(firstOfMonth); setDateTo(t) }
    else if (preset === 'all') { setDateFrom(''); setDateTo('') }
  }

  function openNewInvoice() {
    setSelectedClient(null); setIsNewClient(false)
    setClientQuery(""); setClientResults([]); setShowClientDrop(false)
    setNewClientName(""); setNewClientPhone("")
    setItems([emptyItem()])
    setPayMethod("cash"); setNotes(""); setError("")
    setShowModal(true)
    searchClients("")
  }

  function selectClient(c: Client) {
    setSelectedClient(c); setClientQuery(c.name)
    setClientResults([]); setShowClientDrop(false)
  }

  function pickCatalog(idx: number, cat: CatalogItem) {
    setItems(prev => prev.map((item, i) => i === idx
      ? { ...item, description: cat.name, unit_price: cat.price, showDrop: false }
      : item))
  }

  function updateItem(idx: number, field: keyof LineItem, value: any) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function addItem() { setItems(prev => [...prev, emptyItem()]) }
  function removeItem(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)) }

  const subtotal = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unit_price), 0)

  async function handleCreateInvoice(markPaid: boolean) {
    if (!selectedClient && !isNewClient) { setError("Select or create a client"); return }
    if (isNewClient && (!newClientName || !newClientPhone)) { setError("Client name and phone required"); return }
    if (items.some(i => !i.description || !i.unit_price)) { setError("Fill in all items with price"); return }
    setSaving(true); setError("")
    try {
      let clientId = selectedClient?.id
      if (isNewClient) {
        const cr = await fetch('/api/clients', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newClientName, phone: newClientPhone }),
        })
        const cd = await cr.json()
        if (!cr.ok) { setError(cd.error || 'Error creating client'); setSaving(false); return }
        clientId = cd.id
      }
      const res = await fetch('/api/invoices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, items, payment_method: payMethod, notes, paid_by: markPaid ? 1 : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); setSaving(false); return }
      setShowModal(false); loadData()
    } catch { setError('Connection error') }
    setSaving(false)
  }

  async function openView(inv: Invoice) {
    try {
      const res = await fetch(`/api/invoices/${inv.id}`)
      const data = await res.json()
      setShowViewModal(data.invoice)
    } catch { setShowViewModal(inv as any) }
  }

  async function openEdit(inv: Invoice) {
    setEditError('')
    try {
      const res = await fetch(`/api/invoices/${inv.id}`)
      if (!res.ok) { setEditError('Could not load invoice'); return }
      const data = await res.json()
      const detail = data.invoice
      const raw = detail.items
      const parsedItems: any[] = raw
        ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
        : []
      setEditItems(parsedItems.length > 0
        ? parsedItems.map((i: any) => ({ description: i.description, quantity: Number(i.quantity), unit_price: Number(i.unit_price), showDrop: false }))
        : [emptyItem()])
      setEditPayMethod(detail.payment_method || 'cash')
      setEditNotes(detail.notes || '')
      setShowEditModal(detail)
    } catch (e: any) {
      setEditError(e?.message || 'Error loading invoice')
    }
  }

  function handlePrint() {
    const style = document.createElement('style')
    style.id = '__invoice_print_style__'
    style.innerHTML = [
      '@media print {',
      '  body * { visibility: hidden !important; }',
      '  #print-invoice, #print-invoice * { visibility: visible !important; }',
      '  #print-invoice { position: fixed; left: 0; top: 0; width: 100%; background: white; z-index: 99999; padding: 40px; box-sizing: border-box; }',
      '  .no-print { display: none !important; }',
      '}',
    ].join(' ')
    document.head.appendChild(style)
    window.print()
    setTimeout(() => document.getElementById('__invoice_print_style__')?.remove(), 1500)
  }

  async function handleEditSave() {
    if (!showEditModal) return
    if (editItems.some(i => !i.description || !i.unit_price)) { setEditError("Fill in all items"); return }
    setEditError(''); setSaving(true)
    try {
      const res = await fetch(`/api/invoices/${showEditModal.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: editItems, payment_method: editPayMethod, notes: editNotes }),
      })
      if (res.ok) { setShowEditModal(null); loadData() }
      else { const d = await res.json(); setEditError(d.error || 'Error') }
    } catch { setEditError('Connection error') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!showDeleteModal) return
    setDeleting(true)
    try {
      await fetch(`/api/invoices/${showDeleteModal.id}`, { method: 'DELETE' })
      setShowDeleteModal(null); loadData()
    } catch {}
    setDeleting(false)
  }

  async function handleMarkPaid(invoice: Invoice) {
    setSaving(true)
    try {
      await fetch('/api/invoices/pay', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, paid_by: 1, payment_method: payModalMethod }),
      })
      setShowPayModal(null); loadData()
    } catch {}
    setSaving(false)
  }

  const filtered = invoices.filter(i => {
    const matchF = filter === 'all' || i.status === filter
    const matchS = !search || i.client_name?.toLowerCase().includes(search.toLowerCase()) || i.invoice_number?.toLowerCase().includes(search.toLowerCase())
    const invDate = i.created_at?.split('T')[0]
    const matchFrom = !dateFrom || invDate >= dateFrom
    const matchTo   = !dateTo   || invDate <= dateTo
    return matchF && matchS && matchFrom && matchTo
  })

  const filteredTotal = filtered.reduce((sum, i) => sum + Number(i.total), 0)
  const filteredCatalog = (q: string) => catalog.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()))
  const isFiltered = datePreset !== 'month'

  return (
    <div className="space-y-6 p-4 md:p-0">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing & Invoices</h1>
          <p className="text-sm text-gray-400">Create invoices and register payments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${isFiltered || showDateFilter ? 'border-[#4a8fe8] bg-[#4a8fe8]/10 text-[#4a8fe8]' : 'border-[#2a2a2a] bg-[#1e1e1e] text-gray-400 hover:text-white'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
          </svg>
            {isFiltered && <span className="text-xs hidden sm:inline">{
              datePreset === 'today' ? 'Today' :
              datePreset === 'week'  ? 'This Week' :
              datePreset === 'all'   ? 'All Time' : `${dateFrom} → ${dateTo}`
            }</span>}
          </button>
          <button onClick={openNewInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-[#e8151a] hover:bg-[#c91016] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* Date filter panel */}
      {showDateFilter && (
        <div className="bg-[#1e1e1e] border border-[#4a8fe8]/30 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[['today','Today'],['week','This Week'],['month','This Month'],['all','All Time'],['custom','Custom Range']].map(([val,label]) => (
              <button key={val} onClick={() => val === 'custom' ? setDatePreset('custom') : applyPreset(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${datePreset===val?'bg-[#4a8fe8] text-white':'bg-[#0f0f0f] border border-[#2a2a2a] text-gray-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          {datePreset === 'custom' && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">From</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#4a8fe8]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">To</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-1.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#4a8fe8]" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "This Month", value: `$${Number(stats?.month_revenue || 0).toFixed(0)}`,   color: "text-green-400" },
          { label: "Invoices",   value: stats?.month_invoices || 0,                             color: "text-white" },
          { label: "Avg Ticket", value: `$${Number(stats?.avg_ticket || 0).toFixed(0)}`,      color: "text-[#4a8fe8]" },
          { label: "Pending",    value: `$${Number(stats?.pending_revenue || 0).toFixed(0)}`, color: "text-yellow-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client or invoice..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
        </div>
        <div className="flex gap-2">
          {['all','pending','paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${filter===f?'bg-[#e8151a] text-white':'bg-[#1e1e1e] border border-[#2a2a2a] text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div>
        : filtered.length === 0 ? <div className="p-8 text-center text-gray-500">No invoices found</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  {['Invoice','Client','Amount','Method','Referred By','Date','Status',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#252525]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-[#4a8fe8] font-medium text-sm">{inv.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{inv.client_name}</p>
                      <p className="text-gray-500 text-xs">{inv.client_phone}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">${Number(inv.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 capitalize">
                      {PAY_METHODS.find(m => m.value === inv.payment_method)?.icon} {inv.payment_method}
                    </td>
                    <td className="px-4 py-3">
                      {inv.seller_name
                        ? <span className="text-xs text-[#4a8fe8]">{inv.seller_name}</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30">Direct</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(inv.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${inv.status==='paid'?'bg-green-500/10 text-green-400 border border-green-500/20':'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status === 'pending' && (
                          <button onClick={() => { setShowPayModal(inv); setPayModalMethod('cash') }}
                            className="flex items-center gap-1 px-2 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition-colors">
                            <DollarSign className="w-3 h-3" /> Pay
                          </button>
                        )}
                        <button onClick={() => openView(inv)} title="View / Print"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => inv.status === 'paid' ? setAdminConfirm({action:'edit', invoice:inv}) : openEdit(inv)}
                          title={inv.status === 'paid' ? 'Requiere autorización admin' : 'Edit'}
                          className={`p-1.5 rounded-lg transition-colors ${inv.status==='paid' ? 'text-yellow-600 hover:text-yellow-400 hover:bg-[#2a2a2a]' : 'text-gray-400 hover:text-[#4a8fe8] hover:bg-[#2a2a2a]'}`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => inv.status === 'paid' ? setAdminConfirm({action:'delete', invoice:inv}) : setShowDeleteModal(inv)}
                          title={inv.status === 'paid' ? 'Requiere autorización admin' : 'Delete'}
                          className={`p-1.5 rounded-lg transition-colors ${inv.status==='paid' ? 'text-yellow-600 hover:text-yellow-400 hover:bg-[#2a2a2a]' : 'text-gray-400 hover:text-red-400 hover:bg-[#2a2a2a]'}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 1 && (
                <tfoot>
                  <tr className="border-t border-[#2a2a2a] bg-[#252525]">
                    <td colSpan={2} className="px-4 py-3 text-xs text-gray-500">{filtered.length} invoices</td>
                    <td className="px-4 py-3 font-bold text-white">${filteredTotal.toFixed(2)}</td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* NEW INVOICE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white text-lg">New Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">

              {/* CLIENT */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Client</label>
                  <button onClick={() => { setIsNewClient(!isNewClient); setSelectedClient(null); setClientQuery(""); setShowClientDrop(false) }}
                    className="text-xs text-[#4a8fe8] hover:underline">
                    {isNewClient ? "Search existing" : "+ New client"}
                  </button>
                </div>
                {isNewClient ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Full Name *"
                        className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                      <input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="Phone *"
                        className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 border border-gray-600/40 font-medium">Direct</span>
                      <span className="text-xs text-gray-500">Walk-in — no seller commission will be generated</span>
                    </div>
                  </div>
                ) : selectedClient ? (
                  <div className="flex items-center justify-between bg-[#4a8fe8]/10 border border-[#4a8fe8]/30 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{selectedClient.name}</p>
                      <p className="text-gray-400 text-xs">
                        {formatPhone(selectedClient.phone)}
                        {selectedClient.seller_name
                          ? <span className="text-[#4a8fe8] ml-1">· Referred by {selectedClient.seller_name}</span>
                          : <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-400 text-[10px]">Direct</span>
                        }
                      </p>
                    </div>
                    <button onClick={() => { setSelectedClient(null); setClientQuery(""); setShowClientDrop(true) }} className="text-gray-400 hover:text-white ml-3">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={clientQuery}
                      onChange={e => { setClientQuery(e.target.value); setShowClientDrop(true) }}
                      onFocus={() => setShowClientDrop(true)}
                      onBlur={() => setTimeout(() => setShowClientDrop(false), 150)}
                      placeholder="Click or type to search..."
                      className="w-full pl-9 pr-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                    {showClientDrop && clientResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl max-h-52 overflow-y-auto">
                        {clientResults.map(c => (
                          <button key={c.id} onMouseDown={() => selectClient(c)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] transition-colors text-left border-b border-[#2a2a2a] last:border-0">
                            <div>
                              <p className="text-white text-sm font-medium">{c.name}</p>
                              <p className="text-gray-500 text-xs">{formatPhone(c.phone)}{c.seller_name ? ` · Ref: ${c.seller_name}` : ''}</p>
                            </div>
                            {c.last_service && <p className="text-xs text-gray-600 ml-2 truncate max-w-[120px]">{c.last_service}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                    {showClientDrop && clientResults.length === 0 && clientQuery.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3">
                        <p className="text-gray-500 text-sm">No clients found —{' '}
                          <button className="text-[#4a8fe8] hover:underline" onMouseDown={() => { setIsNewClient(true); setShowClientDrop(false) }}>create new</button>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ITEMS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">Services & Products</label>
                  <button onClick={addItem} className="text-xs text-[#4a8fe8] hover:underline">+ Add item</button>
                </div>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-6 relative">
                        <input value={item.description}
                          onChange={e => updateItem(i, 'description', e.target.value)}
                          onFocus={() => updateItem(i, 'showDrop', true)}
                          onBlur={() => setTimeout(() => updateItem(i, 'showDrop', false), 150)}
                          placeholder="Click to select or type..."
                          className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                        {item.showDrop && (
                          <div className="absolute z-20 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl max-h-52 overflow-y-auto">
                            {filteredCatalog(item.description).length === 0
                              ? <p className="px-4 py-3 text-gray-500 text-sm">No items found</p>
                              : ['service','product'].map(cat => {
                                  const catItems = filteredCatalog(item.description).filter(c => c.category === cat)
                                  if (!catItems.length) return null
                                  return (
                                    <div key={cat}>
                                      <p className="px-4 py-1.5 text-xs text-gray-600 uppercase tracking-wider bg-[#0f0f0f] sticky top-0">{cat}s</p>
                                      {catItems.map(c => (
                                        <button key={c.id} onMouseDown={() => pickCatalog(i, c)}
                                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2a2a2a] transition-colors text-left border-b border-[#222] last:border-0">
                                          <span className="text-white text-sm">{c.name}</span>
                                          <span className="text-[#4a8fe8] font-bold text-sm ml-2 flex-shrink-0">${Number(c.price).toFixed(2)}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )
                                })
                            }
                          </div>
                        )}
                      </div>
                      <input type="number" min="1" value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                        className="col-span-2 px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#4a8fe8] text-sm text-center" placeholder="Qty" />
                      <div className="col-span-3 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input type="number" min="0" step="0.01" value={item.unit_price || ""}
                          onChange={e => updateItem(i, 'unit_price', Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#4a8fe8] text-sm" placeholder="0.00" />
                      </div>
                      <button onClick={() => removeItem(i)} className="col-span-1 py-2.5 text-gray-500 hover:text-red-400 flex justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end border-t border-[#2a2a2a] pt-3">
                  <p className="text-sm text-gray-400">Total: <span className="text-white font-bold text-xl ml-2">${subtotal.toFixed(2)}</span></p>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {PAY_METHODS.map(m => (
                    <button key={m.value} onClick={() => setPayMethod(m.value)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-lg border text-sm transition-colors ${payMethod===m.value?'border-[#e8151a] bg-[#e8151a]/10 text-white':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional notes..."
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm resize-none" />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3 p-6 border-t border-[#2a2a2a]">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-3 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => handleCreateInvoice(false)} disabled={saving}
                className="flex-1 py-3 bg-[#1e1e1e] border border-yellow-500/40 hover:border-yellow-500 text-yellow-400 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors">
                {saving ? '...' : 'Save as Pending'}
              </button>
              <button onClick={() => handleCreateInvoice(true)} disabled={saving}
                className="flex-1 py-3 bg-[#e8151a] hover:bg-[#c91016] disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                {saving ? 'Creating...' : <><Check className="w-4 h-4" />Charge Now</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK AS PAID MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white">Register Payment</h3>
              <button onClick={() => setShowPayModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#0f0f0f] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Invoice</span><span className="text-white font-bold">{showPayModal.invoice_number}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Client</span><span className="text-white">{showPayModal.client_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-sm">Amount</span><span className="text-green-400 font-bold text-2xl">${Number(showPayModal.total).toFixed(2)}</span></div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAY_METHODS.map(m => (
                    <button key={m.value} onClick={() => setPayModalMethod(m.value)}
                      className={`flex items-center gap-2 py-3 px-4 rounded-lg border text-sm transition-colors ${payModalMethod===m.value?'border-green-500 bg-green-500/10 text-white':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                      <span className="text-lg">{m.icon}</span><span className="font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2a2a2a]">
              <button onClick={() => setShowPayModal(null)}
                className="flex-1 py-3 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={() => handleMarkPaid(showPayModal)} disabled={saving}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                {saving ? 'Processing...' : <><Check className="w-4 h-4" />Confirm Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW / PRINT MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/75 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4 text-black" id="print-invoice">
            <div className="flex items-center justify-between p-6 border-b no-print">
              <h3 className="font-bold text-lg">Invoice {showViewModal.invoice_number}</h3>
              <div className="flex gap-2">
                <button onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a2a] no-print">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={() => setShowViewModal(null)} className="text-gray-400 hover:text-black no-print"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-black text-[#e8151a]">AUTO WAX</p>
                  <p className="text-xs text-gray-500">South Florida</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{showViewModal.invoice_number}</p>
                  <p className="text-xs text-gray-500">{new Date(showViewModal.created_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${showViewModal.status==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                    {showViewModal.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Client</p>
                <p className="font-semibold">{showViewModal.client_name}</p>
                {showViewModal.client_phone && <p className="text-sm text-gray-500">{showViewModal.client_phone}</p>}
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Description</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Qty</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Price</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                </tr></thead>
                <tbody>
                  {showViewModal.items && (typeof showViewModal.items === 'string' ? JSON.parse(showViewModal.items) : showViewModal.items).map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="py-2 text-right font-medium">${Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                <div className="text-sm text-gray-500">
                  Payment: <span className="capitalize font-medium text-black">{showViewModal.payment_method}</span>
                  {showViewModal.seller_name && <span className="ml-3">Ref: <span className="font-medium text-black">{showViewModal.seller_name}</span></span>}
                </div>
                <p className="text-xl font-black">Total: ${Number(showViewModal.total).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/75 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white">Edit {showEditModal.invoice_number}</h3>
              <button onClick={() => setShowEditModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Services & Products</label>
                {editItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-6 relative">
                      <input value={item.description}
                        onChange={e => setEditItems(prev => prev.map((it,idx) => idx===i?{...it,description:e.target.value}:it))}
                        onFocus={() => setEditItems(prev => prev.map((it,idx) => idx===i?{...it,showDrop:true}:it))}
                        onBlur={() => setTimeout(() => setEditItems(prev => prev.map((it,idx) => idx===i?{...it,showDrop:false}:it)), 150)}
                        placeholder="Service or product..."
                        className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                      {item.showDrop && (
                        <div className="absolute z-20 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl max-h-40 overflow-y-auto">
                          {filteredCatalog(item.description).length === 0
                            ? <p className="px-4 py-3 text-gray-500 text-sm">No items</p>
                            : filteredCatalog(item.description).map(c => (
                              <button key={c.id} onMouseDown={() => setEditItems(prev => prev.map((it,idx) => idx===i?{...it,description:c.name,unit_price:c.price,showDrop:false}:it))}
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#2a2a2a] text-left border-b border-[#222] last:border-0">
                                <span className="text-white text-sm">{c.name}</span>
                                <span className="text-[#4a8fe8] text-sm">${Number(c.price).toFixed(2)}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => setEditItems(prev => prev.map((it,idx) => idx===i?{...it,quantity:Number(e.target.value)}:it))}
                      className="col-span-2 px-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#4a8fe8] text-sm text-center" />
                    <div className="col-span-3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input type="number" min="0" step="0.01" value={item.unit_price || ""}
                        onChange={e => setEditItems(prev => prev.map((it,idx) => idx===i?{...it,unit_price:Number(e.target.value)}:it))}
                        className="w-full pl-7 pr-3 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#4a8fe8] text-sm" />
                    </div>
                    <button onClick={() => setEditItems(prev => prev.filter((_,idx) => idx!==i))} className="col-span-1 py-2.5 text-gray-500 hover:text-red-400 flex justify-center"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setEditItems(prev => [...prev, emptyItem()])} className="text-xs text-[#4a8fe8] hover:underline">+ Add item</button>
                <div className="flex justify-end border-t border-[#2a2a2a] pt-2">
                  <p className="text-sm text-gray-400">Total: <span className="text-white font-bold text-lg ml-2">${editItems.reduce((s,i)=>s+Number(i.quantity)*Number(i.unit_price),0).toFixed(2)}</span></p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {PAY_METHODS.map(m => (
                    <button key={m.value} onClick={() => setEditPayMethod(m.value)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-sm transition-colors ${editPayMethod===m.value?'border-[#e8151a] bg-[#e8151a]/10 text-white':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                      <span>{m.icon}</span><span className="text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} placeholder="Notes..."
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm resize-none" />
              {editError && <p className="text-sm text-red-400">{editError}</p>}
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2a2a2a]">
              <button onClick={() => setShowEditModal(null)} className="px-4 py-3 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm">Cancel</button>
              <button onClick={handleEditSave} disabled={saving}
                className="flex-1 py-3 bg-[#4a8fe8] hover:bg-[#3a7fd8] disabled:opacity-50 text-white rounded-lg text-sm font-bold">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN OVERRIDE CONFIRM */}
      {adminConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-yellow-500/40 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Autorización de admin</h3>
                <p className="text-xs text-gray-400">Invoice pagado — acción restringida</p>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              <span className="text-white font-medium">{adminConfirm.invoice.invoice_number}</span> ya fue pagado.{' '}
              {adminConfirm.action === 'edit' ? '¿Querés editarlo de todas formas?' : '¿Querés borrarlo de todas formas?'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAdminConfirm(null)}
                className="flex-1 py-2.5 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm">
                Cancelar
              </button>
              <button onClick={() => {
                  const inv = adminConfirm.invoice
                  setAdminConfirm(null)
                  if (adminConfirm.action === 'edit') openEdit(inv)
                  else setShowDeleteModal(inv)
                }}
                className="flex-1 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 rounded-lg text-sm font-bold">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-white">Delete Invoice</h3>
            <p className="text-gray-400 text-sm">
              Are you sure you want to delete <span className="text-white font-medium">{showDeleteModal.invoice_number}</span> for <span className="text-white font-medium">{showDeleteModal.client_name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
