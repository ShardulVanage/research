"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Mail, AlertCircle, CheckCircle, Loader, ChevronLeft } from "lucide-react"
import { MeshGradientComponent } from "@/components/mesh-gradient"
import { ThemeToggle } from "@/components/theme-toggle"
import { requestOTP, confirmOTP } from "@/lib/pocketbase"
import { useAuth } from "@/contexts/auth-context"

export default function LoginOTPPage() {
  const [step, setStep] = useState("email") // email | otp
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpId, setOtpId] = useState("") // Store otpId from requestOTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Handle redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    const result = await requestOTP(email)

    if (result.success) {
      // Store otpId for verification
      setOtpId(result.data.otpId)
      setSuccess("OTP sent to your email! Check your inbox.")
      setStep("otp")
      setOtpSent(true)
      setCountdown(60)
      setTimeout(() => setSuccess(""), 5000)
    } else {
      // Show generic message for security (prevent email enumeration)
      setError(result.error || "If this email is registered, you will receive an OTP. Please check your email.")
    }

    setLoading(false)
  }

  const validateOTP = (otp) => {
    return otp.trim().length === 6 && /^\d+$/.test(otp)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!otp.trim()) {
      setError("Please enter the OTP")
      return
    }

    if (!validateOTP(otp)) {
      setError("OTP must be 6 digits")
      return
    }

    if (!otpId) {
      setError("Session expired. Please request a new OTP.")
      setStep("email")
      return
    }

    setLoading(true)
    // Pass otpId instead of email
    const result = await confirmOTP(otpId, otp)

    if (result.success) {
      setSuccess("Login successful! Redirecting...")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } else {
      if (result.error.includes("OTP") || result.error.includes("invalid")) {
        setError("Invalid OTP. Please check and try again.")
      } else if (result.error.includes("expired")) {
        setError("OTP has expired. Please request a new one.")
        setStep("email")
        setOtpId("")
      } else {
        setError(result.error || "Failed to verify OTP. Please try again.")
      }
    }

    setLoading(false)
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setError("")
    setSuccess("")
    setLoading(true)

    const result = await requestOTP(email)

    if (result.success) {
      // Update otpId for the new OTP
      setOtpId(result.data.otpId)
      setSuccess("New OTP sent to your email!")
      setOtp("") // Clear previous OTP input
      setCountdown(60)
      setTimeout(() => setSuccess(""), 5000)
    } else {
      setError(result.error || "Failed to resend OTP. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MeshGradientComponent
        colors={["#06b6d4", "#0891b2", "#0e7490", "#155e75"]}
        speed={2}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Theme Toggle */}
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>

          {/* Login Form */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Image
                src="/logo.png"
                alt="Zep Research"
                width={200}
                height={60}
                className="mx-auto mb-4"
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Login with OTP
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {step === "email"
                  ? "Enter your email to receive an OTP"
                  : "Enter the OTP sent to your email"}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <p className="text-xs text-green-700 dark:text-green-400">
                  {success}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === "email" && (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    We'll send a 6-digit code to this email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setOtp(value)
                      setError("")
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono"
                    disabled={loading}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Check your email at{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {email}
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Resend OTP in{" "}
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        {countdown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Didn't receive OTP? Resend
                    </button>
                  )}
                </div>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep("email")
                    setOtp("")
                    setError("")
                    setOtpSent(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium text-sm"
                >
                  <ChevronLeft size={18} />
                  Back to Email
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            {/* Back to Regular Login */}
            <Link
              href="/login"
              className="w-full block text-center px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Login with Email & Password
            </Link>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
