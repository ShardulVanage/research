import { useState } from "react"

export function ExpandableText({ text = "", maxLength = 200 }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text || text.length <= maxLength) {
    return <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
  }

  return (
    <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
      <p>{isExpanded ? text : `${text.substring(0, maxLength)}...`}</p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-cyan-600 dark:text-cyan-400 hover:underline text-sm font-medium transition-colors"
      >
        {isExpanded ? "View less" : "View more"}
      </button>
    </div>
  )
}
