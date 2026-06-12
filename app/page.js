"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { PublicationCard } from "@/components/publication-card"
import { MeshGradientComponent } from "@/components/mesh-gradient"
import { getPublications } from "@/lib/pocketbase"
import { Loader2, BookOpen, TrendingUp, Users, ArrowRight, BrainCircuit, Eclipse } from "lucide-react"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { HeroSection } from "@/components/Hero"
import Announcement, { Banner } from "@/components/ui/banner"

export default function HomePage() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadPublications()
  }, [])

  const loadPublications = async (pageNum = 1) => {
    setLoading(true)
    const result = await getPublications(pageNum, 10)

    if (result.success) {
      if (pageNum === 1) {
        setPublications(result.data.items)
      } else {
        setPublications((prev) => [...prev, ...result.data.items])
      }
      setHasMore(result.data.items.length === 10)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadPublications(nextPage)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Announcement/>
        <MeshGradientComponent colors={["#06b6d4", "#0891b2", "#0e7490", "#155e75"]} speed={1} />

        <Navbar />

        <main className="relative z-10">
          {/* Hero Section */}
         <HeroSection publications={publications} />

          {/* Publications Feed */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {loading && publications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading publications...</span>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {publications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))}
                </div>

                {publications.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Be the first to share your research with the community!
                    </p>
                  </div>
                )}

                {hasMore && publications.length > 0 && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
