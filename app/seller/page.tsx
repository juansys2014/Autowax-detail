"use client"

const sellerData = {
  name: "Carlos Martinez",
  initials: "CM",
  stats: {
    referredClients: 47,
    pendingCommission: 385.00,
    paidThisMonth: 1250.00,
    activeClients: 32,
  },
  recentActivity: [
    { id: 1, type: "new_client", message: "New client referred: Maria Santos", time: "2 hours ago" },
    { id: 2, type: "commission", message: "Commission generated: $25.00 from Full Detail", time: "5 hours ago" },
    { id: 3, type: "payment", message: "Payment received: $150.00", time: "1 day ago" },
    { id: 4, type: "new_client", message: "New client referred: John Davis", time: "2 days ago" },
    { id: 5, type: "commission", message: "Commission generated: $35.00 from Ceramic Coating", time: "3 days ago" },
  ],
}

function getActivityIcon(type: string) {
  switch (type) {
    case "new_client":
      return (
        <div className="w-10 h-10 rounded-full bg-[#4a8fe8]/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#4a8fe8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
      )
    case "commission":
      return (
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      )
    case "payment":
      return (
        <div className="w-10 h-10 rounded-full bg-[#e8151a]/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#e8151a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    default:
      return null
  }
}

export default function SellerHomePage() {
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-neutral-400 text-sm">Welcome back</p>
          <h1 className="text-xl font-semibold text-white">Hi, {sellerData.name.split(" ")[0]}</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#4a8fe8] flex items-center justify-center">
          <span className="text-white font-semibold">{sellerData.initials}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-[#4a8fe8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-neutral-400">Referred Clients</span>
          </div>
          <p className="text-2xl font-bold text-white">{sellerData.stats.referredClients}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-neutral-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-[#4a8fe8]">${sellerData.stats.pendingCommission.toFixed(2)}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-neutral-400">Paid This Month</span>
          </div>
          <p className="text-2xl font-bold text-green-500">${sellerData.stats.paidThisMonth.toFixed(2)}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-[#e8151a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs text-neutral-400">Active Clients</span>
          </div>
          <p className="text-2xl font-bold text-white">{sellerData.stats.activeClients}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {sellerData.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex items-center gap-3"
            >
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{activity.message}</p>
                <p className="text-xs text-neutral-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
