"use client"

import { formatPhone } from '@/lib/utils/format'
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"staff" | "seller">("staff")

  // Staff login state
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError] = useState("")

  // Seller login state
  const [phone, setPhone]             = useState("")
  const [sellerLoading, setSellerLoading] = useState(false)
  const [sellerError, setSellerError] = useState("")

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStaffError(""); setStaffLoading(true)
    try {
      const res  = await fetch('/api/auth/staff-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setStaffError(data.error || 'Invalid credentials'); setStaffLoading(false); return }
      router.push('/admin')
    } catch { setStaffError('Connection error') }
    setStaffLoading(false)
  }

  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSellerError(""); setSellerLoading(true)
    try {
      // Strip formatting — only digits
      const digits = phone.replace(/\D/g, '')
      const res  = await fetch('/api/auth/seller-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      })
      const data = await res.json()
      if (!res.ok) { setSellerError(data.error || 'Phone not found'); setSellerLoading(false); return }
      // Save seller id for PWA
      localStorage.setItem('seller_id', String(data.seller_id))
      router.push('/seller')
    } catch { setSellerError('Connection error') }
    setSellerLoading(false)
  }

  const formatPhone = (value: string) => {
    const n = value.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 3) return n
    if (n.length <= 6) return `(${n.slice(0,3)}) ${n.slice(3)}`
    return `(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}`
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-[#e8151a] flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">AUTO WAX</h1>
              <p className="text-xs text-[#e8151a] font-medium -mt-1">South Florida</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-[#2a2a2a]">
            {(['staff','seller'] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setStaffError(''); setSellerError('') }}
                className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-foreground bg-[#1e1e1e] border-b-2 border-[#4a8fe8]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                {tab === 'staff' ? 'Staff Login' : 'Seller Login'}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── STAFF LOGIN ── */}
            {activeTab === 'staff' && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="admin@autowax.com" required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4a8fe8] transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4a8fe8] transition-colors"/>
                </div>
                {staffError && <p className="text-sm text-[#e8151a]">{staffError}</p>}
                <button type="submit" disabled={staffLoading}
                  className="w-full py-3 bg-[#e8151a] hover:bg-[#c91016] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  {staffLoading ? <><Spinner/>Signing In...</> : 'Sign In'}
                </button>
              </form>
            )}

            {/* ── SELLER LOGIN ── */}
            {activeTab === 'seller' && (
              <form onSubmit={handleSellerLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg">
                      <span className="text-lg">🇺🇸</span>
                      <span className="text-sm text-muted-foreground">+1</span>
                    </div>
                    <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g, '').slice(0,11))}
                      placeholder="(561) 000-0000" required
                      className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4a8fe8] transition-colors"/>
                  </div>
                </div>
                {sellerError && <p className="text-sm text-[#e8151a]">{sellerError}</p>}
                <button type="submit" disabled={sellerLoading}
                  className="w-full py-3 bg-[#4a8fe8] hover:bg-[#3a7fd8] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  {sellerLoading ? <><Spinner/>Signing In...</> : 'Sign In'}
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  Log in with your registered phone number
                </p>
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 space-y-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Test accounts:</p>
                  {[['15612000001','Javier Lopez'],['15612000002','Maria Garcia'],['15612000003','Roberto Cruz']].map(([p,n])=>(
                    <button key={p} type="button" onClick={()=>setPhone(p)}
                      className="w-full text-left text-xs text-gray-400 hover:text-white px-2 py-1 hover:bg-[#1e1e1e] rounded transition-colors">
                      {n} — {p}
                    </button>
                  ))}
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} Auto Wax South Florida. All rights reserved.
        </p>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  )
}
