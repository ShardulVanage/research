"use client"

import { useEffect, useState } from "react"
import { useRef } from "react"
import { ConferenceCard } from "./ConferenceCard"
import { getConferences } from "@/lib/zep-pocketbase"
import { AlertCircle, Loader, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const RegistrationConferences = () => {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoading(true)
        const result = await getConferences()
        if (result.success) {
          setConferences(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError("Failed to load conferences")
      } finally {
        setLoading(false)
      }
    }

    fetchConferences()
  }, [])

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [conferences])

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="inline-block mb-4">
            <span className="text-sm text-center font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Featured Events</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
            Conference Registration & Research Events
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Explore and register for professional conferences and research events worldwide
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <Loader className="w-6 h-6 animate-spin text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading conferences...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 flex items-gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 dark:text-red-200 font-semibold">Error loading conferences</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && conferences.length > 0 && (
          <div className="relative group">
            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
              style={{
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {conferences.map((conference) => (
                <div key={conference.id} className="flex-shrink-0 w-full sm:w-96">
                  <ConferenceCard conference={conference} />
                </div>
              ))}
            </div>

            {/* Scroll Buttons - Desktop (Side) */}
            {conferences.length > 2 && (
              <>
                <button
                  onClick={() => scroll("left")}
                  className={`hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    canScrollLeft
                      ? "opacity-100 hover:shadow-lg"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className={`hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    canScrollRight
                      ? "opacity-100 hover:shadow-lg"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                  disabled={!canScrollRight}
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </>
            )}

            {/* Scroll Buttons - Mobile & Tablet (Bottom) */}
            {conferences.length > 2 && (
              <div className="md:hidden flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => scroll("left")}
                  className={`p-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    canScrollLeft
                      ? "opacity-100 hover:shadow-lg"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className={`p-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    canScrollRight
                      ? "opacity-100 hover:shadow-lg"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                  disabled={!canScrollRight}
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && conferences.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              No conferences available at the moment
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Check back soon for upcoming events
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
