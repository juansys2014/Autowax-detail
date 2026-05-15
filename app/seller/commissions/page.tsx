"use client"

import { useState } from "react"

type TabType = "pending" | "history"

interface Commission {
  id: number
  clientName: string
  service: string
  amount: number
  date: string
  paymentDate?: string
  paidBy?: string
  reference?: string
}

const pendingCommissions: Commission[] = [
  { id: 1, clientName: "Maria Santos", service: "Full Detail", amount: 25.00, date: "May 12, 2026" },
  { id: 2, clientName: "John Davis", service: "Exterior Wash", amount: 8.00, date: "May 10, 2026" },
  { id: 3, clientName: "Ana Rodriguez", service: "Paint Correction", amount: 35.00, date: "May 8, 2026" },
  { id: 4, clientName: "Michael Brown", service: "Full Detail", amount: 25.00, date: "May 5, 2026" },
  { id: 5, clientName: "Sofia Garcia", service: "Interior Clean", amount: 12.00, date: "May 1, 2026" },
]

const historyCommissions: Commission[] = [
  { id: 1, clientName: "Maria Santos", service: "Interior Clean", amount: 12.00, date: "Apr 28, 2026", paymentDate: "Apr 30, 2026", paidBy: "Admin", reference: "ZELLE-001" },
  { id: 2, clientName: "Maria Santos", service: "Ceramic Coating", amount: 45.00, date: "Apr 10, 2026", paymentDate: "Apr 15, 2026", paidBy: "Admin", reference: "ZELLE-002" },
  { id: 3, clientName: "John Davis", service: "Full Detail", amount: 25.00, date: "Apr 15, 2026", paymentDate: "Apr 15, 2026", paidBy: "Admin", reference: "ZELLE-002" },
  { id: 4, clientName: "Ana Rodriguez", service: "Full Detail", amount: 25.00, date: "Apr 20, 2026", paymentDate: "Apr 25, 2026", paidBy: "Admin", reference: "ZELLE-003" },
  { id: 5, clientName: "Michael Brown", service: "Ceramic Coating", amount: 45.00, date: "Apr 18, 2026", paymentDate: "Apr 25, 2026", paidBy: "Admin", reference: "ZELLE-003" },
  { id: 6, clientName: "Michael Brown", service: "Full Detail", amount: 25.00, date: "Apr 2, 2026", paymentDate: "Apr 5, 2026", paidBy: "Admin", reference: "ZELLE-004" },
]

const totalPending = pendingCommissions.reduce((acc, c) => acc + c.amount, 0)
const totalEarnedAllTime = historyCommissions.reduce((acc, c) => acc + c.amount, 0)

export default function SellerCommissionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending")

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-white mb-4">My Commissions</h1>

      {/* Tabs */}
      <div className="flex bg-[#1a1a1a] rounded-xl p-1 mb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "pending"
              ? "bg-[#4a8fe8] text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "history"
              ? "bg-[#4a8fe8] text-white"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "pending" ? (
        <>
          {/* Total Pending */}
          <div className="bg-gradient-to-br from-[#4a8fe8] to-[#3a7fd8] rounded-2xl p-5 mb-4">
            <p className="text-white/80 text-sm mb-1">Total Pending</p>
            <p className="text-3xl font-bold text-white">${totalPending.toFixed(2)}</p>
            <p className="text-white/60 text-xs mt-2">
              {pendingCommissions.length} commissions awaiting payment
            </p>
          </div>

          {/* Pending List */}
          <div className="space-y-3">
            {pendingCommissions.map((commission) => (
              <div
                key={commission.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">{commission.clientName}</p>
                    <p className="text-xs text-neutral-500">{commission.service}</p>
                  </div>
                  <p className="text-lg font-semibold text-[#4a8fe8]">
                    ${commission.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {commission.date}
                </div>
              </div>
            ))}
          </div>

          {pendingCommissions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-neutral-400">No pending commissions</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* History List */}
          <div className="space-y-3 mb-4">
            {historyCommissions.map((commission) => (
              <div
                key={commission.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">{commission.clientName}</p>
                    <p className="text-xs text-neutral-500">{commission.service}</p>
                  </div>
                  <p className="text-lg font-semibold text-green-500">
                    ${commission.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Paid {commission.paymentDate}
                  </div>
                  <span className="text-neutral-600">{commission.reference}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total Earned */}
          <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm mb-1">Total Earned All-Time</p>
                <p className="text-2xl font-bold text-green-500">${totalEarnedAllTime.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
