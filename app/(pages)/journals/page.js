"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Book } from "@/components/book"
import { getJournals, searchJournals, getImageUrl } from "@/lib/pocketbase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { NoiseBackground } from "@/components/ui/noise-background"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"

export default function JournalsPage() {
  const [journals, setJournals] = useState([])
  const [filteredJournals, setFilteredJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [selectedIndexType, setSelectedIndexType] = useState("")
  const [selectedZepOnly, setSelectedZepOnly] = useState(false)
  const router = useRouter()

  const loadJournals = async () => {
    setLoading(true)
    const result = await getJournals(1, 100)
    if (result.success) {
      setJournals(result.data.items || [])
      applyFilters(result.data.items || [], searchQuery, selectedIndexType, selectedZepOnly)
    }
    setLoading(false)
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      applyFilters(journals, "", selectedIndexType, selectedZepOnly)
      return
    }
    setSearching(true)
    const result = await searchJournals(query)
    if (result.success) {
      applyFilters(result.data.items || [], query, selectedIndexType, selectedZepOnly)
    }
    setSearching(false)
  }

  const applyFilters = (journalsData, search, indexType, zepOnly) => {
    let filtered = journalsData

    if (indexType) {
      filtered = filtered.filter(journal => journal.indexType === indexType)
    }

    if (zepOnly) {
      filtered = filtered.filter(journal => journal.by_zep === true)
    }

    setFilteredJournals(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === "indexType") {
      setSelectedIndexType(value)
      applyFilters(journals, searchQuery, value, selectedZepOnly)
    } else if (filterType === "zepOnly") {
      setSelectedZepOnly(value)
      applyFilters(journals, searchQuery, selectedIndexType, value)
    }
  }

  useEffect(() => {
    loadJournals()
  }, [])

  const getBookColor = (index) => {
    const colors = [
      "#fbbf24",
      "#ec4899",
      "#06b6d4",
      "#8b5cf6",
      "#10b981",
      "#f97316",
    ]
    return colors[index % colors.length]
  }

  // Priority: PocketBase file field (imgs) → external URL (img) → null
  const getJournalImage = (journal) => {
    if (journal.imgs) {
      return getImageUrl(journal, journal.imgs)
    }
    if (journal.img) {
      return journal.img
    }
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-slate-950 pb-12 px-4 sm:px-6 lg:px-8">
        <Navbar />
        <div className="max-w-6xl mx-auto mt-12">
          <div className="mb-12">
            <div className="flex mb-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Journals</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Explore and discover academic journals and submit your research papers.
            </p>

            <div className="flex flex-col gap-4 mb-6">
              <Input
                type="text"
                placeholder="Search journals by title or ISSN..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-2xl"
              />

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-row gap-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Index Type</label>
                    <select
                      value={selectedIndexType}
                      onChange={(e) => handleFilterChange("indexType", e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="ABDC">ABDC</option>
                      <option value="Scopus">Scopus</option>
                      <option value="GoogleScholar">Google Scholar</option>
                      <option value="Wos">Web of Science</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant={selectedZepOnly ? "default" : "outline"}
                      onClick={() => handleFilterChange("zepOnly", !selectedZepOnly)}
                      className="h-10"
                    >
                      {selectedZepOnly ? "✓ " : ""}ZEP Only
                    </Button>
                  </div>
                </div>

                <div className="flex items-end justify-center">
                  <NoiseBackground
                    containerClassName="w-fit p-2 rounded-full mx-auto"
                    gradientColors={[
                      "rgb(59, 130, 246)",
                      "rgb(37, 99, 235)",
                      "rgb(14, 165, 233)",
                    ]}
                  >
                    <Link href="/journals/my-submission">
                      <button className="h-full w-full cursor-pointer text-sm rounded-full bg-linear-to-r from-neutral-100 via-neutral-100 to-white px-4 py-2 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                        My Submissions
                      </button>
                    </Link>
                  </NoiseBackground>
                </div>
              </div>
            </div>
          </div>

          {loading || searching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : filteredJournals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {searchQuery ? "No journals found matching your search." : "No journals available."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {filteredJournals.map((journal, index) => (
                <div
                  key={journal.id}
                  onClick={() => router.push(`/journals/${journal.id}`)}
                  className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
                >
                  <Book
                    title={journal.title || "Untitled"}
                    issn={journal.issncode}
                    variant="stripe"
                    width={296}
                    color={getBookColor(index)}
                    img={getJournalImage(journal)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}