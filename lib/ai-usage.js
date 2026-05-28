import PocketBase from 'pocketbase'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)

export const DAILY_MESSAGE_LIMIT = 5

export async function getDailyUsage(userId) {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const record = await pb.collection('ai_usage_log').getFirstListItem(
      `user = "${userId}" && date = "${today}"`
    )
    return record.message_count ?? 0
  } catch {
    return 0
  }
}

export async function getRemainingMessages(userId) {
  const used = await getDailyUsage(userId)
  return Math.max(0, DAILY_MESSAGE_LIMIT - used)
}

export async function incrementDailyUsage(userId) {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const record = await pb.collection('ai_usage_log').getFirstListItem(
      `user = "${userId}" && date = "${today}"`
    )
    await pb.collection('ai_usage_log').update(record.id, {
      message_count: (record.message_count ?? 0) + 1,
    })
  } catch {
    await pb.collection('ai_usage_log').create({
      user: userId,
      date: today,
      message_count: 1,
    })
  }
}
