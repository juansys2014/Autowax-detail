"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      const digits = phone.replace(/\D/g, "")
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
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#e8151a] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#e8151a]/30">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AUTO WAX</h1>
        <p className="text-sm text-[#e8151a] font-medium">South Florida — Seller Portal</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Número de teléfono
            </label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-4 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
                <span className="text-xl">🇺🇸</span>
                <span className="text-gray-400 font-medium">+1</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="561 000 0000"
                required
                autoFocus
                className="flex-1 px-4 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[#4a8fe8] text-base transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g,"").length < 10}
            className="w-full py-4 bg-[#e8151a] hover:bg-[#c91016] disabled:opacity-40 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            {loading ? <><Spinner /> Entrando...</> : "Ingresar"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-600 mt-6">
          Usá el número con el que te registraron en el sistema
        </p>
      </div>
    </div>
  )
}
