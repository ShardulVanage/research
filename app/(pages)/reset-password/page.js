"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { MeshGradientComponent } from "@/components/mesh-gradient"
import { ThemeToggle } from "@/components/theme-toggle"
import { confirmPasswordReset } from "@/lib/pocketbase"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [formData, setFormData] = useState({ password: "", passwordConfirm: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    const result = await confirmPasswordReset(token, formData.password, formData.passwordConfirm)

    if (result.success) {
      setDone(true)
      setTimeout(() => router.push("/login"), 2500)
    } else {
      let errorMessage = result.error || "Failed to reset password."
      if (result.details?.data) {
        const fieldErrors = Object.entries(result.details.data)
          .map(([field, err]) => `${field}: ${err.message || err}`)
          .join(", ")
        if (fieldErrors) errorMessage = `${errorMessage}. Details: ${fieldErrors}`
      }
      setError(errorMessage)
    }
    setLoading(false)
  }

  const inputClass =
    "w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
      <div className="text-center mb-8">
        <Image src="/logo.png" alt="Zep Research" width={200} height={60} className="mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-xs text-gray-600 mt-2">Choose a new password for your account</p>
      </div>

      {!token ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-xs text-red-700 dark:text-red-400">
            This reset link is invalid or incomplete.{" "}
            <Link href="/forgot-password" className="underline font-medium">
              Request a new one
            </Link>
            .
          </p>
        </div>
      ) : done ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-xs text-green-700 dark:text-green-400">
            Your password has been reset. Redirecting you to sign in...
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={inputClass}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={inputClass}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </>
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
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <MeshGradientComponent colors={["#06b6d4", "#0891b2", "#0e7490", "#155e75"]} speed={2} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
