"use client"

import { formatPhone } from '@/lib/utils/format'
import { useState, useEffect } from "react"
import { Plus, Search, Edit, QrCode, Trash2, Smartphone, X, Check, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Seller {
  id: number
  user_id: number
  name: string
  email: string | null
  phone: string
  qr_code: string
  qr_url: string
  commission_type: string
  commission_value: number
  active: boolean
  device_token: string | null
  last_login: string | null
}

// Simple QR SVG using Google Charts API style — generated inline
function QRDisplay({ url, size = 200 }: { url: string; size?: number }) {
  const encoded = encodeURIComponent(url)
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=000000&margin=10`}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-lg"
    />
  )
}

export default function SellersPage() {
  const [sellers, setSellers]         = useState<Seller[]>([])
  const [loading, setLoading]         = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState<string | null>(null)

  // Modals
  const [showAdd, setShowAdd]         = useState(false)
  const [showEdit, setShowEdit]       = useState(false)
  const [showQR, setShowQR]           = useState(false)
  const [showLoginQR, setShowLoginQR] = useState(false)
  const [selected, setSelected]       = useState<Seller|null>(null)

  // Add form
  const [newSeller, setNewSeller] = useState({
    name: "", phone: "", email: "",
    commissionType: "percent", commissionValue: 10,
  })

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "", phone: "", email: "",
    commissionType: "percent", commissionValue: 10, active: true,
  })

  const loginQRUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/login?tab=seller`
    : '/login?tab=seller'

  useEffect(() => { loadSellers() }, [])

  async function loadSellers() {
    setLoading(true)
    try {
      const res  = await fetch('/api/sellers')
      const data = await res.json()
      setSellers(data.sellers || [])
    } catch {}
    setLoading(false)
  }

  const filtered = sellers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone || '').includes(searchQuery) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  function openEdit(s: Seller) {
    setSelected(s)
    setEditForm({
      name: s.name, phone: s.phone, email: s.email || '',
      commissionType: s.commission_type || 'percent', commissionValue: s.commission_value, active: s.active,
    })
    setShowEdit(true)
  }

  function openQR(s: Seller) { setSelected(s); setShowQR(true) }

  async function handleAdd() {
    if (!newSeller.name || !newSeller.phone) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/sellers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSeller.name, phone: newSeller.phone.replace(/\D/g,''),
          email: newSeller.email || null,
          commission_type: newSeller.commissionType,
          commission_value: newSeller.commissionValue,
        }),
      })
      if (res.ok) {
        setShowAdd(false)
        setNewSeller({ name:'', phone:'', email:'', commissionType:'percent', commissionValue:10 })
        await loadSellers()
      } else {
        const data = await res.json()
        setSaveError(data.detail || data.error || 'Error al guardar')
      }
    } catch (e: any) {
      setSaveError(e.message || 'Error de red')
    }
    setSaving(false)
  }

  async function handleEdit() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch('/api/sellers/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          name: editForm.name, phone: editForm.phone.replace(/\D/g,''),
          email: editForm.email || null,
          commission_type: editForm.commissionType,
          commission_value: editForm.commissionValue,
          active: editForm.active,
        }),
      })
      if (res.ok) { setShowEdit(false); await loadSellers() }
    } catch {}
    setSaving(false)
  }

  async function handleToggleActive(s: Seller) {
    try {
      await fetch('/api/sellers/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, active: !s.active }),
      })
      await loadSellers()
    } catch {}
  }

  async function handleResetDevice(s: Seller) {
    if (!confirm(`Reset device for ${s.name}? They will be able to log in from a new device.`)) return
    try {
      await fetch(`/api/sellers/${s.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_token: null }),
      })
      await loadSellers()
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Sellers</h1>
          <p className="text-sm text-muted-foreground">Manage your referral partners</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowLoginQR(true)}
            className="border-[#2a2a2a] text-gray-300 hover:text-white gap-2">
            <Smartphone className="w-4 h-4"/> Seller Login QR
          </Button>
          <Button onClick={() => { setShowAdd(true); setSaveError(null) }} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4"/> Add Seller
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#1e1e1e] border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold shrink-0">All Sellers ({filtered.length})</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
              <Input placeholder="Search by name, phone or email..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-border h-8 text-sm"/>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Seller</TableHead>
                  <TableHead className="text-muted-foreground">Commission</TableHead>
                  <TableHead className="text-muted-foreground">Device</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No sellers found</TableCell></TableRow>
                ) : filtered.map(s => (
                  <TableRow key={s.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPhone(s.phone)}</p>
                        {s.email && <p className="text-xs text-[#4a8fe8]">{s.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border">
                        {s.commission_type !== 'fixed' ? `${parseFloat(String(s.commission_value))}%` : `$${parseFloat(String(s.commission_value))}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.device_token ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500"/>
                          <span className="text-xs text-green-400">Registered</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-gray-600"/>
                          <span className="text-xs text-gray-500">No device</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={s.active} onCheckedChange={() => handleToggleActive(s)}/>
                        <span className={s.active ? "text-green-500 text-sm" : "text-muted-foreground text-sm"}>
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(s)}>
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => openQR(s)}>
                          <QrCode className="h-4 w-4"/>
                        </Button>
                        {s.device_token && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10"
                            title="Reset device — allow new login"
                            onClick={() => handleResetDevice(s)}>
                            <RefreshCw className="h-4 w-4"/>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── ADD SELLER MODAL ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Add New Seller</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="John Smith" value={newSeller.name}
                onChange={e => setNewSeller({...newSeller, name:e.target.value})}
                className="bg-background border-border"/>
            </div>
            <div className="space-y-2">
              <Label>Phone Number * <span className="text-xs text-muted-foreground">(used to log in)</span></Label>
              <Input placeholder="5610000000" value={newSeller.phone}
                onChange={e => setNewSeller({...newSeller, phone:e.target.value})}
                className="bg-background border-border"/>
            </div>
            <div className="space-y-2">
              <Label>Email <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input type="email" placeholder="seller@email.com" value={newSeller.email}
                onChange={e => setNewSeller({...newSeller, email:e.target.value})}
                className="bg-background border-border"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Commission Type</Label>
                <Select value={newSeller.commissionType}
                  onValueChange={v => setNewSeller({...newSeller, commissionType:v})}>
                  <SelectTrigger className="bg-background border-border"><SelectValue/></SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-border">
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" value={newSeller.commissionValue}
                  onChange={e => setNewSeller({...newSeller, commissionValue: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="bg-background border-border"/>
              </div>
            </div>
          </div>
          {saveError && (
            <p className="text-sm text-red-500 px-1 pb-1">{saveError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="border-border">Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !newSeller.name || !newSeller.phone}
              className="bg-primary hover:bg-primary/90">
              {saving ? 'Saving...' : 'Add Seller'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT SELLER MODAL ── */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Edit Seller — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm({...editForm, name:e.target.value})}
                className="bg-background border-border"/>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formatPhone(editForm.phone)} onChange={e => setEditForm({...editForm, phone: e.target.value.replace(/\D/g, '')})}
                className="bg-background border-border"/>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email:e.target.value})}
                placeholder="seller@email.com" className="bg-background border-border"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Commission Type</Label>
                <Select value={editForm.commissionType}
                  onValueChange={v => setEditForm({...editForm, commissionType:v})}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue>{editForm.commissionType === 'percent' ? 'Percentage (%)' : 'Fixed ($)'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-border">
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" value={editForm.commissionValue}
                  onChange={e => setEditForm({...editForm, commissionValue: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  className="bg-background border-border"/>
              </div>
            </div>
            {selected?.device_token && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-400 font-medium">Device registered</p>
                  <p className="text-xs text-gray-500 mt-0.5">Last login: {selected.last_login ? new Date(selected.last_login).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 gap-1"
                  onClick={() => { handleResetDevice(selected!); setShowEdit(false) }}>
                  <RefreshCw className="w-3 h-3"/> Reset Device
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)} className="border-border">Cancel</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── REFERRAL QR MODAL ── */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Referral QR — {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="bg-white p-3 rounded-2xl">
                <QRDisplay url={selected.qr_url || `${loginQRUrl}`} size={200}/>
              </div>
              <div className="w-full space-y-2">
                <Label className="text-muted-foreground">Referral Link</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={selected.qr_url} className="bg-background border-border text-xs"/>
                  <Button variant="outline" className="border-border shrink-0"
                    onClick={() => navigator.clipboard.writeText(selected.qr_url)}>Copy</Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQR(false)} className="border-border">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SELLER LOGIN QR MODAL ── */}
      <Dialog open={showLoginQR} onOpenChange={setShowLoginQR}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#4a8fe8]"/> Seller Login QR
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-4 rounded-2xl shadow">
              <QRDisplay url={loginQRUrl} size={220}/>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-medium">Auto Wax — Seller Access</p>
              <p className="text-xs text-muted-foreground">{loginQRUrl}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 w-full space-y-2">
              <p className="text-xs font-medium text-gray-300">How to use:</p>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>Give or print this QR to the seller</li>
                <li>Seller scans the QR with their phone camera</li>
                <li>Enters their registered phone number</li>
                <li>Gets access to the seller app</li>
                <li>Tap "Add to Home Screen" to install the app</li>
              </ol>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 border-border"
                onClick={() => navigator.clipboard.writeText(loginQRUrl)}>
                Copy Link
              </Button>
              <Button className="flex-1 bg-[#4a8fe8] hover:bg-[#3a7fd8]"
                onClick={() => window.print()}>
                Print QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
