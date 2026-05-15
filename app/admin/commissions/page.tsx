"use client"

import { useState } from "react"
import { Search, Filter, Check, Calendar as CalendarIcon, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Commission {
  id: number
  seller: string
  client: string
  service: string
  invoiceAmount: number
  commissionAmount: number
  date: string
  status: "pending" | "paid"
  selected?: boolean
}

const initialCommissions: Commission[] = [
  { id: 1, seller: "Carlos Reyes", client: "John Martinez", service: "Full Detail", invoiceAmount: 350, commissionAmount: 35, date: "2026-05-15", status: "pending" },
  { id: 2, seller: "Ana Lopez", client: "Mike Thompson", service: "Paint Correction", invoiceAmount: 500, commissionAmount: 50, date: "2026-05-14", status: "pending" },
  { id: 3, seller: "Carlos Reyes", client: "Robert Wilson", service: "Full Detail", invoiceAmount: 350, commissionAmount: 35, date: "2026-05-13", status: "pending" },
  { id: 4, seller: "Diego Fernandez", client: "Sarah Johnson", service: "Ceramic Coating", invoiceAmount: 800, commissionAmount: 80, date: "2026-05-12", status: "paid" },
  { id: 5, seller: "Ana Lopez", client: "Emily Davis", service: "Interior Deep Clean", invoiceAmount: 200, commissionAmount: 20, date: "2026-05-11", status: "paid" },
  { id: 6, seller: "Carlos Reyes", client: "David Kim", service: "Ceramic Coating", invoiceAmount: 800, commissionAmount: 80, date: "2026-05-10", status: "paid" },
  { id: 7, seller: "Miguel Santos", client: "Lisa Anderson", service: "Full Detail", invoiceAmount: 350, commissionAmount: 50, date: "2026-05-09", status: "pending" },
  { id: 8, seller: "Diego Fernandez", client: "Chris Taylor", service: "Paint Correction", invoiceAmount: 500, commissionAmount: 50, date: "2026-05-08", status: "pending" },
  { id: 9, seller: "Ana Lopez", client: "Rachel Green", service: "Full Detail", invoiceAmount: 350, commissionAmount: 35, date: "2026-05-07", status: "paid" },
  { id: 10, seller: "Carlos Reyes", client: "Mark Stevens", service: "Interior Deep Clean", invoiceAmount: 200, commissionAmount: 20, date: "2026-05-06", status: "pending" },
]

const sellers = ["All Sellers", "Carlos Reyes", "Ana Lopez", "Diego Fernandez", "Miguel Santos", "Sofia Martinez"]

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all")
  const [sellerFilter, setSellerFilter] = useState("All Sellers")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [paymentNotes, setPaymentNotes] = useState("")

  const filteredCommissions = commissions.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (sellerFilter !== "All Sellers" && c.seller !== sellerFilter) return false
    if (dateRange.from && new Date(c.date) < dateRange.from) return false
    if (dateRange.to && new Date(c.date) > dateRange.to) return false
    return true
  })

  const pendingCommissions = filteredCommissions.filter((c) => c.status === "pending")
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const selectedTotal = selectedIds.reduce((sum, id) => {
    const commission = commissions.find((c) => c.id === id)
    return sum + (commission?.commissionAmount || 0)
  }, 0)

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingCommissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingCommissions.map((c) => c.id))
    }
  }

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleMarkAsPaid = (id: number) => {
    setCommissions(commissions.map((c) =>
      c.id === id ? { ...c, status: "paid" as const } : c
    ))
    setSelectedIds(selectedIds.filter((i) => i !== id))
  }

  const handlePaySelected = () => {
    setCommissions(commissions.map((c) =>
      selectedIds.includes(c.id) ? { ...c, status: "paid" as const } : c
    ))
    setSelectedIds([])
    setIsPayModalOpen(false)
    setPaymentNotes("")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Commissions</h1>
          <p className="text-sm text-muted-foreground">Track and pay seller commissions</p>
        </div>
        {selectedIds.length > 0 && (
          <Button onClick={() => setIsPayModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" />
            Pay Selected ({selectedIds.length}) - ${selectedTotal}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-[#1e1e1e] border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            <p className="text-2xl font-bold text-yellow-500">${totalPending}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Count</p>
            <p className="text-2xl font-bold text-foreground">{pendingCommissions.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Selected Total</p>
            <p className="text-2xl font-bold text-primary">${selectedTotal}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1e1e1e] border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-primary" : "border-border"}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
                className={statusFilter === "pending" ? "bg-yellow-600" : "border-border"}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("paid")}
                className={statusFilter === "paid" ? "bg-green-600" : "border-border"}
              >
                Paid
              </Button>
            </div>

            {/* Seller Filter */}
            <Select value={sellerFilter} onValueChange={setSellerFilter}>
              <SelectTrigger className="w-[180px] bg-background border-border">
                <SelectValue placeholder="Select seller" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e1e] border-border">
                {sellers.map((seller) => (
                  <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-border justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-border" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {(dateRange.from || sellerFilter !== "All Sellers") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange({ from: undefined, to: undefined })
                  setSellerFilter("All Sellers")
                }}
                className="text-muted-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card className="bg-[#1e1e1e] border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Commissions ({filteredCommissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedIds.length === pendingCommissions.length && pendingCommissions.length > 0}
                      onCheckedChange={toggleSelectAll}
                      disabled={pendingCommissions.length === 0}
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground">Seller</TableHead>
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground">Service</TableHead>
                  <TableHead className="text-muted-foreground">Invoice</TableHead>
                  <TableHead className="text-muted-foreground">Commission</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <p className="text-muted-foreground">No commissions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommissions.map((commission) => (
                    <TableRow key={commission.id} className="border-border">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(commission.id)}
                          onCheckedChange={() => toggleSelect(commission.id)}
                          disabled={commission.status === "paid"}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{commission.seller}</TableCell>
                      <TableCell className="text-foreground">{commission.client}</TableCell>
                      <TableCell className="text-foreground">{commission.service}</TableCell>
                      <TableCell className="text-foreground">${commission.invoiceAmount}</TableCell>
                      <TableCell className="font-medium text-green-500">${commission.commissionAmount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(commission.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        {commission.status === "pending" ? (
                          <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">Pending</Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-500">Paid</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {commission.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(commission.id)}
                            className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pay Selected Modal */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="bg-[#1e1e1e] border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Pay Selected Commissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Selected Commissions</span>
                <span className="font-medium text-foreground">{selectedIds.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-xl font-bold text-green-500">${selectedTotal}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start border-border bg-background">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(paymentDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-border">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={(date) => date && setPaymentDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add payment notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayModalOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handlePaySelected} className="bg-green-600 hover:bg-green-700">
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
