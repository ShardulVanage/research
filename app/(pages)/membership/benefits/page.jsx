"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { RegistrationConferences } from "@/components/membership/registration-conferences"
import { PublicationSupport } from "@/components/membership/publication-support"
import { AccommodationForm } from "@/components/membership/accommodation"
import { ContactCoordinator } from "@/components/membership/contact-coordinator"
import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { checkUserMembership, getCurrentUser } from "@/lib/pocketbase"
function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-slate-50 dark:text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function BenefitsPage() {
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const user = getCurrentUser()
        if (!user) {
          setError("User not found")
          setLoading(false)
          return
        }

        const result = await checkUserMembership(user.id)
        if (result.success && result.isMember) {
          setIsMember(true)
        } else {
          setError("You need an active membership to access these benefits.")
        }
      } catch (err) {
        setError("Failed to verify membership status")
      } finally {
        setLoading(false)
      }
    }

    checkMembership()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <main className="min-h-screen mx-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Checking membership status...</p>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  if (!isMember) {
    return (
      <ProtectedRoute>
        <Navbar />
        <main className="min-h-screen mx-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <section className="h-screen flex flex-col justify-center items-center relative bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-700 dark:via-blue-500 dark:to-cyan-700 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="flex flex-col justify-center items-center text-center max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-4 tracking-tight">
                  Membership Required
                </h1>
                <p className="text-xs md:text-sm text-cyan-50 opacity-95 mb-6">
                  {error}
                </p>
                <a href="/membership" className="inline-block px-8 py-3 bg-white text-cyan-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Go Back to Membership Page
                </a>
              </div>
            </div>
          </section>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen  mx-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Section */}
  
      
        <section className="py-16 relative bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-600 dark:from-cyan-700 dark:via-blue-500 dark:to-cyan-700 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-90 dark:opacity-90">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      {/* <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60" /> */}

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-4 tracking-tight">
                Membership Benefits
              </h1>
              <p className="text-xs md:text-sm text-cyan-50 opacity-95">
                Unlock exclusive benefits as a member of our research community.
                Access conferences, publication support, accommodation assistance,
                and dedicated coordinators ready to help.
              </p>
            </div>
          </div>
        </section>

        {/* Registration & Conferences Section */}
        <RegistrationConferences />

        {/* Publication Support Section */}
        <PublicationSupport />

        {/* Accommodation Section */}
        <AccommodationForm />

        {/* Contact Coordinator Section */}
        <ContactCoordinator />
      </main>
    </ProtectedRoute>
  )
}