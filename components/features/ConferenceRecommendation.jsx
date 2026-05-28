"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ChatHistorySidebar } from "@/components/shared/ChatHistorySidebar"
import { AIPageHeader } from "@/components/shared/AIPageHeader"
import MessageLimitBanner from "@/components/shared/MessageLimitBanner"
import { getDailyUsage } from "@/lib/ai-usage"
import { Bookmark, BookmarkCheck, Loader, Filter } from "lucide-react"
import {toast} from "sonner"

const RESEARCH_AREAS = [
  "Machine Learning",
  "Bioinformatics",
  "Natural Language Processing",
  "Computer Vision",
  "Robotics",
  "Quantum Computing",
  "Cybersecurity",
  "Data Science",
  "Other",
]

const RANKS = [
  { value: "any", label: "Any Rank" },
  { value: "A*", label: "A* (Top Tier)" },
  { value: "A", label: "A" },
  { value: "A-or-above", label: "A or Above" },
]

const TIMELINES = [
  { value: "1-month", label: "Within 1 month" },
  { value: "3-months", label: "Within 3 months" },
  { value: "6-months", label: "Within 6 months" },
  { value: "anytime", label: "Anytime" },
]

const REGIONS = [
  { value: "worldwide", label: "Worldwide" },
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "online-only", label: "Online Only" },
]

const CAREER_STAGES = [
  { value: "PhD student", label: "PhD Student" },
  { value: "postdoc", label: "Postdoc" },
  { value: "faculty", label: "Faculty" },
  { value: "industry researcher", label: "Industry Researcher" },
]

