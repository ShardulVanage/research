"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ChatHistorySidebar } from "@/components/shared/ChatHistorySidebar"
import { AIPageHeader } from "@/components/shared/AIPageHeader"
import MessageLimitBanner from "@/components/shared/MessageLimitBanner"
import { getDailyUsage } from "@/lib/ai-usage"
import { Copy, Check, Loader, Download, Share2 } from "lucide-react"
import {toast} from "sonner"

const INPUT_TYPES = [
  { value: "abstract", label: "Abstract" },
  { value: "introduction", label: "Introduction" },
  { value: "full-paper", label: "Full Paper" },
  { value: "conclusion", label: "Conclusion" },
]

const AUDIENCES = [
  { value: "general-public", label: "General Public" },
  { value: "undergrad", label: "Undergraduate" },
  { value: "grad-student", label: "Graduate Student" },
  { value: "expert", label: "Expert in Field" },
]

export function AbstractSummarizer() {
  const { user } = useAuth()
  const [inputText, setInputText] = useState("")
  const [inputType, setInputType] = useState("abstract")
  const [targetAudience, setTargetAudience] = useState("grad-student")
  const [paperTitle, setPaperTitle] = useState("")
  const [doi, setDoi] = useState("")
  const [doiLoading, setDoiLoading] = useState(false)

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [usedToday, setUsedToday] = useState(0)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [activeTab, setActiveTab] = useState("quick")
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (user) {
      getDailyUsage(user.id).then(setUsedToday)
    }
  }, [user])

  const handleFetchDOI = async () => {
    if (!doi.trim()) {
      toast.error("Please enter a DOI")
      return
    }

    setDoiLoading(true)
    try {
      const response = await fetch(`https://api.crossref.org/works/${doi}`)
      if (!response.ok) {
        toast.error("DOI not found")
        return
      }

      const data = await response.json()
      const abstract = data.message?.abstract
      const title = data.message?.title?.[0]

      if (abstract) {
        setInputText(abstract)
        if (title) setPaperTitle(title)
        toast.success("Abstract fetched successfully!")
      } else {
        toast.error("No abstract found for this DOI")
      }
    } catch (error) {
      console.error("Error fetching DOI:", error)
      toast.error("Failed to fetch DOI")
    } finally {
      setDoiLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (usedToday >= 5) {
      toast.error("Daily limit reached")
      return
    }

    if (!inputText.trim()) {
      toast.error("Please enter text to analyze")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/abstract-summarizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText,
          inputType,
          targetAudience,
          paperTitle,
          doi,
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
          toast.error(data.message || "Failed to summarize")
        }
        return
      }

      setSummary(data.summary)
      setCurrentChatId(data.chatId)
      setUsedToday((prev) => prev + 1)
      setActiveTab("quick")
      toast.success("Abstract summarized successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to summarize abstract")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copied to clipboard!")
  }

  const downloadAsMarkdown = () => {
    if (!summary) return

    let markdown = `# Summary: ${paperTitle || "Untitled"}\n\n`
    markdown += `## One-Line Summary\n${summary.oneLine}\n\n`
    markdown += `## Plain English Summary\n${summary.plainEnglish}\n\n`
    markdown += `## Technical Summary\n${summary.technical}\n\n`
    markdown += `## Key Contributions\n${summary.contributions.map((c) => `- ${c}`).join("\n")}\n\n`
    markdown += `## Methodology\n${summary.methodology}\n\n`
    markdown += `## Results\n${summary.results}\n\n`
    markdown += `## Limitations\n${summary.limitations}\n\n`
    markdown += `## Keywords\n${summary.keywords.join(", ")}\n\n`
    markdown += `## Research Gap Addressed\n${summary.researchGap}\n\n`
    markdown += `## Future Work\n${summary.futureWork}\n\n`
    markdown += `## Related Citation Areas\n${summary.citationAreas.join(", ")}`

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/markdown;charset=utf-8," + encodeURIComponent(markdown))
    element.setAttribute("download", `${paperTitle || "summary"}.md`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Downloaded as Markdown!")
  }

  const remaining = 5 - usedToday
  const charCount = inputText.length

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
      <AIPageHeader title="Abstract Summarizer" description="Understand research papers instantly" />
      {/* Sidebar */}
      {user && (
        <ChatHistorySidebar
          userId={user.id}
          feature="abstract_summarizer"
          currentChatId={currentChatId}
          onSelectChat={(chatId) => setCurrentChatId(chatId)}
          onNewChat={() => {
            setCurrentChatId(null)
            setSummary(null)
            setInputText("")
            setPaperTitle("")
            setDoi("")
          }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📝 Abstract Summarizer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Instantly understand research papers with AI-powered multi-format summaries
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Paper Information
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Paper Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Paper Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={paperTitle}
                        onChange={(e) => setPaperTitle(e.target.value)}
                        placeholder="Enter paper title"
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                      />
                    </div>

                    {/* DOI Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        DOI (Optional - Auto-fetch abstract)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={doi}
                          onChange={(e) => setDoi(e.target.value)}
                          placeholder="10.1234/example.doi"
                          className="flex-1 px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        <button
                          type="button"
                          onClick={handleFetchDOI}
                          disabled={doiLoading}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                        >
                          {doiLoading ? <Loader size={18} className="animate-spin" /> : "Fetch"}
                        </button>
                      </div>
                    </div>

                    {/* Input Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content Type
                      </label>
                      <select
                        value={inputType}
                        onChange={(e) => setInputType(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {INPUT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Audience
                      </label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white"
                      >
                        {AUDIENCES.map((aud) => (
                          <option key={aud.value} value={aud.value}>
                            {aud.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Input Text */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Abstract or Text
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {charCount} / 10,000
                        </span>
                      </div>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value.slice(0, 10000))}
                        placeholder="Paste your abstract, introduction, or paper text here..."
                        rows={8}
                        className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 resize-none text-sm"
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
                          Analyzing...
                        </>
                      ) : (
                        "Summarize"
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
              <div className="space-y-6">
                {summary && (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Summary
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={downloadAsMarkdown}
                          className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/30 text-gray-600 dark:text-gray-400 transition-colors"
                          title="Download as Markdown"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => {
                            navigator.share({
                              title: paperTitle || "Summary",
                              text: summary.oneLine,
                            })
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/30 text-gray-600 dark:text-gray-400 transition-colors"
                          title="Share"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto border-b border-white/10 dark:border-white/5 pb-0">
                      {[
                        { id: "quick", label: "Quick View" },
                        { id: "technical", label: "Technical" },
                        { id: "deep", label: "Deep Dive" },
                        { id: "export", label: "Export" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-2 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                            activeTab === tab.id
                              ? "border-cyan-500 text-cyan-500"
                              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                      {activeTab === "quick" && (
                        <>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              One-Line Summary
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {summary.oneLine}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Plain English
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {summary.plainEnglish}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {summary.keywords.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-medium"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === "technical" && (
                        <>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Technical Summary
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {summary.technical}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Key Contributions
                            </h3>
                            <ul className="space-y-1">
                              {summary.contributions.map((contrib, i) => (
                                <li
                                  key={i}
                                  className="text-gray-700 dark:text-gray-300 text-sm flex gap-2"
                                >
                                  <span className="text-cyan-500 flex-shrink-0">•</span>
                                  <span>{contrib}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Methodology
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {summary.methodology}
                            </p>
                          </div>
                        </>
                      )}

                      {activeTab === "deep" && (
                        <>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Results
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {summary.results}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Limitations
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {summary.limitations}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Research Gap Addressed
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {summary.researchGap}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              Future Work
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {summary.futureWork}
                            </p>
                          </div>
                        </>
                      )}

                      {activeTab === "export" && (
                        <>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(summary, null, 2))}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
                          >
                            {copied ? (
                              <>
                                <Check size={18} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={18} />
                                Copy All as JSON
                              </>
                            )}
                          </button>
                          <button
                            onClick={downloadAsMarkdown}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                          >
                            <Download size={18} />
                            Download as Markdown
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {!summary && (
                  <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-12 flex items-center justify-center h-96">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Paste your abstract or paper text to get started
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
