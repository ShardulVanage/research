"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import "./dashboard.css"
import "./user-dashboard.css"

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect to login if not authenticated. Navigation is a side effect, so it
  // must run in an effect, not during render.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (!loading && !user) {
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
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f5f7fb" }}>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Body with Sidebar */}
      <div className="dashboard-layout" style={{ flex: 1, position: "relative" }}>
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="dashboard-main" style={{ minHeight: "calc(100vh - 65px)" }}>
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
