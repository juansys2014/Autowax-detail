"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, X, Check, Shield, ChevronRight, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPhone } from "@/lib/utils/format"

// ─── Constants ────────────────────────────────────────────────

const MODULES = [
  { key: "appointments", label: "Appointments" },
  { key: "clients",      label: "Clients" },
  { key: "sellers",      label: "Sellers" },
  { key: "commissions",  label: "Commissions" },
  { key: "billing",      label: "Billing & Invoices" },
  { key: "users",        label: "Users & Permissions" },
  { key: "catalog",      label: "Catalog & Prices" },
  { key: "settings",     label: "Settings" },
]

const ACTIONS = [
  { key: "can_view",   label: "View" },
  { key: "can_create", label: "Create" },
  { key: "can_edit",   label: "Edit" },
  { key: "can_delete", label: "Delete" },
] as const

const COLORS = [
  { value: "red",    bg: "bg-red-500/10",    border: "border-red-500/50",    text: "text-red-400" },
  { value: "blue",   bg: "bg-blue-500/10",   border: "border-blue-500/50",   text: "text-blue-400" },
  { value: "green",  bg: "bg-green-500/10",  border: "border-green-500/50",  text: "text-green-400" },
  { value: "yellow", bg: "bg-yellow-500/10", border: "border-yellow-500/50", text: "text-yellow-400" },
  { value: "purple", bg: "bg-purple-500/10", border: "border-purple-500/50", text: "text-purple-400" },
  { value: "gray",   bg: "bg-gray-500/10",   border: "border-gray-500/50",   text: "text-gray-400" },
]

// ─── Types ────────────────────────────────────────────────────

type Permission = { module: string; can_view: number; can_create: number; can_edit: number; can_delete: number }
type Role       = { id: number; name: string; description: string; color: string; is_system: boolean; permissions: Permission[] }
type User       = { id: number; name: string; email: string | null; phone: string | null; role: string; role_id: number | null; role_name: string | null; role_color: string | null; active: boolean; created_at: string }
type PermMap    = Record<string, Record<string, boolean>>

// ─── Helpers ──────────────────────────────────────────────────

