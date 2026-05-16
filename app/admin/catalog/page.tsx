"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, Check, Clock, ChevronUp, TrendingUp, Search } from "lucide-react"

type CatalogItem = {
  id: number; name: string; category: 'service'|'product'; price: number; active: number
  price_history: PriceHistory[]
}
type PriceHistory = {
  id: number; old_price: number; new_price: number
  changed_by_name: string; changed_at: string; notes: string | null
}

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'service'|'product'>('all')
  const [expandedHistory, setExpandedHistory] = useState<number|null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editItem, setEditItem] = useState<CatalogItem|null>(null)
  const [form, setForm] = useState({ name: '', category: 'service', price: '', notes: '' })
  const [bulkForm, setBulkForm] = useState({ type: 'percent', value: '', category: 'all', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bulkError, setBulkError] = useState('')
  const [bulkSuccess, setBulkSuccess] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/catalog')
      const data = await res.json()
      setItems(data.items || [])
    } catch {}
    setLoading(false)
  }

  function openAdd() {
    setEditItem(null)
    setForm({ name: '', category: 'service', price: '', notes: '' })
    setError(''); setShowModal(true)
  }

  function openEdit(item: CatalogItem) {
    setEditItem(item)
    setForm({ name: item.name, category: item.category, price: String(item.price), notes: '' })
    setError(''); setShowModal(true)
  }

  async function handleSave() {
    if (!form.name || !form.price) { setError('Name and price required'); return }
    setSaving(true); setError('')
    try {
      if (editItem) {
        const res = await fetch('/api/catalog/item', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editItem.id, name: form.name, price: parseFloat(form.price), changed_by: 1, notes: form.notes || null }),
        })
        const d = await res.json()
        if (!res.ok) { setError(d.error); setSaving(false); return }
      } else {
        const res = await fetch('/api/catalog', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, category: form.category, price: parseFloat(form.price) }),
        })
        const d = await res.json()
        if (!res.ok) { setError(d.error); setSaving(false); return }
      }
      setShowModal(false); loadItems()
    } catch { setError('Connection error') }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Deactivate this item?')) return
    await fetch('/api/catalog/item', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadItems()
  }

  async function handleBulkUpdate() {
    if (!bulkForm.value) { setBulkError('Enter a value'); return }
    setSaving(true); setBulkError(''); setBulkSuccess('')
    try {
      const res = await fetch('/api/catalog/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: bulkForm.type,
          value: parseFloat(bulkForm.value),
          category: bulkForm.category,
          changed_by: 1,
          notes: bulkForm.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setBulkError(data.error); setSaving(false); return }
      setBulkSuccess(`✓ Updated ${data.updated} item${data.updated !== 1 ? 's' : ''} successfully`)
      loadItems()
      setTimeout(() => { setShowBulkModal(false); setBulkSuccess('') }, 1500)
    } catch { setBulkError('Connection error') }
    setSaving(false)
  }

  const filtered = items.filter(i => {
    const matchesCategory = filter === 'all' || i.category === filter
    const matchesSearch = !search.trim() || i.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })
  const services = filtered.filter(i => i.category === 'service')
  const products = filtered.filter(i => i.category === 'product')

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const previewPrice = (currentPrice: number) => {
    if (!bulkForm.value) return null
    const val = parseFloat(bulkForm.value)
    if (isNaN(val)) return null
    return bulkForm.type === 'percent'
      ? Math.round(currentPrice * (1 + val / 100) * 100) / 100
      : Math.round((currentPrice + val) * 100) / 100
  }

  const ItemRow = ({ item }: { item: CatalogItem }) => (
    <div>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">{item.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {item.price_history?.length > 0 ? `${item.price_history.length} price change${item.price_history.length !== 1 ? 's' : ''}` : 'No changes yet'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#4a8fe8] font-bold text-lg">${Number(item.price).toFixed(2)}</p>
          {showBulkModal && bulkForm.value && previewPrice(item.price) !== null && (
            <p className="text-xs text-yellow-400">→ ${previewPrice(item.price)?.toFixed(2)}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {item.price_history?.length > 0 && (
            <button onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
              className={`p-2 rounded-lg transition-colors ${expandedHistory === item.id ? 'text-[#4a8fe8] bg-[#4a8fe8]/10' : 'text-gray-500 hover:text-white hover:bg-[#2a2a2a]'}`}>
              {expandedHistory === item.id ? <ChevronUp className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </button>
          )}
          <button onClick={() => openEdit(item)}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(item.id)}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expandedHistory === item.id && item.price_history?.length > 0 && (
        <div className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price History</p>
          <div className="space-y-2">
            {item.price_history.map(h => (
              <div key={h.id} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <span className="text-red-400 line-through">${Number(h.old_price).toFixed(2)}</span>
                  <span className="text-gray-500 mx-2">→</span>
                  <span className="text-green-400 font-medium">${Number(h.new_price).toFixed(2)}</span>
                  {h.notes && <span className="text-gray-500 text-xs ml-2">· {h.notes}</span>}
                </div>
                <div className="text-right text-xs text-gray-500 flex-shrink-0">
                  <p className="text-gray-400">{h.changed_by_name}</p>
                  <p>{formatDate(h.changed_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Service & Product Catalog</h1>
          <p className="text-sm text-gray-400">Manage prices · all changes are logged with full history</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowBulkModal(true); setBulkForm({ type:'percent', value:'', category:'all', notes:'' }); setBulkError(''); setBulkSuccess('') }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] hover:border-yellow-500/50 text-yellow-400 rounded-lg text-sm font-medium transition-colors">
            <TrendingUp className="w-4 h-4" /> Bulk Update
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#4a8fe8] hover:bg-[#3a7fd8] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['all','service','product'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-[#e8151a] text-white' : 'bg-[#1e1e1e] border border-[#2a2a2a] text-gray-400 hover:text-white'}`}>
            {f === 'all' ? `All (${items.length})` : `${f}s (${items.filter(i=>i.category===f).length})`}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="pl-9 pr-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] w-56"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="h-3.5 w-3.5"/>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No items match <span className="text-white">"{search}"</span>
        </div>
      ) : (
        <div className="space-y-6">
          {(filter === 'all' || filter === 'service') && services.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Services ({services.length})</h2>
              <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl divide-y divide-[#2a2a2a]">
                {services.map(item => <ItemRow key={item.id} item={item} />)}
              </div>
            </div>
          )}
          {(filter === 'all' || filter === 'product') && products.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Products ({products.length})</h2>
              <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl divide-y divide-[#2a2a2a]">
                {products.map(item => <ItemRow key={item.id} item={item} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT / ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name *</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Service or product name"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
              </div>
              {!editItem && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['service','product'] as const).map(c => (
                      <button key={c} onClick={() => setForm(f=>({...f,category:c}))}
                        className={`py-3 rounded-lg border text-sm font-medium capitalize transition-colors ${form.category===c?'border-[#4a8fe8] bg-[#4a8fe8]/10 text-white':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                </div>
                {editItem && form.price && Number(form.price) !== Number(editItem.price) && (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠ Price will change: ${Number(editItem.price).toFixed(2)} → ${Number(form.price).toFixed(2)}. This will be logged.
                  </p>
                )}
              </div>
              {editItem && form.price && Number(form.price) !== Number(editItem.price) && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Reason for change (optional)</label>
                  <input value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
                    placeholder="e.g. Market adjustment, cost increase..."
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                </div>
              )}
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2a2a2a]">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-[#4a8fe8] hover:bg-[#3a7fd8] disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                {saving ? 'Saving...' : <><Check className="w-4 h-4" />{editItem ? 'Save Changes' : 'Add Item'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK UPDATE MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white">Bulk Price Update</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Apply to</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['all','All Items'],['service','Services'],['product','Products']].map(([val,label]) => (
                    <button key={val} onClick={() => setBulkForm(f=>({...f,category:val}))}
                      className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${bulkForm.category===val?'border-yellow-500 bg-yellow-500/10 text-yellow-400':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Adjustment type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setBulkForm(f=>({...f,type:'percent'}))}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${bulkForm.type==='percent'?'border-[#4a8fe8] bg-[#4a8fe8]/10 text-[#4a8fe8]':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                    % Percentage
                  </button>
                  <button onClick={() => setBulkForm(f=>({...f,type:'fixed'}))}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${bulkForm.type==='fixed'?'border-[#4a8fe8] bg-[#4a8fe8]/10 text-[#4a8fe8]':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                    $ Fixed amount
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {bulkForm.type === 'percent' ? 'Percentage (negative = decrease)' : 'Amount (negative = decrease)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{bulkForm.type==='percent'?'%':'$'}</span>
                  <input type="number" step="0.01" value={bulkForm.value}
                    onChange={e => setBulkForm(f=>({...f,value:e.target.value}))}
                    placeholder={bulkForm.type==='percent'?'e.g. 10 or -5':'e.g. 20 or -10'}
                    className="w-full pl-8 pr-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
                </div>
                {bulkForm.value && items.find(i=>i.name.includes('Detailing')) && (
                  <p className="text-xs text-gray-500 mt-1">
                    e.g. Professional Detailing ${Number(items.find(i=>i.name.includes('Detailing'))?.price||149).toFixed(2)} → ${previewPrice(Number(items.find(i=>i.name.includes('Detailing'))?.price||149))?.toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason (optional)</label>
                <input value={bulkForm.notes} onChange={e => setBulkForm(f=>({...f,notes:e.target.value}))}
                  placeholder="e.g. Annual price adjustment 2025"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-sm" />
              </div>
              {bulkError && <p className="text-sm text-red-400">{bulkError}</p>}
              {bulkSuccess && <p className="text-sm text-green-400">{bulkSuccess}</p>}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                <p className="text-xs text-yellow-400">
                  ⚠ This will update {items.filter(i=>bulkForm.category==='all'||i.category===bulkForm.category).length} items and log all changes in price history.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#2a2a2a]">
              <button onClick={() => setShowBulkModal(false)}
                className="flex-1 py-3 border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleBulkUpdate} disabled={saving || !bulkForm.value}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                {saving ? 'Updating...' : <><TrendingUp className="w-4 h-4" />Apply to {items.filter(i=>bulkForm.category==='all'||i.category===bulkForm.category).length} items</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
