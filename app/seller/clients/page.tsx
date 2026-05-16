"use client"

import { formatPhone } from '@/lib/utils/format'
import { useState } from "react"

interface Client {
  id: number
  name: string
  phone: string
  lastService: string
  totalServices: number
  commissionEarned: number
  services: {
    id: number
    date: string
    service: string
    amount: number
    commission: number
  }[]
}

const clientsData: Client[] = [
  {
    id: 1,
    name: "Maria Santos",
    phone: "(305) 555-0123",
    lastService: "May 12, 2026",
    totalServices: 8,
    commissionEarned: 185.00,
    services: [
      { id: 1, date: "May 12, 2026", service: "Full Detail", amount: 250, commission: 25 },
      { id: 2, date: "Apr 28, 2026", service: "Interior Clean", amount: 120, commission: 12 },
      { id: 3, date: "Apr 10, 2026", service: "Ceramic Coating", amount: 450, commission: 45 },
      { id: 4, date: "Mar 22, 2026", service: "Full Detail", amount: 250, commission: 25 },
    ],
  },
  {
    id: 2,
    name: "John Davis",
    phone: "(786) 555-0456",
    lastService: "May 10, 2026",
    totalServices: 5,
    commissionEarned: 120.00,
    services: [
      { id: 1, date: "May 10, 2026", service: "Exterior Wash", amount: 80, commission: 8 },
      { id: 2, date: "Apr 15, 2026", service: "Full Detail", amount: 250, commission: 25 },
      { id: 3, date: "Mar 30, 2026", service: "Interior Clean", amount: 120, commission: 12 },
    ],
  },
  {
    id: 3,
    name: "Ana Rodriguez",
    phone: "(954) 555-0789",
    lastService: "May 8, 2026",
    totalServices: 3,
    commissionEarned: 75.00,
    services: [
      { id: 1, date: "May 8, 2026", service: "Paint Correction", amount: 350, commission: 35 },
      { id: 2, date: "Apr 20, 2026", service: "Full Detail", amount: 250, commission: 25 },
    ],
  },
  {
    id: 4,
    name: "Michael Brown",
    phone: "(305) 555-0321",
    lastService: "May 5, 2026",
    totalServices: 12,
    commissionEarned: 310.00,
    services: [
      { id: 1, date: "May 5, 2026", service: "Full Detail", amount: 250, commission: 25 },
      { id: 2, date: "Apr 18, 2026", service: "Ceramic Coating", amount: 450, commission: 45 },
      { id: 3, date: "Apr 2, 2026", service: "Full Detail", amount: 250, commission: 25 },
    ],
  },
  {
    id: 5,
    name: "Sofia Garcia",
    phone: "(786) 555-0654",
    lastService: "May 1, 2026",
    totalServices: 2,
    commissionEarned: 50.00,
    services: [
      { id: 1, date: "May 1, 2026", service: "Interior Clean", amount: 120, commission: 12 },
      { id: 2, date: "Apr 12, 2026", service: "Exterior Wash", amount: 80, commission: 8 },
    ],
  },
]

export default function SellerClientsPage() {
  const [search, setSearch] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const filteredClients = clientsData.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search)
  )

  if (selectedClient) {
    return (
      <div className="px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedClient(null)}
          className="flex items-center gap-2 text-[#4a8fe8] mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </button>

        {/* Client Header */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a] mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#4a8fe8]/20 flex items-center justify-center">
              <span className="text-[#4a8fe8] text-xl font-semibold">
                {selectedClient.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{selectedClient.name}</h2>
              <p className="text-sm text-neutral-400">{formatPhone(selectedClient.phone)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{selectedClient.totalServices}</p>
              <p className="text-xs text-neutral-400">Services</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-500">${selectedClient.commissionEarned.toFixed(2)}</p>
              <p className="text-xs text-neutral-400">Earned</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#4a8fe8]">{selectedClient.lastService.split(",")[0]}</p>
              <p className="text-xs text-neutral-400">Last Visit</p>
            </div>
          </div>
        </div>

        {/* Service History */}
        <h3 className="text-base font-semibold text-white mb-3">Service History</h3>
        <div className="space-y-3">
          {selectedClient.services.map((service) => (
            <div
              key={service.id}
              className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-white">{service.service}</p>
                  <p className="text-xs text-neutral-500">{service.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-400">${service.amount}</p>
                  <p className="text-xs text-green-500">+${service.commission} commission</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-white mb-4">My Clients</h1>

      {/* Search Bar */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#4a8fe8]"
        />
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <button
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className="w-full bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex items-center gap-3 hover:border-[#3a3a3a] transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-[#4a8fe8]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#4a8fe8] font-semibold">
                {client.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{client.name}</p>
              <p className="text-xs text-neutral-500">{formatPhone(client.phone)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-green-500">${client.commissionEarned.toFixed(2)}</p>
              <p className="text-xs text-neutral-500">{client.totalServices} services</p>
            </div>
            <svg className="w-5 h-5 text-neutral-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-neutral-400">No clients found</p>
        </div>
      )}
    </div>
  )
}
