"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { MeshGradientComponent } from "@/components/mesh-gradient"
import { ThemeToggle } from "@/components/theme-toggle"
import { requestPasswordReset } from "@/lib/pocketbase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await requestPasswordReset(email.trim())

    if (result.success) {
      setSent(true)
    } else {
      setError(result.error || "Failed to send reset email. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MeshGradientComponent colors={["#06b6d4", "#0891b2", "#0e7490", "#155e75"]} speed={2} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>

          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="text-center mb-8">
              <Image src="/logo.png" alt="Zep Research" width={200} height={60} className="mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
              <p className="text-xs text-gray-600 mt-2">
                Enter your account email and we&apos;ll send you a link to reset your password
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {sent ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-xs text-green-700 dark:text-green-400">
                    If an account exists for <span className="font-medium">{email}</span>, a password reset link has
                    been sent. Please check your inbox (and spam folder).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Send again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
