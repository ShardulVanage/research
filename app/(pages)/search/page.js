"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { PublicationCard } from "@/components/publication-card"
import { searchPublications } from "@/lib/pocketbase"
import { Search, Loader2, BookOpen } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState(query)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchTerm, pageNum = 1) => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setError("")

    const result = await searchPublications(searchTerm, pageNum, 10)

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setPage(1)
      performSearch(searchQuery.trim())
      // Update URL
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    performSearch(query, nextPage)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Search Publications</h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search publications, authors, keywords..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {query && (
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? "Searching..." : `${publications.length} results for "${query}"`}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {loading && publications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Searching publications...</span>
            </div>
          ) : (
            <>
              {publications.length > 0 ? (
                <div className="space-y-6">
                  {publications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))}
                </div>
              ) : query && !loading ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or browse all publications.
                  </p>
                </div>
              ) : !query ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start your search</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter keywords, author names, or topics to find relevant publications.
                  </p>
                </div>
              ) : null}

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
        </main>
      </div>
    </ProtectedRoute>
  )
}
