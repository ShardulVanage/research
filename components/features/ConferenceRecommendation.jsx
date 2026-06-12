"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ChatHistorySidebar } from "@/components/shared/ChatHistorySidebar"
import MessageLimitBanner from "@/components/shared/MessageLimitBanner"
import { getDailyUsage } from "@/lib/ai-usage"
import {
  Bookmark,
  BookmarkCheck,
  Loader,
  Filter,
  Star,
  ArrowLeft,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import pb from "@/lib/pocketbase"
import Link from "next/link"

const RESEARCH_AREAS = [
  "Machine Learning","Bioinformatics","Natural Language Processing","Computer Vision",
  "Robotics","Quantum Computing","Cybersecurity","Data Science","Artificial Intelligence",
  "Managerial and Organizational Research","Other",
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
const RANK_FILTER_OPTIONS = [
  { value: "all", label: "All Ranks" },
  { value: "A*", label: "A* Only" },
  { value: "A", label: "A Only" },
  { value: "B", label: "B Only" },
  { value: "C", label: "C Only" },
  { value: "Workshop", label: "Workshops" },
]
const EMPTY_FORM = {
  researchArea: "Machine Learning",
  paperTitle: "",
  abstract: "",
  preferredRegion: "worldwide",
  targetRank: "any",
  submissionTimeline: "6-months",
  careerStage: "PhD student",
}

export function ConferenceRecommendation() {
  const { user } = useAuth()
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [conferences, setConferences] = useState(null)
  const [loading, setLoading] = useState(false)
  const [usedToday, setUsedToday] = useState(0)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [savedConferences, setSavedConferences] = useState(new Set())
  const [filterRank, setFilterRank] = useState("all")
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) getDailyUsage(user.id).then(setUsedToday)
  }, [user])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setSidebarOpen(mq.matches)
    const handler = (e) => setSidebarOpen(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (usedToday >= 5) { toast.error("Daily limit reached"); return }
    if (!formData.abstract.trim()) { toast.error("Please enter your research abstract or summary"); return }
    setLoading(true)
    setConferences(null)
    if (window.innerWidth < 1024) setSidebarOpen(false)
    try {
      const response = await fetch("/api/ai/conference-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user.id, chatId: currentChatId, pbToken: pb.authStore.token }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.error === "DAILY_LIMIT_REACHED") { toast.error("Daily limit reached. Come back tomorrow!"); setUsedToday(5) }
        else toast.error(data.message || "Failed to get recommendations")
        return
      }
      setConferences(data.conferences)
      setCurrentChatId(data.chatId)
      setUsedToday((prev) => prev + 1)
      setFilterRank("all")
      setHistoryRefreshKey((k) => k + 1)
      toast.success("Conferences recommended successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to get recommendations")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChat = useCallback(async (chatId) => {
    if (!chatId) return
    setCurrentChatId(chatId)
    setConferences(null)
    setLoading(true)
    if (window.innerWidth < 1024) setSidebarOpen(false)
    try {
      const record = await pb.collection("ai_chats").getOne(chatId)
      const messages = record.messages || []
      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
      if (lastAssistant?.content?.conferences) { setConferences(lastAssistant.content.conferences); setFilterRank("all") }
      const lastUser = [...messages].reverse().find((m) => m.role === "user")
      if (lastUser?.content) setFormData((prev) => ({ ...prev, ...lastUser.content }))
    } catch (err) {
      console.error("Failed to load chat:", err)
      toast.error("Could not load this chat")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleNewChat = () => {
    setCurrentChatId(null)
    setConferences(null)
    setFormData(EMPTY_FORM)
    setFilterRank("all")
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  const handleSaveConference = (conference) => {
    if (!user) { toast.error("Please log in to save conferences"); return }
    const isSaved = savedConferences.has(conference.name)
    setSavedConferences((prev) => {
      const next = new Set(prev)
      isSaved ? next.delete(conference.name) : next.add(conference.name)
      return next
    })
    toast.success(isSaved ? "Conference removed from saved" : "Conference saved!")
  }

  const filtered = conferences && filterRank !== "all"
    ? conferences.filter((c) => c.rank === filterRank)
    : conferences || []

  const remaining = 5 - usedToday

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case "A*": return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30"
      case "A":  return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30"
      case "B":  return "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
      case "C":  return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"
      default:   return "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
    }
  }

  const fieldCls = "w-full appearance-none px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white transition-colors"
  const labelCls = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden">

      {/* SIDEBAR */}
      {user && (
        <>
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200/60 dark:border-white/10 shadow-2xl shadow-black/10 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:shadow-none lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            {/* Sidebar header */}
            <div className="flex flex-col gap-1 px-4 pt-5 pb-3 border-b border-gray-100 dark:border-white/10">
              <Link href="/ai" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group w-fit mb-1">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to AI Tools</span>
              </Link>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <GraduationCap size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Conference Finder</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">AI-powered matching</p>
                </div>
              </div>
            </div>
            {/* Chat history */}
            <div className="flex-1 overflow-y-auto">
              <ChatHistorySidebar
                key={historyRefreshKey}
                userId={user.id}
                feature="conference_recommendation"
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                embedded
              />
            </div>
          </aside>
        </>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen((v) => !v)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors" aria-label="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GraduationCap size={18} className="text-cyan-500 flex-shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">Conference Recommendations</h1>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-400">
            <span className={`w-1.5 h-1.5 rounded-full ${remaining > 2 ? "bg-emerald-500" : remaining > 0 ? "bg-amber-500" : "bg-red-500"}`} />
            {remaining}/5 left
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Describe your research and get AI-matched conference recommendations instantly.
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* FORM PANEL */}
              <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                    <GraduationCap size={12} className="text-cyan-600 dark:text-cyan-400" />
                  </span>
                  Research Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Research Area */}
                  <div>
                    <label className={labelCls}>Research Area</label>
                    <div className="relative">
                      <select name="researchArea" value={formData.researchArea} onChange={handleInputChange} className={fieldCls}>
                        {RESEARCH_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Paper Title */}
                  <div>
                    <label className={labelCls}>Paper Title <span className="normal-case font-normal text-gray-400">(optional)</span></label>
                    <input required type="text" name="paperTitle" value={formData.paperTitle} onChange={handleInputChange} placeholder="Your paper title" className={fieldCls + " placeholder-gray-400 dark:placeholder-gray-600"} />
                  </div>

                  {/* Abstract */}
                  <div>
                    <label className={labelCls}>Abstract or Summary</label>
                    <textarea required name="abstract" value={formData.abstract} onChange={handleInputChange} placeholder="Paste your abstract or research summary…" rows={4} className={fieldCls + " placeholder-gray-400 dark:placeholder-gray-600 resize-none"} />
                  </div>

                  {/* Career Stage + Region */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Career Stage</label>
                      <div className="relative">
                        <select name="careerStage" value={formData.careerStage} onChange={handleInputChange} className={fieldCls}>
                          {CAREER_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Region</label>
                      <div className="relative">
                        <select name="preferredRegion" value={formData.preferredRegion} onChange={handleInputChange} className={fieldCls}>
                          {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Target Rank — pill buttons */}
                  <div>
                    <label className={labelCls}>Target Rank</label>
                    <div className="flex flex-wrap gap-2">
                      {RANKS.map((r) => (
                        <button key={r.value} type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, targetRank: r.value }))}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                            formData.targetRank === r.value
                              ? "bg-cyan-500 border-cyan-500 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900/40"
                              : "bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-cyan-300 dark:hover:border-cyan-700"
                          }`}
                        >{r.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Submission Timeline — pill buttons */}
                  <div>
                    <label className={labelCls}>Submission Timeline</label>
                    <div className="flex flex-wrap gap-2">
                      {TIMELINES.map((t) => (
                        <button key={t.value} type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, submissionTimeline: t.value }))}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                            formData.submissionTimeline === t.value
                              ? "bg-cyan-500 border-cyan-500 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900/40"
                              : "bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-cyan-300 dark:hover:border-cyan-700"
                          }`}
                        >{t.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading || remaining <= 0}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                      remaining <= 0
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : loading
                        ? "bg-cyan-400 dark:bg-cyan-700 text-white cursor-wait"
                        : "bg-cyan-500 hover:bg-cyan-600 active:scale-[0.99] text-white shadow-cyan-200 dark:shadow-cyan-900/30"
                    }`}
                  >
                    {loading
                      ? <><Loader size={16} className="animate-spin" /> Finding Conferences…</>
                      : <><Sparkles size={16} /> Get Recommendations</>}
                  </button>
                </form>

                <div className="mt-4">
                  <MessageLimitBanner usedToday={usedToday} limit={5} />
                </div>
              </div>

              {/* RESULTS PANEL */}
              <div>
                {loading ? (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-6 min-h-64 flex flex-col items-center justify-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Loader size={22} className="animate-spin text-cyan-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Finding best matches…</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Usually takes 5–10 seconds</p>
                    </div>
                  </div>

                ) : conferences && conferences.length > 0 ? (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm">
                    {/* Result header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recommended Conferences</h2>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                          {filtered.length} found
                        </span>
                      </div>
                      {/* Rank filter */}
                      <div className="flex items-center gap-2">
                        <Filter size={13} className="text-gray-400 flex-shrink-0" />
                        <div className="relative">
                          <select value={filterRank} onChange={(e) => setFilterRank(e.target.value)}
                            className="appearance-none pl-3 pr-7 py-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                          >
                            {RANK_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
                      {filtered.map((conf, idx) => (
                        <ConferenceCard
                          key={idx}
                          conf={conf}
                          saved={savedConferences.has(conf.name)}
                          onSave={() => handleSaveConference(conf)}
                          getRankBadgeColor={getRankBadgeColor}
                        />
                      ))}
                    </div>
                  </div>

                ) : (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-6 min-h-64 flex flex-col items-center justify-center gap-3 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <GraduationCap size={24} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No results yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                        Fill in your research details and click "Get Recommendations" to see matching conferences
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Or select a previous search from the sidebar</p>
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

/* Conference Card */
function ConferenceCard({ conf, saved, onSave, getRankBadgeColor }) {
  return (
    <div className={`border rounded-xl p-4 transition-all duration-200 ${
      conf.isZEPConference
        ? "bg-cyan-50/60 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-700/50 ring-1 ring-cyan-300/40 dark:ring-cyan-600/30"
        : "bg-gray-50/60 dark:bg-white/[0.03] border-gray-200/70 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/15"
    }`}>

      {conf.isZEPConference && (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg w-fit border border-cyan-200 dark:border-cyan-700/60">
          <Star size={11} className="text-cyan-500 fill-cyan-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">ZEP Research — Featured</span>
        </div>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{conf.acronym || conf.name}</h3>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRankBadgeColor(conf.rank)}`}>{conf.rank}</span>
          </div>
          {conf.acronym && conf.name !== conf.acronym && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conf.name}</p>
          )}
        </div>
        <button onClick={onSave} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0" aria-label={saved ? "Remove bookmark" : "Bookmark"}>
          {saved ? <BookmarkCheck size={16} className="text-cyan-500" /> : <Bookmark size={16} className="text-gray-400" />}
        </button>
      </div>

      {/* Info pills */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Deadline", value: conf.deadline || "TBA" },
          { label: "Acceptance", value: conf.acceptanceRate || "N/A" },
          { label: "Location", value: conf.location || "TBA" },
          { label: "Format", value: conf.format || "TBA" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/70 dark:bg-black/20 rounded-lg px-3 py-1.5 border border-gray-100 dark:border-white/5">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">{value}</p>
          </div>
        ))}
      </div>

      {conf.whyFit && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Why it fits: </span>{conf.whyFit}
        </p>
      )}

      {conf.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {conf.topics.slice(0, 4).map((topic, i) => (
            <span key={i} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md text-[10px] font-medium">{topic}</span>
          ))}
          {conf.topics.length > 4 && <span className="px-2 py-0.5 text-gray-400 text-[10px]">+{conf.topics.length - 4} more</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-gray-100 dark:border-white/5">
        {conf.fee ? <p className="text-[10px] text-gray-400">Fee: {conf.fee}</p> : <span />}
        <div className="flex items-center gap-3 ml-auto">
          {conf.website && conf.website !== "N/A" && (
            <a href={conf.website} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-600 text-xs font-semibold inline-flex items-center gap-0.5 transition-colors">
              Visit Website <ChevronRight size={12} />
            </a>
          )}
          {conf.isZEPConference && conf.registerLink && (
            <a href={conf.registerLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg transition-colors">
              Register Now
            </a>
          )}
        </div>
      </div>
    </div>
  )
}