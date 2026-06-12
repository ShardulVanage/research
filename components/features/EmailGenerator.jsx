"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ChatHistorySidebar } from "@/components/shared/ChatHistorySidebar"
import { AIPageHeader } from "@/components/shared/AIPageHeader"
import MessageLimitBanner from "@/components/shared/MessageLimitBanner"
import { getDailyUsage } from "@/lib/ai-usage"
import {
  Copy,
  Check,
  Loader,
  Mail,
  ArrowLeft,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import PocketBase from "pocketbase"
import Link from "next/link"

const EMAIL_TYPES = [
  { value: "collaboration", label: "Collaboration Request" },
  { value: "submission", label: "Paper Submission Follow-up" },
  { value: "conference", label: "Conference Invitation" },
  { value: "grant", label: "Grant Inquiry" },
  { value: "supervisor", label: "Supervisor Communication" },
  { value: "reviewer", label: "Reviewer Response" },
  { value: "internship", label: "Internship/Interview Request" },
]

const RECIPIENT_TITLES = ["Prof.", "Dr.", "Mr.", "Ms.", "Mrs.", "Rev."]

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "urgent", label: "Urgent" },
]

const TABS = [
  { id: "formal", label: "Formal" },
  { id: "semiformal", label: "Semi-formal" },
  { id: "concise", label: "Concise" },
]

const EMPTY_FORM = {
  emailType: "collaboration",
  recipientName: "",
  recipientTitle: "Prof.",
  yourName: "",
  yourAffiliation: "",
  context: "",
  tone: "formal",
  additionalNotes: "",
}

