"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDailyUsage } from "@/lib/ai-usage"
import { Mail, BookOpen, Sparkles, ArrowRight, LogOut } from "lucide-react"

const FEATURES = [
  {
    id: "email-generator",
    title: "📧 Email Generator",
    description: "Generate professional academic emails in multiple styles (Formal, Semi-formal, Concise)",
    icon: Mail,
    color: "from-blue-500 to-blue-600",
    accent: "bg-blue-500",
    tags: ["Formal", "Professional", "Multiple Tones"],
  },
  {
    id: "conference-recommendation",
    title: "🎓 Conference Finder",
    description: "Get AI-powered conference recommendations matching your research with real-time web search",
    icon: BookOpen,
    color: "from-purple-500 to-purple-600",
    accent: "bg-purple-500",
    tags: ["Live Search", "Ranking Filter", "Deadline Tracking"],
  },
  {
    id: "abstract-summarizer",
    title: "📝 Abstract Summarizer",
    description: "Instantly summarize papers in multiple formats with DOI auto-fetch",
    icon: Sparkles,
    color: "from-amber-500 to-amber-600",
    accent: "bg-amber-500",
    tags: ["Multi-format", "DOI Support", "Export Options"],
  },
]

export function AIToolsPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [usedToday, setUsedToday] = useState(0)

  useEffect(() => {
    if (user) {
      getDailyUsage(user.id).then(setUsedToday)
    }
  }, [user])

  const handleLogout = () => {
    signOut()
    router.push("/login")
  }

  const remaining = 5 - usedToday

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access AI tools
          </h1>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/30 backdrop-blur-md border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ResearchAI</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.name || "Researcher"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/30 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-16 text-center">
        <div className="mb-8 inline-block">
          <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 rounded-full text-sm font-medium">
            ✨ Powered by Google Gemini 2.0
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          AI-Powered Research Tools
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
          Accelerate your academic work with cutting-edge AI. Generate professional emails, discover relevant
          conferences, and summarize papers instantly.
        </p>

        {/* Daily Usage Stats */}
        <div className="inline-block mb-12">
          <div className="bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Daily Messages Remaining</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i < usedToday ? "bg-cyan-500" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="border-l border-white/20 dark:border-white/10 h-12" />
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{remaining}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">out of 5 available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            const remaining_msgs = 5 - usedToday

            return (
              <div
                key={feature.id}
                onClick={() => router.push(`/ai/${feature.id}`)}
                className="group relative cursor-pointer"
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                />

                {/* Card */}
                <div className="relative bg-white/80 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-2xl p-8 h-full flex flex-col hover:border-white/40 dark:hover:border-white/20 transition-all duration-300 hover:shadow-xl">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={32} className="text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                    {feature.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/20 dark:bg-black/40 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      remaining_msgs <= 0
                        ? "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                        : `bg-gradient-to-r ${feature.color} text-white hover:shadow-lg group-hover:scale-105`
                    }`}
                    disabled={remaining_msgs <= 0}
                  >
                    <span>Try Now</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </button>

                  {remaining_msgs <= 0 && (
                    <p className="text-xs text-center text-red-500 dark:text-red-400 mt-2">
                      Daily limit reached
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white/50 dark:bg-black/20 border-y border-white/20 dark:border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Why Choose ResearchAI?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Lightning Fast",
                description: "Powered by Google Gemini's latest models for instant results",
                icon: "⚡",
              },
              {
                title: "Intelligent Matching",
                description: "AI understands your research to find the perfect fit",
                icon: "🎯",
              },
              {
                title: "Real-Time Search",
                description: "Conference recommendations use live web data",
                icon: "🌐",
              },
              {
                title: "Privacy First",
                description: "Your data stays secure in PocketBase",
                icon: "🔒",
              },
              {
                title: "Multi-Format Output",
                description: "Export results as JSON, Markdown, or text",
                icon: "📄",
              },
              {
                title: "Chat History",
                description: "Keep all your work organized by date",
                icon: "💾",
              },
              {
                title: "Daily Limits",
                description: "Fair usage system protects API costs",
                icon: "📊",
              },
              {
                title: "Dark Mode Ready",
                description: "Beautiful interface in light and dark modes",
                icon: "🌙",
              },
            ].map((highlight, idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-xl p-6 hover:border-white/40 dark:hover:border-white/20 transition-all duration-200"
              >
                <p className="text-3xl mb-3">{highlight.icon}</p>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {highlight.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-8 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Built with Next.js, PocketBase, and Google Generative AI
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          © 2026 ResearchAI. All rights reserved. | Limited to 5 messages per day per user.
        </p>
      </div>
    </div>
  )
}
