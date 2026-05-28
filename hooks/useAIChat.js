import PocketBase from 'pocketbase'
import { DAILY_MESSAGE_LIMIT } from '@/lib/ai-usage'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL).autoCancellation(false)

export function useAIChat() {
  async function createChat(userId, feature, title, firstMessages = []) {
    const record = await pb.collection('ai_chats').create({
      user: userId,
      feature,
      title,
      messages: firstMessages,
    })
    return record.id
  }

  async function appendMessage(chatId, newMessage) {
    const existing = await pb.collection('ai_chats').getOne(chatId)
    await pb.collection('ai_chats').update(chatId, {
      messages: [...existing.messages, newMessage],
    })
  }

  async function loadChatHistory(userId, feature) {
    return await pb.collection('ai_chats').getFullList({
      filter: `user = "${userId}" && feature = "${feature}"`,
      sort: '-created',
      fields: 'id,title,created,messages',
    })
  }

  async function loadChat(chatId) {
    return await pb.collection('ai_chats').getOne(chatId)
  }

  async function deleteChat(chatId) {
    await pb.collection('ai_chats').delete(chatId)
  }

  async function getRemainingMessagesToday(userId) {
    const today = new Date().toISOString().slice(0, 10)
    try {
      const record = await pb.collection('ai_usage_log').getFirstListItem(
        `user = "${userId}" && date = "${today}"`
      )
      return Math.max(0, DAILY_MESSAGE_LIMIT - (record.message_count ?? 0))
    } catch {
      return DAILY_MESSAGE_LIMIT // No record = full quota remaining
    }
  }

  return {
    createChat,
    appendMessage,
    loadChatHistory,
    loadChat,
    deleteChat,
    getRemainingMessagesToday,
  }
}
