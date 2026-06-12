"use client"

import { useAuth } from "@/contexts/auth-context"
import { checkUserMembership } from "@/lib/pocketbase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export const MemberRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [memberStatus, setMemberStatus] = useState("loading") // "loading" | "active" | "expired" | "none"

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const verify = async () => {
      const result = await checkUserMembership(user.id)

      if (!result.success || !result.isMember) {
        setMemberStatus(result.isExpired ? "expired" : "none")
        return
      }

      setMemberStatus("active")
    }

    verify()
  }, [loading, isAuthenticated, user])

  if (loading || memberStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (memberStatus === "expired" || memberStatus === "none") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-2xl font-bold">Members Only</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          {memberStatus === "expired"
            ? "Your membership has expired. Renew to continue accessing AI Tools."
            : "You need an active membership to access AI Tools."}
        </p>
        <a
          href="/membership"
          className="mt-2 px-6 py-2 rounded-md bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-colors"
        >
          {memberStatus === "expired" ? "Renew Membership" : "View Plans"}
        </a>
      </div>
    )
  }

  return children
}