export function ConferenceRecommendation() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    researchArea: "Machine Learning",
    paperTitle: "",
    abstract: "",
    preferredRegion: "worldwide",
    targetRank: "any",
    submissionTimeline: "6-months",
    careerStage: "PhD student",
  })

  const [conferences, setConferences] = useState(null)
  const [loading, setLoading] = useState(false)
  const [usedToday, setUsedToday] = useState(0)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [savedConferences, setSavedConferences] = useState(new Set())
  const [filterRank, setFilterRank] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user) {
      getDailyUsage(user.id).then(setUsedToday)
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (usedToday >= 5) {
      toast.error("Daily limit reached")
      return
    }

    if (!formData.abstract.trim()) {
      toast.error("Please enter your research abstract or summary")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/conference-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          chatId: currentChatId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "DAILY_LIMIT_REACHED") {
          toast.error("Daily limit reached. Come back tomorrow!")
          setUsedToday(5)
        } else {
          toast.error(data.message || "Failed to get recommendations")
        }
        return
      }

      setConferences(data.conferences)
      setCurrentChatId(data.chatId)
      setUsedToday((prev) => prev + 1)
      setCurrentPage(1)
      toast.success("Conferences recommended successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to get recommendations")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConference = async (conference) => {
    if (!user) {
      toast.error("Please log in to save conferences")
      return
    }

    try {
      const isSaved = savedConferences.has(conference.name)
      if (isSaved) {
        // Remove from saved
        setSavedConferences((prev) => {
          const newSet = new Set(prev)
          newSet.delete(conference.name)
          return newSet
        })
        toast.success("Conference removed from saved")
      } else {
        // Add to saved
        setSavedConferences((prev) => new Set(prev).add(conference.name))
        toast.success("Conference saved!")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to save conference")
    }
  }

  const filtered =
    conferences && filterRank !== "all"
      ? conferences.filter((c) => c.rank === filterRank)
      : conferences || []

  const remaining = 5 - usedToday

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case "A*":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30"
      case "A":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30"
      case "B":
        return "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
      case "C":
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"
      default:
        return "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
      <AIPageHeader title="Conference Recommendations" description="Find the best conferences for your research" />
      {/* Sidebar */}
      {user && (
        <ChatHistorySidebar
          userId={user.id}
          feature="conference_recommendation"
          currentChatId={currentChatId}
          onSelectChat={(chatId) => setCurrentChatId(chatId)}
          onNewChat={() => {
            setCurrentChatId(null)
            setConferences(null)
            setFormData({
              researchArea: "Machine Learning",
              paperTitle: "",
              abstract: "",
              preferredRegion: "worldwide",
              targetRank: "any",
              submissionTimeline: "6-months",
              careerStage: "PhD student",
            })
          }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎓 Conference Recommendations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Find the best conferences for your research using AI-powered matching
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div>
                <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6 sticky top-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Your Research
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Research Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Research Area
                      </label>
                      <select
                        name="researchArea"
                        value={formData.researchArea}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {RESEARCH_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Paper Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Paper Title (Optional)
                      </label>
                      <input
                        type="text"
                        name="paperTitle"
                        value={formData.paperTitle}
                        onChange={handleInputChange}
                        placeholder="Your paper title"
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                      />
                    </div>

                    {/* Abstract */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Abstract or Summary
                      </label>
                      <textarea
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleInputChange}
                        placeholder="Paste your abstract or research summary..."
                        rows={5}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 resize-none text-sm"
                      />
                    </div>

                    {/* Career Stage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Career Stage
                      </label>
                      <select
                        name="careerStage"
                        value={formData.careerStage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {CAREER_STAGES.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Region */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Region
                      </label>
                      <select
                        name="preferredRegion"
                        value={formData.preferredRegion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {REGIONS.map((region) => (
                          <option key={region.value} value={region.value}>
                            {region.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Rank */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Rank
                      </label>
                      <select
                        name="targetRank"
                        value={formData.targetRank}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {RANKS.map((rank) => (
                          <option key={rank.value} value={rank.value}>
                            {rank.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timeline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Submission Timeline
                      </label>
                      <select
                        name="submissionTimeline"
                        value={formData.submissionTimeline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {TIMELINES.map((timeline) => (
                          <option key={timeline.value} value={timeline.value}>
                            {timeline.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || remaining <= 0}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        remaining <= 0
                          ? "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                          : "bg-cyan-500 hover:bg-cyan-600 text-white"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Finding Conferences...
                        </>
                      ) : (
                        "Get Recommendations"
                      )}
                    </button>
                  </form>

                  {/* Message Limit Banner */}
                  <div className="mt-6">
                    <MessageLimitBanner usedToday={usedToday} limit={5} />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-2">
                {conferences && conferences.length > 0 && (
                  <div className="space-y-4">
                    {/* Filter */}
                    <div className="flex items-center gap-2 mb-6">
                      <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                      <select
                        value={filterRank}
                        onChange={(e) => setFilterRank(e.target.value)}
                        className="px-3 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                      >
                        <option value="all">All Ranks</option>
                        <option value="A*">A* (Top Tier)</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>

                    {/* Conference Cards */}
                    {filtered.map((conf, idx) => (
                      <div
                        key={idx}
                        className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {conf.acronym || conf.name}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold border ${getRankBadgeColor(
                                  conf.rank
                                )}`}
                              >
                                {conf.rank}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {conf.name}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSaveConference(conf)}
                            className="ml-4 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
                          >
                            {savedConferences.has(conf.name) ? (
                              <BookmarkCheck size={20} className="text-cyan-500" />
                            ) : (
                              <Bookmark size={20} className="text-gray-400" />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {conf.deadline}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Acceptance Rate</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {conf.acceptanceRate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Location</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {conf.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Format</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {conf.format}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Why it fits:</strong> {conf.whyFit}
                          </p>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <strong>Topics:</strong>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {conf.topics?.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded text-xs"
                              >
                                {topic}
                              </span>
                            ))}
                            {conf.topics?.length > 3 && (
                              <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                                +{conf.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Fee: {conf.fee}
                          </p>
                          <a
                            href={conf.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-500 hover:text-cyan-600 text-sm font-medium"
                          >
                            Visit Website →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!conferences && (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-12 flex items-center justify-center h-96">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Fill in your research details and click "Get Recommendations" to see matching
                      conferences
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
