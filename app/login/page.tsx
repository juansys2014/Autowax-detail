"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"staff" | "seller">("staff")
  
  // Staff login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError] = useState("")
  
  // Seller login state
  const [phone, setPhone] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [sellerLoading, setSellerLoading] = useState(false)
  const [sellerError, setSellerError] = useState("")

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStaffError("")
    setStaffLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock validation - in production this would be a real API call
    if (email && password) {
      // Redirect to admin dashboard
      router.push("/admin")
    } else {
      setStaffError("Please enter valid credentials")
    }
    setStaffLoading(false)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setSellerError("")
    
    if (phone.length < 10) {
      setSellerError("Please enter a valid phone number")
      return
    }
    
    setSellerLoading(true)
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 1500))
    setOtpSent(true)
    setSellerLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSellerError("")
    
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      setSellerError("Please enter the complete verification code")
      return
    }
    
    setSellerLoading(true)
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Redirect to seller PWA
    router.push("/seller")
    setSellerLoading(false)
  }

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
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
              <h1 className="text-2xl font-sans font-bold text-foreground tracking-tight">AUTO WAX</h1>
              <p className="text-xs text-[#e8151a] font-medium -mt-1">South Florida</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#2a2a2a]">
            <button
              onClick={() => {
                setActiveTab("staff")
                setSellerError("")
                setStaffError("")
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "staff"
                  ? "text-foreground bg-[#1e1e1e] border-b-2 border-[#4a8fe8]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Staff Login
            </button>
            <button
              onClick={() => {
                setActiveTab("seller")
                setSellerError("")
                setStaffError("")
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === "seller"
                  ? "text-foreground bg-[#1e1e1e] border-b-2 border-[#4a8fe8]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Seller Login
            </button>
          </div>

          <div className="p-6">
            {/* Staff Login Form */}
            {activeTab === "staff" && (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@autowax.com"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4a8fe8] transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4a8fe8] transition-colors"
                    required
                  />
                </div>

                {staffError && (
                  <p className="text-sm text-[#e8151a]">{staffError}</p>
                )}

                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full py-3 bg-[#e8151a] hover:bg-[#c91016] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {staffLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="text-center">
                  <button type="button" className="text-sm text-[#4a8fe8] hover:underline">
                    Forgot password?
                  </button>
                </div>
              </form>
            )}

            {/* Seller Login Form */}
            {activeTab === "seller" && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground">
                          <span className="text-lg">🇺🇸</span>
                          <span className="text-sm text-muted-foreground">+1</span>
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                          placeholder="(555) 123-4567"
                          className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4a8fe8] transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {sellerError && (
                      <p className="text-sm text-[#e8151a]">{sellerError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={sellerLoading}
                      className="w-full py-3 bg-[#4a8fe8] hover:bg-[#3a7fd8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {sellerLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending Code...
                        </>
                      ) : (
                        "Send Code"
                      )}
                    </button>

                    <p className="text-xs text-center text-muted-foreground">
                      Sellers log in with their registered phone number
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        We sent a verification code to
                      </p>
                      <p className="text-foreground font-medium">+1 {phone}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-3 text-center">
                        Enter Verification Code
                      </label>
                      <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 text-center text-xl font-bold bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-foreground focus:outline-none focus:border-[#4a8fe8] transition-colors"
                          />
                        ))}
                      </div>
                    </div>

                    {sellerError && (
                      <p className="text-sm text-[#e8151a] text-center">{sellerError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={sellerLoading}
                      className="w-full py-3 bg-[#e8151a] hover:bg-[#c91016] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {sellerLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </button>

                    <div className="text-center space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp(["", "", "", "", "", ""])
                          setSellerError("")
                        }}
                        className="text-sm text-[#4a8fe8] hover:underline"
                      >
                        Change phone number
                      </button>
                      <p className="text-xs text-muted-foreground">
                        Didn&apos;t receive the code?{" "}
                        <button type="button" className="text-[#4a8fe8] hover:underline">
                          Resend
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} Auto Wax South Florida. All rights reserved.
        </p>
      </div>
    </div>
  )
}