export function EmailGenerator() {
  const { user } = useAuth()
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [emails, setEmails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [usedToday, setUsedToday] = useState(0)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [copied, setCopied] = useState(null)
  const [activeTab, setActiveTab] = useState("formal")
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  // Sidebar: open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      getDailyUsage(user.id).then(setUsedToday)
    }
  }, [user])

  // Open sidebar by default on desktop
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
    if (usedToday >= 5) {
      toast.error("Daily limit reached")
      return
    }

    setLoading(true)
    setEmails(null)
    setCurrentChatId(null)
    // Close sidebar on mobile when generating
    if (window.innerWidth < 1024) setSidebarOpen(false)

    try {
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const pbToken = pb.authStore.token

      const response = await fetch("/api/ai/email-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          pbToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "DAILY_LIMIT_REACHED") {
          toast.error("Daily limit reached. Come back tomorrow!")
          setUsedToday(5)
        } else {
          toast.error(data.message || "Failed to generate emails")
        }
        return
      }

      setEmails(data.emails)
      setCurrentChatId(data.chatId)
      setUsedToday((prev) => prev + 1)
      setActiveTab("formal")
      setHistoryRefreshKey((k) => k + 1)
      toast.success("Emails generated successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to generate emails")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChat = useCallback(async (chatId) => {
    if (!chatId) return
    setCurrentChatId(chatId)
    setEmails(null)
    setLoading(true)
    if (window.innerWidth < 1024) setSidebarOpen(false)

    try {
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      const record = await pb.collection("ai_chats").getOne(chatId)
      const msgs = record.messages
      if (Array.isArray(msgs) && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1]
        if (lastMsg?.output) {
          setEmails(lastMsg.output)
          setActiveTab("formal")
          if (lastMsg.input) {
            setFormData((prev) => ({ ...prev, ...lastMsg.input }))
          }
        }
      }
    } catch (err) {
      console.error("Failed to load chat:", err)
      toast.error("Could not load this chat")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleNewChat = () => {
    setCurrentChatId(null)
    setEmails(null)
    setFormData(EMPTY_FORM)
    setActiveTab("formal")
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  const copyToClipboard = (text, variant) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(variant)
    setTimeout(() => setCopied(null), 2000)
    toast.success("Copied to clipboard!")
  }

  const remaining = 5 - usedToday
  const activeEmailBody = emails?.[activeTab] ?? ""

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* <AIPageHeader title="Email Generator" description="Generate professional academic emails" /> */}

      {/* ── SIDEBAR ── */}
      {user && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar panel */}
          <aside
            className={`
              fixed top-0 left-0 h-full z-40 flex flex-col
              w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
              border-r border-gray-200/60 dark:border-white/10
              shadow-2xl shadow-black/10
              transition-transform duration-300 ease-in-out
              lg:static lg:z-auto lg:shadow-none
              lg:translate-x-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Sidebar header */}
            <div className="flex flex-col gap-1 px-4 pt-5 pb-3 border-b border-gray-100 dark:border-white/10">
              {/* Back to AI Tools */}
              <Link
                href="/ai"
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group w-fit mb-1"
              >
                <ArrowLeft
                  size={15}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
                <span>Back to AI Tools</span>
              </Link>

              {/* Tool name */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm">
                  <Mail size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    Email Generator
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                    AI-powered drafts
                  </p>
                </div>
              </div>

              {/* New Chat button */}
              {/* <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition-colors duration-200"
              >
                <Sparkles size={14} />
                New Email
              </button> */}
            </div>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto">
              <ChatHistorySidebar
                key={historyRefreshKey}
                userId={user.id}
                feature="email_generator"
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                embedded
              />
            </div>
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Mail size={18} className="text-cyan-500 flex-shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              Email Generator
            </h1>
          </div>

          {/* Usage badge */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                remaining > 2 ? "bg-emerald-500" : remaining > 0 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
            {remaining}/5 left
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

            {/* Sub-heading */}
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Generate professional academic emails in three styles instantly.
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* ── FORM PANEL ── */}
              <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                    <Mail size={12} className="text-cyan-600 dark:text-cyan-400" />
                  </span>
                  Email Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Email Type
                    </label>
                    <div className="relative">
                      <select
                        name="emailType"
                        value={formData.emailType}
                        onChange={handleInputChange}
                        className="w-full appearance-none px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white transition-colors"
                      >
                        {EMAIL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Title
                      </label>
                      <div className="relative">
                        <select
                          name="recipientTitle"
                          value={formData.recipientTitle}
                          onChange={handleInputChange}
                          className="w-full appearance-none px-3 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white transition-colors"
                        >
                          {RECIPIENT_TITLES.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={12}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Recipient Name
                      </label>
                      <input
                      required
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        placeholder="John Smith"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Your Info — 2-col on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Your Name
                      </label>
                      <input
                      required
                        type="text"
                        name="yourName"
                        value={formData.yourName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Affiliation
                      </label>
                      <input
                      required
                        type="text"
                        name="yourAffiliation"
                        value={formData.yourAffiliation}
                        onChange={handleInputChange}
                        placeholder="University / Institution"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Context */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Context
                      <span className="normal-case font-normal ml-1 text-gray-400">(2–3 sentences)</span>
                    </label>
                    <textarea
                    required
                      name="context"
                      value={formData.context}
                      onChange={handleInputChange}
                      placeholder="Describe the purpose of your email..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Tone
                    </label>
                    <div className="flex gap-2">
                      {TONES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, tone: t.value }))}
                          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            formData.tone === t.value
                              ? "bg-cyan-500 border-cyan-500 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900/40"
                              : "bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-cyan-300 dark:hover:border-cyan-700"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Additional Notes
                      <span className="normal-case font-normal ml-1 text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      placeholder="Special instructions, abstract, keywords..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || remaining <= 0}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                      remaining <= 0
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : loading
                        ? "bg-cyan-400 dark:bg-cyan-700 text-white cursor-wait"
                        : "bg-cyan-500 hover:bg-cyan-600 active:scale-[0.99] text-white shadow-cyan-200 dark:shadow-cyan-900/30"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate Emails
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4">
                  <MessageLimitBanner usedToday={usedToday} limit={5} />
                </div>
              </div>

              {/* ── RESULTS PANEL ── */}
              <div>
                {loading ? (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-6 min-h-64 flex flex-col items-center justify-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Loader size={22} className="animate-spin text-cyan-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Generating your emails…
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Usually takes 5–10 seconds
                      </p>
                    </div>
                  </div>
                ) : emails ? (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm">

                    {/* Result header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                          Generated Emails
                        </h2>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </div>

                    {/* Subject line */}
                    <div className="mb-4 p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-800/50 rounded-xl">
                      <p className="text-[10px] font-bold text-cyan-500 dark:text-cyan-400 uppercase tracking-widest mb-1">
                        Subject Line
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                        {emails.subject}
                      </p>
                    </div>

                    {/* Style tabs */}
                    <div className="flex gap-1 mb-4 bg-gray-100/80 dark:bg-white/5 rounded-xl p-1">
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            activeTab === tab.id
                              ? "bg-white dark:bg-white/10 text-cyan-600 dark:text-cyan-400 shadow-sm"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Email body */}
                    <div className="bg-gray-50/80 dark:bg-black/20 rounded-xl p-4 mb-4 max-h-72 overflow-y-auto ring-1 ring-gray-100 dark:ring-white/5">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {activeEmailBody}
                      </p>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={() => copyToClipboard(activeEmailBody, activeTab)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-cyan-500 hover:bg-cyan-600 active:scale-[0.99] text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900/30"
                    >
                      {copied === activeTab ? (
                        <>
                          <Check size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy Email
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-6 min-h-64 flex flex-col items-center justify-center gap-3 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <Mail size={24} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        No email generated yet
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-56">
                        Fill in the form and click "Generate Emails" to see results here
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Or select a previous chat from the sidebar
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