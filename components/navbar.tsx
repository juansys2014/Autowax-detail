"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#why-us", label: "Why Us" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<"EN" | "ES">("EN")

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-royal to-navy rounded-lg flex items-center justify-center">
              <span className="font-heading text-white text-sm">AW</span>
            </div>
            <span className="font-heading text-white text-lg hidden sm:block">AUTO WAX</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-condensed text-muted-foreground hover:text-white transition-colors uppercase tracking-wide text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="font-condensed text-muted-foreground hover:text-white transition-colors uppercase tracking-wide text-sm"
            >
              Staff Login
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setLanguage("EN")}
                className={`px-3 py-1 rounded text-sm font-condensed transition-colors ${
                  language === "EN" ? "bg-royal text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("ES")}
                className={`px-3 py-1 rounded text-sm font-condensed transition-colors ${
                  language === "ES" ? "bg-royal text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                ES
              </button>
            </div>

            {/* Book Now Button */}
            <Link href="/book">
              <Button className="bg-brand-red hover:bg-brand-red/90 text-white font-condensed uppercase tracking-wide">
                Book Now
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-condensed text-muted-foreground hover:text-white transition-colors uppercase tracking-wide text-sm py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="font-condensed text-muted-foreground hover:text-white transition-colors uppercase tracking-wide text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Staff Login
              </Link>
              <Link
                href="/book"
                className="font-condensed text-white uppercase tracking-wide text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now →
              </Link>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
                <button
                  onClick={() => setLanguage("EN")}
                  className={`px-3 py-1 rounded text-sm font-condensed transition-colors ${
                    language === "EN" ? "bg-royal text-white" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("ES")}
                  className={`px-3 py-1 rounded text-sm font-condensed transition-colors ${
                    language === "ES" ? "bg-royal text-white" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  ES
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
