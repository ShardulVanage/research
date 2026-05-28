"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function AIPageHeader({ title, description }) {
  const router = useRouter()

  return (
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/30 backdrop-blur-md border-b border-white/20 dark:border-white/10 mb-8">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <button
          onClick={() => router.push("/ai")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/30 text-cyan-500 hover:text-cyan-600 transition-colors mb-4 font-medium"
        >
          <ArrowLeft size={18} />
          Back to AI Tools
        </button>
      </div>
    </div>
  )
}
