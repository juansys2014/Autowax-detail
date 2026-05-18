"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function AutoLoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<"loading" | "error">("loading")

  useEffect(() => {
    const code = params.get("code")
    if (!code) { router.replace("/login"); return }

    fetch("/api/auth/seller-auto-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) router.replace("/seller")
        else setStatus("error")
      })
      .catch(() => setStatus("error"))
  }, [])

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-400 font-medium">Link inválido o seller inactivo.</p>
        <button onClick={() => router.replace("/login")}
          className="px-6 py-2 bg-[#e8151a] text-white rounded-lg text-sm font-medium">
          Ir al login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-[#e8151a] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Iniciando sesión...</p>
    </div>
  )
}

export default function SellerAutoLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#e8151a] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    }>
      <AutoLoginContent />
    </Suspense>
  )
}
