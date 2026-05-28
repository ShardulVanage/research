"use client"

export default function MessageLimitBanner({ usedToday, limit = 5 }) {
  const remaining = limit - usedToday
  const isExhausted = remaining <= 0
  const isWarning = remaining === 1

  return (
    <div
      className={`
        flex items-center justify-between gap-3 px-4 py-2 rounded-lg
        border backdrop-blur-sm text-sm font-medium transition-all duration-200
        ${isExhausted
          ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400'
          : isWarning
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          : 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 text-gray-600 dark:text-gray-400'
        }
      `}
    >
      {isExhausted ? (
        <span>⛔ Daily limit reached — resets at midnight UTC</span>
      ) : (
        <span>
          💬 {remaining} message{remaining !== 1 ? 's' : ''} remaining today
        </span>
      )}

      {/* Usage pip dots — matches cyan-500 accent from ThemeToggle */}
      <div className="flex items-center gap-1">
        {Array.from({ length: limit }).map((_, i) => (
          <span
            key={i}
            className={`
              w-2 h-2 rounded-full transition-all duration-200
              ${i < usedToday
                ? isExhausted
                  ? 'bg-red-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
                : 'bg-gray-300 dark:bg-gray-600'
              }
            `}
          />
        ))}
      </div>
    </div>
  )
}
