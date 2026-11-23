"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { isAdminUser } from "@/lib/auth/isAdmin"
import "../../(dashboard)/dashboard.css"

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = !!user && isAdminUser(user)

  // Redirect if not authenticated / not admin. Navigation is a side effect,
  // so it must run in an effect, not during render.
  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/login")
    else if (!isAdmin) router.replace("/dashboard")
  }, [loading, user, isAdmin, router])

  if (!loading && !isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f5f7fb"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            border: "3px solid #e2e8f0",
            borderTopColor: "#0891b2",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px"
          }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading admin panel...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f7fb" }}>
      {/* Global Top Navbar */}
      <Navbar />

      {/* Admin Layout with Left Sidebar */}
      <div className="dashboard-layout" style={{ flex: 1, position: "relative" }}>
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="dashboard-main" style={{ minHeight: "calc(100vh - 65px)" }}>
          <div className="admin-content" style={{ padding: "24px 32px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
