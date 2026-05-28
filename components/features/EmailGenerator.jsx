"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ChatHistorySidebar } from "@/components/shared/ChatHistorySidebar"
import { AIPageHeader } from "@/components/shared/AIPageHeader"
import MessageLimitBanner from "@/components/shared/MessageLimitBanner"
import { getDailyUsage } from "@/lib/ai-usage"
import { Copy, Check, Loader, Mail } from "lucide-react"
import { toast } from "sonner"
import PocketBase from "pocketbase"

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
  // Track when sidebar should refresh
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

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

    setLoading(true)
    // Clear previous results immediately so user knows a new request started
    setEmails(null)
    setCurrentChatId(null)

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
          // No chatId — backend always creates new record
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
      // Tell sidebar to reload history
      setHistoryRefreshKey((k) => k + 1)
      toast.success("Emails generated successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to generate emails")
    } finally {
      setLoading(false)
    }
  }

  // Called when user clicks a chat in the sidebar — load its stored emails
  const handleSelectChat = useCallback(async (chatId) => {
    if (!chatId) return
    setCurrentChatId(chatId)
    setEmails(null)
    setLoading(true)

    try {
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
      // pb.authStore is already populated from previous login
      const record = await pb.collection("ai_chats").getOne(chatId)

      // messages is an array of { role, input, output, timestamp }
      // We stored the emails in messages[0].output
      const msgs = record.messages
      if (Array.isArray(msgs) && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1]
        if (lastMsg?.output) {
          setEmails(lastMsg.output)
          setActiveTab("formal")
          // Restore the input form fields too so user sees what was submitted
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
    <div className="flex h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
      <AIPageHeader title="Email Generator" description="Generate professional academic emails" />

      {/* Sidebar — pass refreshKey so it reloads after each generation */}
      {user && (
        <ChatHistorySidebar
          key={historyRefreshKey}
          userId={user.id}
          feature="email_generator"
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🤖 Email Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Generate professional academic emails in multiple styles
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ── FORM ── */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Email Details
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Type
                      </label>
                      <select
                        name="emailType"
                        value={formData.emailType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {EMAIL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Recipient */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Title
                        </label>
                        <select
                          name="recipientTitle"
                          value={formData.recipientTitle}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                        >
                          {RECIPIENT_TITLES.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recipient Name
                        </label>
                        <input
                          type="text"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleInputChange}
                          placeholder="John Smith"
                          className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                        />
                      </div>
                    </div>

                    {/* Your Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="yourName"
                        value={formData.yourName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Affiliation
                      </label>
                      <input
                        type="text"
                        name="yourAffiliation"
                        value={formData.yourAffiliation}
                        onChange={handleInputChange}
                        placeholder="University or Institution"
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                      />
                    </div>

                    {/* Context */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Context (2–3 sentences)
                      </label>
                      <textarea
                        name="context"
                        value={formData.context}
                        onChange={handleInputChange}
                        placeholder="Describe the purpose of your email..."
                        rows={3}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                      />
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tone
                      </label>
                      <div className="flex gap-2">
                        {TONES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, tone: t.value }))
                            }
                            className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                              formData.tone === t.value
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/30"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                        placeholder="Any special instructions or Abstract & context..."
                        rows={2}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                      />
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
                          Generating...
                        </>
                      ) : (
                        "Generate Emails"
                      )}
                    </button>
                  </form>

                  <div className="mt-6">
                    <MessageLimitBanner usedToday={usedToday} limit={5} />
                  </div>
                </div>
              </div>

              {/* ── RESULTS ── */}
              <div>
                {loading ? (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6 h-96 flex flex-col items-center justify-center gap-4">
                    <Loader size={32} className="animate-spin text-cyan-500" />
                    <p className="text-gray-500 dark:text-gray-400">Generating your emails...</p>
                  </div>
                ) : emails ? (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail size={18} className="text-cyan-500" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Generated Emails
                      </h2>
                    </div>

                    {/* Subject */}
                    <div className="mb-4 p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1 uppercase tracking-wide">
                        Subject
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {emails.subject}
                      </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-white/10 dark:border-white/5">
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-2 font-medium transition-all duration-200 border-b-2 text-sm ${
                            activeTab === tab.id
                              ? "border-cyan-500 text-cyan-500"
                              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Email Body */}
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {activeEmailBody}
                      </p>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => copyToClipboard(activeEmailBody, activeTab)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      {copied === activeTab ? (
                        <>
                          <Check size={18} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          Copy Email
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6 h-96 flex flex-col items-center justify-center gap-3">
                    <Mail size={40} className="text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Fill in the form and click "Generate Emails" to see results here
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
                      Or select a previous chat from the sidebar to view it again
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