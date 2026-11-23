"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { isAdminUser } from "@/lib/auth/isAdmin"
import {
  LayoutDashboard,
  User,
  CalendarDays,
  BookOpen,
  FileText,
  Crown,
  Gift,
  GraduationCap,
  Bell,
  HelpCircle,
  Settings,
  X,
  Shield,
  Award,
  Send,
  ShieldUser,
  Star,
} from "lucide-react"

const baseNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "My Conferences", href: "/dashboard/conferences", icon: CalendarDays },
  { label: "Future Conferences", href: "/dashboard/future-conferences", icon: Star },
  { label: "Conf. Submissions", href: "/dashboard/conference-submissions", icon: Send },
  { label: "Journal Submissions", href: "/dashboard/submissions", icon: FileText },
  { label: "My Publications", href: "/dashboard/publications", icon: BookOpen },
  { label: "My Documents", href: "/dashboard/documents", icon: Award },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Membership", href: "/membership", icon: Crown },
  // { label: "Rewards & Offers", href: "/dashboard/rewards", icon: Gift },
  { label: "Learning Center", href: "https://www.zepresearch.com/courses", icon: GraduationCap },
  // { label: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: 3 },
  { label: "Support", href: "/dashboard/support", icon: HelpCircle },
  // { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [...baseNavItems]

  // If user is admin, add Admin Panel to sidebar
  if (isAdminUser(user)) {
    navItems.splice(1, 0, {
      label: "Admin Panel",
      href: "/admin",
      icon: ShieldUser,
    })
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/">
              <Image src="/logo.png" alt="ZEP Research" width={130} height={38} priority />
            </Link>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="mobile-menu-btn"
              style={{ display: isOpen ? "flex" : "" }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <p className="sidebar-logo-subtitle">Pioneering Innovation, Shaping the Future</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href)) ||
              // Registration detail pages belong under "My Conferences"
              (item.href === "/dashboard/conferences" && pathname?.startsWith("/dashboard/registrations"))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={onClose}
                target={item.label === "Learning Center" ? "_blank" : undefined}
                rel={item.label === "Learning Center" ? "noopener noreferrer" : undefined}
              >
                <Icon size={18} />
                {item.label}
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
