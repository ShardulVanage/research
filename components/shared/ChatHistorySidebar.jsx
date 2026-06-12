"use client"

import { useEffect, useState } from "react"
import { useAIChat } from "@/hooks/useAIChat"
import { getDailyUsage } from "@/lib/ai-usage"
import { Trash2, Plus, Search } from "lucide-react"

export function ChatHistorySidebar({ userId, feature, currentChatId, onSelectChat, onNewChat }) {
  const { loadChatHistory, deleteChat, getRemainingMessagesToday } = useAIChat()
  const [chatHistory, setChatHistory] = useState([])
  const [usedToday, setUsedToday] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [history, usage] = await Promise.all([
          loadChatHistory(userId, feature),
          getDailyUsage(userId),
        ])
        setChatHistory(history)
        setUsedToday(usage)
      } catch (error) {
        console.error("Error loading chat history:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userId, feature, loadChatHistory])

  const handleDeleteChat = async (chatId) => {
    if (confirm("Delete this chat? This action cannot be undone.")) {
      try {
        await deleteChat(chatId)
        setChatHistory(chatHistory.filter((c) => c.id !== chatId))
      } catch (error) {
        console.error("Error deleting chat:", error)
      }
    }
  }

  const filteredChats = chatHistory.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedChats = {
    today: filteredChats.filter((c) => {
      const chatDate = new Date(c.created).toLocaleDateString()
      const today = new Date().toLocaleDateString()
      return chatDate === today
    }),
    yesterday: filteredChats.filter((c) => {
      const chatDate = new Date(c.created)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return chatDate.toLocaleDateString() === yesterday.toLocaleDateString()
    }),
    earlier: filteredChats.filter((c) => {
      const chatDate = new Date(c.created)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return chatDate.toLocaleDateString() < yesterday.toLocaleDateString()
    }),
  }

  return (
    <div className="w-full bg-white/5 dark:bg-black/20 border-r border-white/10 dark:border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 dark:border-white/5">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Daily Usage */}
      <div className="px-4 py-3 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Today:</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < usedToday ? "bg-cyan-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="ml-auto">{5 - usedToday} left</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10 dark:border-white/5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <>
            {/* Today */}
            {groupedChats.today.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Today
                </div>
                {groupedChats.today.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChatId === chat.id}
                    onSelect={onSelectChat}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </div>
            )}

            {/* Yesterday */}
            {groupedChats.yesterday.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Yesterday
                </div>
                {groupedChats.yesterday.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChatId === chat.id}
                    onSelect={onSelectChat}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </div>
            )}

            {/* Earlier */}
            {groupedChats.earlier.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Earlier
                </div>
                {groupedChats.earlier.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChatId === chat.id}
                    onSelect={onSelectChat}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </div>
            )}

            {filteredChats.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No chats yet. Start a new one!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ChatItem({ chat, isActive, onSelect, onDelete }) {
  return (
    <div
      className={`mx-2 my-1 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group flex items-start justify-between gap-2 ${
        isActive
          ? "bg-cyan-500/20 border border-cyan-500/30"
          : "hover:bg-white/10 dark:hover:bg-black/30"
      }`}
      onClick={() => onSelect(chat.id)}
    >
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {chat.title || "Untitled"}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {new Date(chat.created).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(chat.id)
        }}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 transition-all duration-200"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
