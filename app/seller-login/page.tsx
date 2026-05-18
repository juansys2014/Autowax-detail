"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

function Spinner() {
  return (
    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  )
}

export default function SellerLoginPage() {
  const router = useRouter()
  const [phone, setPhone]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const digits = phone.replace(/\D/g, "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      const res  = await fetch("/api/auth/seller-login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Teléfono no registrado"); setLoading(false); return }
      localStorage.setItem("seller_id", String(data.seller?.id ?? ""))
      router.push("/seller")
    } catch { setError("Error de conexión") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col px-6"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Logo */}
      <div className="flex flex-col items-center pt-20 pb-10">
        <div className="w-24 h-24 rounded-3xl bg-[#e8151a] flex items-center justify-center mb-5 shadow-2xl shadow-[#e8151a]/40">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z"/>
          </svg>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">AUTO WAX</h1>
        <p className="text-base text-[#e8151a] font-semibold mt-1">South Florida — Seller Portal</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-base font-medium text-gray-400 mb-3">
            Número de teléfono
          </label>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl">
              <span className="text-2xl">🇺🇸</span>
              <span className="text-gray-400 font-semibold text-lg">+1</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="561 000 0000"
              required
              autoFocus
              className="flex-1 px-5 py-5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-xl transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-base text-red-400 text-center">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit as any}
          disabled={loading || digits.length < 10}
          className="w-full py-5 bg-[#e8151a] hover:bg-[#c91016] active:bg-[#a50d12] disabled:opacity-40 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-3 text-xl shadow-lg shadow-[#e8151a]/20"
        >
          {loading ? <><Spinner /> Entrando...</> : "Ingresar"}
        </button>

        <p className="text-sm text-center text-gray-600 pt-1">
          Usá el número con el que te registraron en el sistema
        </p>
      </div>

    </div>
  )
}
