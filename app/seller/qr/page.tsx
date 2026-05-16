"use client"

import { useState, useEffect } from "react"

export default function SellerQRPage() {
  const [shared, setShared] = useState(false)
  const [sellerData, setSellerData] = useState<{
    name: string; code: string; referralUrl: string; initials: string
  } | null>(null)

  useEffect(() => {
    const sellerId = localStorage.getItem('seller_id')
    if (!sellerId) return
    fetch(`/api/sellers/${sellerId}/stats`)
      .then(r => r.json())
      .then(d => {
        if (d.seller) {
          const name = d.seller.name || 'Seller'
          const code = d.seller.qr_code || ''
          const url  = d.seller.qr_url  || `${window.location.origin}/book?ref=${code}`
          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
          setSellerData({ name, code, referralUrl: url, initials })
        }
      })
      .catch(() => {
        setSellerData({ name: 'Seller', code: '', referralUrl: window.location.origin + '/book', initials: 'S' })
      })
  }, [])

  const handleShare = async () => {
    if (!sellerData) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Book with Auto Wax South Florida",
          text: "Book your car detailing appointment with Auto Wax South Florida!",
          url: sellerData.referralUrl,
        })
      } catch {}
    } else {
      await navigator.clipboard.writeText(sellerData.referralUrl)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  return (
    <div className="px-4 py-6 flex flex-col items-center min-h-[calc(100vh-80px)]">
      <h1 className="text-xl font-semibold text-white mb-2">My Referral QR</h1>
      <p className="text-sm text-neutral-400 mb-8">Share with clients to book appointments</p>

      {/* QR Code */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg shadow-[#4a8fe8]/10">
        <div className="w-64 h-64 relative">
          <svg viewBox="0 0 256 256" className="w-full h-full">
            <rect fill="white" width="256" height="256"/>
            <rect fill="black" x="16" y="16" width="56" height="56"/>
            <rect fill="white" x="24" y="24" width="40" height="40"/>
            <rect fill="black" x="32" y="32" width="24" height="24"/>
            <rect fill="black" x="184" y="16" width="56" height="56"/>
            <rect fill="white" x="192" y="24" width="40" height="40"/>
            <rect fill="black" x="200" y="32" width="24" height="24"/>
            <rect fill="black" x="16" y="184" width="56" height="56"/>
            <rect fill="white" x="24" y="192" width="40" height="40"/>
            <rect fill="black" x="32" y="200" width="24" height="24"/>
            <rect fill="black" x="88" y="16" width="8" height="8"/>
            <rect fill="black" x="104" y="16" width="8" height="8"/>
            <rect fill="black" x="120" y="16" width="8" height="8"/>
            <rect fill="black" x="152" y="16" width="8" height="8"/>
            <rect fill="black" x="88" y="32" width="8" height="8"/>
            <rect fill="black" x="136" y="32" width="8" height="8"/>
            <rect fill="black" x="152" y="32" width="8" height="8"/>
            <rect fill="black" x="168" y="32" width="8" height="8"/>
            <rect fill="black" x="16" y="88" width="8" height="8"/>
            <rect fill="black" x="32" y="88" width="8" height="8"/>
            <rect fill="black" x="64" y="88" width="8" height="8"/>
            <rect fill="black" x="88" y="88" width="8" height="8"/>
            <rect fill="black" x="136" y="88" width="8" height="8"/>
            <rect fill="black" x="200" y="88" width="8" height="8"/>
            <rect fill="black" x="232" y="88" width="8" height="8"/>
            <rect fill="black" x="16" y="104" width="8" height="8"/>
            <rect fill="black" x="48" y="104" width="8" height="8"/>
            <rect fill="black" x="120" y="104" width="8" height="8"/>
            <rect fill="black" x="184" y="104" width="8" height="8"/>
            <rect fill="black" x="16" y="120" width="8" height="8"/>
            <rect fill="black" x="56" y="120" width="8" height="8"/>
            <rect fill="black" x="112" y="120" width="8" height="8"/>
            <rect fill="black" x="160" y="120" width="8" height="8"/>
            <rect fill="black" x="232" y="120" width="8" height="8"/>
            <rect fill="black" x="88" y="184" width="8" height="8"/>
            <rect fill="black" x="136" y="184" width="8" height="8"/>
            <rect fill="black" x="184" y="184" width="8" height="8"/>
            <rect fill="black" x="96" y="200" width="8" height="8"/>
            <rect fill="black" x="152" y="200" width="8" height="8"/>
            <rect fill="black" x="224" y="200" width="8" height="8"/>
            <rect fill="black" x="88" y="216" width="8" height="8"/>
            <rect fill="black" x="144" y="216" width="8" height="8"/>
            <rect fill="black" x="192" y="216" width="8" height="8"/>
            <rect fill="white" x="100" y="100" width="56" height="56" rx="8"/>
            <text x="128" y="135" textAnchor="middle" fill="#e8151a" fontSize="24" fontWeight="bold">AW</text>
          </svg>
        </div>
      </div>

      {/* Seller name */}
      {sellerData && (
        <>
          <h2 className="text-lg font-semibold text-white mb-1">{sellerData.name}</h2>
          <p className="text-sm text-neutral-400 mb-6">{sellerData.referralUrl}</p>
        </>
      )}

      {/* Buttons */}
      <div className="flex gap-3 w-full max-w-xs mb-6">
        <button onClick={handleShare}
          className="flex-1 bg-[#4a8fe8] hover:bg-[#3a7fd8] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          {shared ? "Copied!" : "Share Link"}
        </button>
        <button onClick={async () => {
          if (!sellerData) return
          await navigator.clipboard.writeText(sellerData.referralUrl)
          setShared(true)
          setTimeout(() => setShared(false), 2000)
        }}
          className="flex-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#3a3a3a]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          Copy Link
        </button>
      </div>

      {/* Info */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] w-full max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4a8fe8]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#4a8fe8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Share this link with your clients so they can book their appointment directly.
          </p>
        </div>
      </div>
    </div>
  )
}
