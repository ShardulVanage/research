"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Award,
  Send,
  X,
  ArrowLeft,
  Newspaper,
} from "lucide-react"

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Registrations", href: "/admin/registrations", icon: CalendarDays },
  { label: "Conf. Submissions", href: "/admin/conference-submissions", icon: Send },
  { label: "Journal Submissions", href: "/admin/submissions", icon: FileText },
  { label: "Certificates Queue", href: "/admin/certificates", icon: Award },
  { label: "Website Content", href: "/admin/cms", icon: Newspaper },
]

// Uses the same classes as DashboardSidebar so both panels share one look in light and dark mode.
export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/">
              <Image src="/logo.png" alt="ZEP Research" width={130} height={38} priority />
            </Link>
            <button
              onClick={onClose}
              className="mobile-menu-btn"
              style={{ display: isOpen ? "flex" : "" }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <p className="sidebar-logo-subtitle">Admin · Management Console</p>
        </div>

        <nav className="sidebar-nav">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              (item.href === "/admin" && pathname === "/admin") ||
              (item.href !== "/admin" && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#e8ecf4] p-3 dark:border-[#2a2d3a]">
          <Link href="/dashboard" className="sidebar-nav-item" onClick={onClose}>
            <ArrowLeft size={18} />
            Return to Dashboard
          </Link>
        </div>
      </aside>
    </>
  )
}