function colorClasses(color: string) {
  return COLORS.find(c => c.value === color) ?? COLORS[1]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function permissionsToMap(perms: Permission[]): PermMap {
  const map: PermMap = {}
  for (const mod of MODULES) {
    const p = perms.find(x => x.module === mod.key)
    map[mod.key] = {
      can_view:   p ? Boolean(p.can_view)   : false,
      can_create: p ? Boolean(p.can_create) : false,
      can_edit:   p ? Boolean(p.can_edit)   : false,
      can_delete: p ? Boolean(p.can_delete) : false,
    }
  }
  return map
}

function permMapToArray(map: PermMap) {
  return MODULES.map(mod => ({
    module:     mod.key,
    can_view:   map[mod.key]?.can_view   ? 1 : 0,
    can_create: map[mod.key]?.can_create ? 1 : 0,
    can_edit:   map[mod.key]?.can_edit   ? 1 : 0,
    can_delete: map[mod.key]?.can_delete ? 1 : 0,
  }))
}

function emptyPermMap(): PermMap {
  return Object.fromEntries(MODULES.map(m => [m.key, { can_view: false, can_create: false, can_edit: false, can_delete: false }]))
}

// ─── Page ─────────────────────────────────────────────────────

export default function UsersPage() {
  const [users,       setUsers]       = useState<User[]>([])
  const [roles,       setRoles]       = useState<Role[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [userSearch,  setUserSearch]  = useState("")

  // User modal
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser,   setEditingUser]   = useState<User | null>(null)
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", password: "", role_id: "" })
  const [userError, setUserError] = useState("")
  const [nameSuggestions, setNameSuggestions] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Role modal
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingRole,   setEditingRole]   = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState({ name: "", description: "", color: "blue" })
  const [permMap,  setPermMap]  = useState<PermMap>(emptyPermMap())
  const [roleError, setRoleError] = useState("")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [ur, rr] = await Promise.all([fetch('/api/users'), fetch('/api/roles')])
      const [ud, rd] = await Promise.all([ur.json(), rr.json()])
      setUsers(ud.users || [])
      setRoles(rd.roles || [])
    } catch {}
    setLoading(false)
  }

  // ── User modal ──────────────────────────────────────────────

  function openAddUser() {
    setEditingUser(null)
    setUserForm({ name: "", email: "", phone: "", password: "", role_id: "" })
    setUserError("")
    setNameSuggestions([])
    setShowSuggestions(false)
    setShowUserModal(true)
  }

  function openEditUser(u: User) {
    setEditingUser(u)
    setUserForm({ name: u.name, email: u.email || "", phone: u.phone || "", password: "", role_id: u.role_id ? String(u.role_id) : "" })
    setUserError("")
    setNameSuggestions([])
    setShowSuggestions(false)
    setShowUserModal(true)
  }

  function handleNameChange(val: string) {
    setUserForm(f => ({ ...f, name: val }))
    if (val.length >= 2) {
      const matches = users.filter(u =>
        u.name.toLowerCase().includes(val.toLowerCase()) && u.id !== editingUser?.id
      )
      setNameSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  async function handleSaveUser() {
    if (!userForm.name) { setUserError("Name is required"); return }
    if (!editingUser && !userForm.password) { setUserError("Password is required for new users"); return }
    // email uniqueness check
    if (userForm.email) {
      const emailTaken = users.find(u => u.email?.toLowerCase() === userForm.email.toLowerCase() && u.id !== editingUser?.id)
      if (emailTaken) { setUserError(`Email already used by ${emailTaken.name}`); return }
    }
    setSaving(true); setUserError("")
    try {
      const url    = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'
      const body: any = {
        name: userForm.name,
        email: userForm.email || null,
        phone: userForm.phone || null,
        role_id: userForm.role_id ? parseInt(userForm.role_id) : null,
      }
      if (userForm.password) body.password = userForm.password
      if (!editingUser) body.role = 'user'

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setUserError(data.error || 'Error saving user'); setSaving(false); return }
      setShowUserModal(false)
      await loadData()
    } catch { setUserError('Connection error') }
    setSaving(false)
  }

  async function handleToggleUser(u: User) {
    try {
      await fetch(`/api/users/${u.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !u.active }),
      })
      await loadData()
    } catch {}
  }

  // ── Role modal ──────────────────────────────────────────────

  function openAddRole() {
    setEditingRole(null)
    setRoleForm({ name: "", description: "", color: "blue" })
    setPermMap(emptyPermMap())
    setRoleError("")
    setShowRoleModal(true)
  }

  function openEditRole(r: Role) {
    setEditingRole(r)
    setRoleForm({ name: r.name, description: r.description || "", color: r.color })
    setPermMap(permissionsToMap(r.permissions))
    setRoleError("")
    setShowRoleModal(true)
  }

  function togglePerm(module: string, action: string, value: boolean) {
    setPermMap(prev => {
      const updated = { ...prev, [module]: { ...prev[module], [action]: value } }
      // if any action enabled, auto-enable view
      if (action !== 'can_view' && value) updated[module].can_view = true
      // if view disabled, disable all
      if (action === 'can_view' && !value) {
        updated[module] = { can_view: false, can_create: false, can_edit: false, can_delete: false }
      }
      return updated
    })
  }

  function toggleFullModule(module: string, full: boolean) {
    setPermMap(prev => ({
      ...prev,
      [module]: { can_view: full, can_create: full, can_edit: full, can_delete: full },
    }))
  }

  function toggleAllModules(full: boolean) {
    const newMap: PermMap = {}
    for (const mod of MODULES) {
      newMap[mod.key] = { can_view: full, can_create: full, can_edit: full, can_delete: full }
    }
    setPermMap(newMap)
  }

  function moduleIsFullAccess(module: string) {
    const p = permMap[module]
    return p?.can_view && p?.can_create && p?.can_edit && p?.can_delete
  }

  async function handleSaveRole() {
    if (!roleForm.name) { setRoleError("Role name is required"); return }
    setSaving(true); setRoleError("")
    try {
      const url    = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...roleForm, permissions: permMapToArray(permMap) }),
      })
      const data = await res.json()
      if (!res.ok) { setRoleError(data.error || 'Error saving role'); setSaving(false); return }
      setShowRoleModal(false)
      await loadData()
    } catch { setRoleError('Connection error') }
    setSaving(false)
  }

  async function handleDeleteRole(r: Role) {
    if (!confirm(`Delete role "${r.name}"? Users with this role will have their role cleared.`)) return
    try {
      const res = await fetch(`/api/roles/${r.id}`, { method: 'DELETE' })
      if (!res.ok) { alert('Cannot delete a system role.'); return }
      await loadData()
    } catch {}
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Users & Permissions</h1>
          <p className="text-sm text-muted-foreground">Manage team access and roles</p>
        </div>
        <Button onClick={openAddUser} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4"/> Add User
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Team Members ── */}
        <Card className="bg-[#1e1e1e] border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold shrink-0">
                Team Members ({users.length})
              </CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"/>
                <Input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name, email or phone..."
                  className="pl-8 h-8 text-sm bg-background border-border"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => {
                    if (!userSearch.trim()) return true
                    const q = userSearch.toLowerCase()
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.phone?.includes(q) ||
                      u.role_name?.toLowerCase().includes(q)
                    )
                  }).map(u => {
                    const c = u.role_color ? colorClasses(u.role_color) : colorClasses('gray')
                    return (
                      <TableRow key={u.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/20 text-primary text-sm">{initials(u.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {u.email || (u.phone ? formatPhone(u.phone) : '—')}
                              </p>
                              {u.email && u.phone && (
                                <p className="text-xs text-muted-foreground">{formatPhone(u.phone)}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.role_name ? (
                            <Badge variant="outline" className={`${c.border} ${c.bg} ${c.text}`}>{u.role_name}</Badge>
                          ) : u.role_id ? (
                            <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-yellow-700 text-xs">⚠ Rol #{u.role_id} no encontrado</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={u.active} onCheckedChange={() => handleToggleUser(u)} className="scale-90"/>
                            <span className={u.active ? "text-green-500 text-xs" : "text-muted-foreground text-xs"}>
                              {u.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditUser(u)}>
                              <Edit className="h-4 w-4"/>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => handleToggleUser(u)}>
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Roles Panel ── */}
        <Card className="bg-[#1e1e1e] border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Roles</CardTitle>
              <Button size="sm" variant="outline" onClick={openAddRole}
                className="border-border h-7 text-xs gap-1">
                <Plus className="h-3 w-3"/> New Role
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map(r => {
              const c = colorClasses(r.color)
              const totalPerms = r.permissions.reduce((sum, p) =>
                sum + p.can_view + p.can_create + p.can_edit + p.can_delete, 0)
              return (
                <div key={r.id} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${c.border} ${c.bg} ${c.text} text-xs`}>{r.name}</Badge>
                      {r.is_system && <span className="text-[10px] text-muted-foreground">system</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditRole(r)}>
                        <Edit className="h-3 w-3"/>
                      </Button>
                      {!r.is_system && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDeleteRole(r)}>
                          <Trash2 className="h-3 w-3"/>
                        </Button>
                      )}
                    </div>
                  </div>
                  {r.description && <p className="mt-1.5 text-xs text-muted-foreground">{r.description}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {totalPerms === 0 ? "No permissions" : `${totalPerms} permissions across ${r.permissions.filter(p => p.can_view).length} modules`}
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── USER MODAL ─────────────────────────────────────────── */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? `Edit — ${editingUser.name}` : "Add User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <div className="relative">
                <Input
                  value={userForm.name}
                  onChange={e => handleNameChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="John Smith"
                  autoComplete="off"
                  className="bg-background border-border"
                />
                {showSuggestions && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-border bg-[#1e1e1e] shadow-lg overflow-hidden">
                    <p className="px-3 py-1.5 text-[10px] text-amber-400 border-b border-border">
                      Existing users matching this name:
                    </p>
                    {nameSuggestions.slice(0, 5).map(u => (
                      <button
                        key={u.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/20 flex items-center justify-between"
                        onMouseDown={() => {
                          openEditUser(u)
                        }}
                      >
                        <span className="text-foreground">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email || u.phone || '—'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  placeholder="user@email.com"
                  autoComplete="off"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formatPhone(userForm.phone)}
                  onChange={e => setUserForm({...userForm, phone: e.target.value.replace(/\D/g, '')})}
                  placeholder="(561) 000-0000"
                  autoComplete="off"
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{editingUser ? "New Password (leave blank to keep)" : "Password *"}</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={e => setUserForm({...userForm, password: e.target.value})}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={userForm.role_id} onValueChange={v => setUserForm({...userForm, role_id: v})}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select a role...">
                    {userForm.role_id ? roles.find(r => r.id === parseInt(userForm.role_id))?.name : "Select a role..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-border">
                  {roles.map(r => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {userError && <p className="text-sm text-red-500">{userError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)} className="border-border">Cancel</Button>
            <Button onClick={handleSaveUser} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? "Saving..." : editingUser ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ROLE MODAL ─────────────────────────────────────────── */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary"/>
              {editingRole ? `Edit Role — ${editingRole.name}` : "New Role"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Role info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Role Name *</Label>
                <Input value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                  placeholder="Manager" className="bg-background border-border"
                  disabled={Boolean(editingRole?.is_system)}/>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})}
                  placeholder="Brief description..." className="bg-background border-border"/>
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c.value} onClick={() => setRoleForm({...roleForm, color: c.value})}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${c.bg} ${roleForm.color === c.value ? `${c.border} scale-125` : 'border-transparent'}`}>
                    <span className={`block w-full h-full rounded-full ${c.bg}`}/>
                  </button>
                ))}
              </div>
            </div>

            {/* Permission matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                <div className="flex gap-2">
                  <button onClick={() => toggleAllModules(true)}
                    className="text-xs text-primary hover:underline">Enable all</button>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button onClick={() => toggleAllModules(false)}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline">Clear all</button>
                </div>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-5 gap-0 bg-muted/30 border-b border-border px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">Module</span>
                  {ACTIONS.map(a => (
                    <span key={a.key} className="text-xs font-medium text-muted-foreground text-center">{a.label}</span>
                  ))}
                </div>

                {/* Rows */}
                {MODULES.map((mod, idx) => {
                  const p    = permMap[mod.key] || {}
                  const full = moduleIsFullAccess(mod.key)
                  return (
                    <div key={mod.key}
                      className={`grid grid-cols-5 gap-0 px-3 py-2.5 items-center ${idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'} border-b border-border last:border-0`}>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleFullModule(mod.key, !full)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${full ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary'}`}>
                          {full && <Check className="w-2.5 h-2.5 text-white"/>}
                        </button>
                        <span className="text-sm text-foreground">{mod.label}</span>
                      </div>
                      {ACTIONS.map(a => (
                        <div key={a.key} className="flex justify-center">
                          <button
                            onClick={() => togglePerm(mod.key, a.key, !p[a.key])}
                            className={`w-5 h-5 rounded border transition-colors ${p[a.key] ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-primary'}`}>
                            {p[a.key] && <Check className="w-3 h-3 text-white m-auto mt-[1px]"/>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Click the module name checkbox to toggle full access · Individual checkboxes override each action
              </p>
            </div>

            {roleError && <p className="text-sm text-red-500">{roleError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)} className="border-border">Cancel</Button>
            <Button onClick={handleSaveRole} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
