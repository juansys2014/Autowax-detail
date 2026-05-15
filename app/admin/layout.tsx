"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Shield,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const sidebarItems = [
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Sellers", href: "/admin/sellers", icon: UserCheck },
  { name: "Commissions", href: "/admin/commissions", icon: DollarSign },
  { name: "Billing / Invoices", href: "/admin/billing", icon: FileText },
  { name: "Users & Permissions", href: "/admin/users", icon: Shield },
  { name: "Catalog & Prices", href: "/admin/catalog", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function SidebarContent({ collapsed, onCollapse }: { collapsed: boolean; onCollapse?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-red">
              <span className="font-heading text-sm text-white">AW</span>
            </div>
            <span className="font-heading text-lg text-white">AUTO WAX</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded bg-brand-red">
            <span className="font-heading text-sm text-white">AW</span>
          </div>
        )}
        {onCollapse && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/appointments" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Back to Site */}
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r border-border transition-all duration-300 lg:block",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-[#1e1e1e] px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">AD</span>
            </div>
            <span className="hidden text-sm font-medium sm:inline text-white">Admin</span>
            <button
              onClick={() => {
                document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
                window.location.href = "/login"
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors border border-[#2a2a2a] hover:border-[#3a3a3a]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
