"use client"

import { Search, Phone, Mail, Car } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const clients = [
  { id: 1, name: "John Martinez", email: "john.m@email.com", phone: "(305) 555-0123", vehicle: "2024 BMW M4", visits: 5, totalSpent: 2150, lastVisit: "May 15, 2026", referredBy: "Carlos Reyes" },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@email.com", phone: "(786) 555-0456", vehicle: "2023 Tesla Model S", visits: 3, totalSpent: 1450, lastVisit: "May 14, 2026", referredBy: "Direct" },
  { id: 3, name: "Mike Thompson", email: "mike.t@email.com", phone: "(954) 555-0789", vehicle: "2022 Mercedes GLE", visits: 7, totalSpent: 3200, lastVisit: "May 13, 2026", referredBy: "Ana Lopez" },
  { id: 4, name: "Emily Davis", email: "emily.d@email.com", phone: "(305) 555-0234", vehicle: "2023 Porsche 911", visits: 2, totalSpent: 850, lastVisit: "May 10, 2026", referredBy: "Direct" },
  { id: 5, name: "Robert Wilson", email: "robert.w@email.com", phone: "(786) 555-0567", vehicle: "2024 Audi RS6", visits: 4, totalSpent: 1800, lastVisit: "May 8, 2026", referredBy: "Carlos Reyes" },
  { id: 6, name: "Lisa Anderson", email: "lisa.a@email.com", phone: "(954) 555-0890", vehicle: "2023 Range Rover", visits: 6, totalSpent: 2700, lastVisit: "May 5, 2026", referredBy: "Direct" },
]

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground">Manage your client database</p>
      </div>

      {/* Search */}
      <Card className="bg-[#1e1e1e] border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              className="pl-9 bg-background border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="bg-[#1e1e1e] border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">All Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Client</TableHead>
                  <TableHead className="text-muted-foreground">Vehicle</TableHead>
                  <TableHead className="text-muted-foreground">Visits</TableHead>
                  <TableHead className="text-muted-foreground">Total Spent</TableHead>
                  <TableHead className="text-muted-foreground">Last Visit</TableHead>
                  <TableHead className="text-muted-foreground">Referred By</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{client.vehicle}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{client.visits}</TableCell>
                    <TableCell className="font-medium text-green-500">${client.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{client.lastVisit}</TableCell>
                    <TableCell>
                      {client.referredBy === "Direct" ? (
                        <span className="text-muted-foreground">Direct</span>
                      ) : (
                        <span className="text-primary">{client.referredBy}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
