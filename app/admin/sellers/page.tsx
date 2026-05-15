"use client"

import { useState } from "react"
import { Plus, Search, Edit, QrCode, Trash2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Seller {
  id: number
  name: string
  phone: string
  clientsCount: number
  pendingCommission: number
  totalEarned: number
  isActive: boolean
  commissionType: "percentage" | "fixed"
  commissionValue: number
}

const initialSellers: Seller[] = [
  { id: 1, name: "Carlos Reyes", phone: "(305) 555-1234", clientsCount: 24, pendingCommission: 340, totalEarned: 2450, isActive: true, commissionType: "percentage", commissionValue: 10 },
  { id: 2, name: "Ana Lopez", phone: "(786) 555-5678", clientsCount: 18, pendingCommission: 120, totalEarned: 1890, isActive: true, commissionType: "percentage", commissionValue: 10 },
  { id: 3, name: "Miguel Santos", phone: "(954) 555-9012", clientsCount: 12, pendingCommission: 0, totalEarned: 980, isActive: true, commissionType: "fixed", commissionValue: 50 },
  { id: 4, name: "Sofia Martinez", phone: "(305) 555-3456", clientsCount: 8, pendingCommission: 85, totalEarned: 620, isActive: false, commissionType: "percentage", commissionValue: 12 },
  { id: 5, name: "Diego Fernandez", phone: "(786) 555-7890", clientsCount: 15, pendingCommission: 200, totalEarned: 1340, isActive: true, commissionType: "percentage", commissionValue: 10 },
]

const services = [
  { name: "Full Detail", defaultPrice: 350 },
  { name: "Ceramic Coating", defaultPrice: 800 },
  { name: "Paint Correction", defaultPrice: 500 },
  { name: "Interior Deep Clean", defaultPrice: 200 },
  { name: "Exterior Wash & Wax", defaultPrice: 150 },
]

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>(initialSellers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [newSeller, setNewSeller] = useState({
    name: "",
    phone: "",
    commissionType: "percentage" as "percentage" | "fixed",
    commissionValue: 10,
  })

  const filteredSellers = sellers.filter((seller) =>
    seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.phone.includes(searchQuery)
  )

  const toggleSellerStatus = (id: number) => {
    setSellers(sellers.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ))
  }

  const handleAddSeller = () => {
    const seller: Seller = {
      id: Date.now(),
      name: newSeller.name,
      phone: newSeller.phone,
      clientsCount: 0,
      pendingCommission: 0,
      totalEarned: 0,
      isActive: true,
      commissionType: newSeller.commissionType,
      commissionValue: newSeller.commissionValue,
    }
    setSellers([...sellers, seller])
    setIsAddModalOpen(false)
    setNewSeller({ name: "", phone: "", commissionType: "percentage", commissionValue: 10 })
  }

  const handleViewQR = (seller: Seller) => {
    setSelectedSeller(seller)
    setIsQRModalOpen(true)
  }

  const handleDeleteSeller = (id: number) => {
    setSellers(sellers.filter((s) => s.id !== id))
  }

  const getRefLink = (seller: Seller) => {
    const sellerSlug = seller.name.replace(/\s+/g, "")
    return `autowaxsfl.com/book?ref=${sellerSlug}`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Sellers</h1>
          <p className="text-sm text-muted-foreground">Manage your referral partners</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Seller
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-[#1e1e1e] border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sellers by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card className="bg-[#1e1e1e] border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">All Sellers ({filteredSellers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Seller</TableHead>
                  <TableHead className="text-muted-foreground">Clients</TableHead>
                  <TableHead className="text-muted-foreground">Pending Commission</TableHead>
                  <TableHead className="text-muted-foreground">Total Earned</TableHead>
                  <TableHead className="text-muted-foreground">Commission</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No sellers found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSellers.map((seller) => (
                    <TableRow key={seller.id} className="border-border">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{seller.name}</p>
                          <p className="text-xs text-muted-foreground">{seller.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{seller.clientsCount}</TableCell>
                      <TableCell>
                        {seller.pendingCommission > 0 ? (
                          <span className="font-medium text-yellow-500">${seller.pendingCommission}</span>
                        ) : (
                          <span className="text-muted-foreground">$0</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-green-500">${seller.totalEarned.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border">
                          {seller.commissionType === "percentage" ? `${seller.commissionValue}%` : `$${seller.commissionValue}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={seller.isActive}
                            onCheckedChange={() => toggleSellerStatus(seller.id)}
                          />
                          <span className={seller.isActive ? "text-green-500 text-sm" : "text-muted-foreground text-sm"}>
                            {seller.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleViewQR(seller)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDeleteSeller(seller.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Seller Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seller Name</Label>
              <Input
                id="name"
                placeholder="Enter seller name"
                value={newSeller.name}
                onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="(305) 555-0000"
                value={newSeller.phone}
                onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Commission Type</Label>
              <Select
                value={newSeller.commissionType}
                onValueChange={(value: "percentage" | "fixed") => setNewSeller({ ...newSeller, commissionType: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-border">
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionValue">
                Commission Value {newSeller.commissionType === "percentage" ? "(per service)" : "(per referral)"}
              </Label>
              <Input
                id="commissionValue"
                type="number"
                placeholder={newSeller.commissionType === "percentage" ? "10" : "50"}
                value={newSeller.commissionValue}
                onChange={(e) => setNewSeller({ ...newSeller, commissionValue: Number(e.target.value) })}
                className="bg-background border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleAddSeller} className="bg-primary hover:bg-primary/90" disabled={!newSeller.name || !newSeller.phone}>
              Add Seller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Referral QR Code</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <p className="text-lg font-medium text-foreground">{selectedSeller.name}</p>
              {/* QR Code Placeholder */}
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-background">
                <div className="text-center">
                  <QrCode className="mx-auto h-16 w-16 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">QR Code</p>
                </div>
              </div>
              <div className="w-full space-y-2">
                <Label className="text-muted-foreground">Referral Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={getRefLink(selectedSeller)}
                    className="bg-background border-border text-sm"
                  />
                  <Button
                    variant="outline"
                    className="border-border shrink-0"
                    onClick={() => navigator.clipboard.writeText(`https://${getRefLink(selectedSeller)}`)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRModalOpen(false)} className="border-border">
              Close
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              Download QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
