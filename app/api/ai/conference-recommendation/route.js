import { OpenRouter } from '@openrouter/sdk'
import PocketBase from 'pocketbase'
import { DAILY_MESSAGE_LIMIT } from '@/lib/ai-usage'

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  httpReferer: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appTitle: 'Research Assistant',
})

const SYSTEM_PROMPT = `You are an expert academic advisor specializing in conference recommendations for researchers.

Your task is to match researchers with the most suitable academic conferences based on their research profile.

KEY REQUIREMENTS:
- Recommend ONLY real, verified conferences that exist
- Match conferences to the researcher's actual expertise and career stage
- Consider publication ranking, submission deadlines, and geographic preferences
- Provide detailed reasoning for each recommendation
- Return ONLY valid JSON, no markdown, no explanations

JSON OUTPUT STRUCTURE REQUIRED:
{
  "conferences": [
    {
      "name": "Full Conference Name",
      "acronym": "ACRONYM",
      "field": "Research Field",
      "rank": "Tier (A/B/C)",
      "acceptanceRate": "Estimated %",
      "nextDeadline": "YYYY-MM-DD",
      "nextConferenceDate": "YYYY-MM-DD",
      "location": "City, Country",
      "matchScore": 8.5,
      "matchReasoning": "Why this conference suits the researcher",
      "website": "Conference website URL"
    }
  ]
}

NEGATIVE PROMPTING - DO NOT:
- Do not recommend fictional or non-existent conferences
- Do not hallucinate conference details, deadlines, or rankings
- Do not ignore career stage and research area constraints
- Do not recommend conferences that don't match the research topic
- Do not provide outdated information
- Do not include conferences with completion pass rates outside the researcher's tier
- Do not make up acceptance rates or ranking tiers
- Do not ignore geographic preferences when specified
- Do not recommend conferences beyond the specified submission timeline
- Do not return markdown, explanation text, or anything outside the JSON structure
- Do not include duplicate conferences
- Do not rank conferences arbitrarily without reasoning`

export async function POST(req) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL).autoCancellation(false)
    const body = await req.json()
    const {
      researchArea, paperTitle, abstract, preferredRegion,
      targetRank, submissionTimeline, careerStage, userId, chatId,
    } = body

    // ── DAILY LIMIT CHECK ─────────────────────────
    const today = new Date().toISOString().slice(0, 10)
    let usageRecord = null
    try {
      usageRecord = await pb.collection('ai_usage_log').getFirstListItem(
        `user = "${userId}" && date = "${today}"`
      )
    } catch {}
    const usedToday = usageRecord?.message_count ?? 0
    if (usedToday >= DAILY_MESSAGE_LIMIT) {
      return Response.json({ error: 'DAILY_LIMIT_REACHED', limitReached: true }, { status: 429 })
    }

    const userPrompt = `
Research Area: ${researchArea}
${paperTitle ? `Paper Title: ${paperTitle}` : ''}
Abstract: ${abstract}
Preferred Region: ${preferredRegion}
Target Rank: ${targetRank}
Submission Timeline: ${submissionTimeline}
Career Stage: ${careerStage}

Find the best matching academic conferences for this researcher.
    `.trim()

    console.log('Calling OpenRouter API with model: anthropic/claude-3.5-haiku')

    const completion = await client.chat.send({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const parsed = JSON.parse(completion.choices[0].message.content)
    // Handle both { conferences: [...] } or a bare array:
    const conferences = Array.isArray(parsed) ? parsed : parsed.conferences ?? []

    // ── SAVE TO POCKETBASE ────────────────────────
    const userMessage = {
      role: 'user',
      content: { researchArea, paperTitle, abstract, preferredRegion, targetRank, submissionTimeline, careerStage },
      timestamp: new Date().toISOString(),
    }
    const assistantMessage = {
      role: 'assistant',
      content: { conferences, sources: [] },
      timestamp: new Date().toISOString(),
    }

    let finalChatId = chatId
    if (chatId) {
      const existing = await pb.collection('ai_chats').getOne(chatId)
      await pb.collection('ai_chats').update(chatId, {
        messages: [...existing.messages, userMessage, assistantMessage],
      })
    } else {
      const newChat = await pb.collection('ai_chats').create({
        user: userId,
        feature: 'conference_recommendation',
        title: paperTitle || `${researchArea} conferences`,
        messages: [userMessage, assistantMessage],
      })
      finalChatId = newChat.id
    }

    // ── INCREMENT USAGE ───────────────────────────
    if (usageRecord) {
      await pb.collection('ai_usage_log').update(usageRecord.id, { message_count: usedToday + 1 })
    } else {
      await pb.collection('ai_usage_log').create({ user: userId, date: today, message_count: 1 })
    }

    return Response.json({
      conferences,
      chatId: finalChatId,
      sources: [],
      remainingToday: DAILY_MESSAGE_LIMIT - (usedToday + 1),
    })
  } catch (error) {
    console.error('Conference recommendation error:', error)
    return Response.json(
      { error: 'Failed to generate conference recommendations', message: error.message },
      { status: 500 }
    )
  }
}