"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    href: "/seller/qr",
    label: "My QR",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    href: "/seller/clients",
    label: "My Clients",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/seller/appointments",
    label: "Appointments",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/seller/commissions",
    label: "Earnings",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative">
        <div className="h-[env(safe-area-inset-top)] bg-[#0f0f0f]" />
        <main className="flex-1 overflow-y-auto pb-20">
          {/* Logo header */}
          <div className="flex items-center px-4 pt-4 pb-1">
            <div className="flex items-center gap-2">
              {/* Replace this div with <img src="/logo-app.png" className="h-8 w-auto" /> when you have the logo */}
              <div className="w-8 h-8 rounded-lg bg-[#e8151a] flex items-center justify-center">
                <span className="text-white font-bold text-xs">AW</span>
              </div>
              <span className="text-white font-semibold text-sm">Auto Wax</span>
            </div>
          </div>
          {children}
        </main>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#1a1a1a] border-t border-[#2a2a2a]">
          <div className="h-[env(safe-area-inset-bottom)] bg-[#1a1a1a]" />
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/seller/qr" && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                    isActive ? "text-[#4a8fe8]" : "text-neutral-400"
                  }`}>
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
