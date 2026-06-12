import OpenAI from 'openai'
import PocketBase from 'pocketbase'
import { DAILY_MESSAGE_LIMIT } from '@/lib/ai-usage'
import { getConferences } from '@/lib/pocketbase'

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'ZEP Research Assistant',
  },
})

const SYSTEM_PROMPT = `You are an expert academic advisor specializing in conference recommendations for researchers at ZEP Research.

Your task is to match researchers with the most suitable academic conferences based on their research profile.

KEY REQUIREMENTS:
- PRIORITIZE any ZEP-hosted conferences provided in the user message — always include them first if they match the research area
- Recommend ONLY real, verified conferences that exist
- Match conferences to the researcher's actual expertise and career stage
- Consider publication ranking, submission deadlines, and geographic preferences
- Provide detailed reasoning for each recommendation
- Return ONLY valid JSON, no markdown, no explanations, no code fences

JSON OUTPUT STRUCTURE REQUIRED — return exactly this shape:
{
  "conferences": [
    {
      "name": "Full Conference Name",
      "acronym": "ACRONYM",
      "field": "Research Field",
      "rank": "A* or A or B or C or Workshop",
      "acceptanceRate": "Estimated % e.g. 23%",
      "deadline": "Human readable e.g. Aug 15, 2025 or TBA",
      "location": "City, Country or Online",
      "format": "In-Person or Hybrid or Online",
      "fee": "e.g. $500 or Free or TBA",
      "whyFit": "2-3 sentences explaining why this conference suits the researcher",
      "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
      "website": "https://conference-website.com",
      "isZEPConference": false
    }
  ]
}

NEGATIVE PROMPTING — DO NOT:
- Do not recommend fictional or non-existent conferences
- Do not hallucinate conference details, deadlines, or rankings
- Do not ignore career stage and research area constraints
- Do not recommend conferences that don't match the research topic
- Do not ignore geographic preferences when specified
- Do not recommend conferences beyond the specified submission timeline
- Do not return markdown, explanation text, or anything outside the JSON structure
- Do not include duplicate conferences
- Do not make up acceptance rates — use known approximate rates or write "~X%"
- Do not use the nextDeadline or nextConferenceDate keys — use "deadline" only
- Always set isZEPConference to true for any ZEP-hosted conference provided`

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      researchArea,
      paperTitle,
      abstract,
      preferredRegion,
      targetRank,
      submissionTimeline,
      careerStage,
      userId,
      chatId,
      pbToken,
    } = body

    // ── POCKETBASE (authenticated as the user) ────
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL).autoCancellation(false)
    if (pbToken) {
      pb.authStore.save(pbToken, null)
    }

    // ── DAILY LIMIT CHECK ─────────────────────────
    const today = new Date().toISOString().slice(0, 10)
    let usageRecord = null
    try {
      usageRecord = await pb
        .collection('ai_usage_log')
        .getFirstListItem(`user = "${userId}" && date = "${today}"`)
    } catch {}
    const usedToday = usageRecord?.message_count ?? 0
    if (usedToday >= DAILY_MESSAGE_LIMIT) {
      return Response.json(
        { error: 'DAILY_LIMIT_REACHED', limitReached: true },
        { status: 429 }
      )
    }

    // ── FETCH ZEP CONFERENCES AS PRIORITY CONTEXT ─
    let zepConferencesContext = ''
    try {
      const result = await getConferences()
      if (result.success && result.data.length > 0) {
        const zepList = result.data.map((c) => {
          return [
            `- Name: ${c.title || 'Unnamed'}`,
            `  Acronym: ${c.acronym || 'N/A'}`,
            `  Field: ${c.shortDescription || c.research_area || 'General'}`,
            `  Deadline: ${c.date || c.submission_deadline || 'TBA'}`,
            `  Location: ${c.location || 'TBA'}`,
            `  Website: ${c.websiteUrl || c.url || 'N/A'}`,
            `  Description: ${c.description || ''}`,
          ].join('\n')
        })
        zepConferencesContext = `
PRIORITY — ZEP Research Platform Conferences (always include relevant ones first):
${zepList.join('\n\n')}
`
      }
    } catch (err) {
      console.warn('Could not fetch ZEP conferences:', err.message)
    }

    const userPrompt = `
${zepConferencesContext}
Research Area: ${researchArea}
${paperTitle ? `Paper Title: ${paperTitle}` : ''}
Abstract: ${abstract}
Preferred Region: ${preferredRegion}
Target Rank: ${targetRank}
Submission Timeline: ${submissionTimeline}
Career Stage: ${careerStage}

Find 6-8 best matching academic conferences for this researcher. Put any matching ZEP-hosted conferences first with isZEPConference set to true.
    `.trim()

    console.log('Calling OpenRouter API with model: anthropic/claude-3.5-haiku')

   const completion = await client.chat.completions.create({
  model: 'google/gemini-2.5-flash-lite:online',
  max_tokens: 2000,          // 1000 is too tight for 6-8 cards, use 2000
  temperature: 0.3,          // lower = more consistent JSON output
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ],
  // OpenRouter-specific override to hard cap Gemini
  extra_body: {
    max_tokens: 2000,
  },
})

    const rawContent = completion.choices[0].message.content

    // Strip markdown code fences if present
    let cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

    // Fix bare control characters inside JSON strings
    cleaned = cleaned.replace(
      /"((?:[^"\\]|\\.)*)"/gs,
      (match, inner) =>
        '"' +
        inner
          .replace(/\r\n/g, '\\n')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t') +
        '"'
    )

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('JSON parse failed. Raw content:', rawContent)
      console.error('Parse error:', parseError.message)
      return Response.json(
        {
          error: 'Failed to parse AI response',
          message: 'The AI returned malformed JSON. Please try again.',
        },
        { status: 500 }
      )
    }

    // Handle both { conferences: [...] } or a bare array
    const conferences = Array.isArray(parsed) ? parsed : parsed.conferences ?? []

    if (!conferences.length) {
      return Response.json(
        { error: 'No conferences returned', message: 'The AI returned no results. Please try again.' },
        { status: 500 }
      )
    }

    // ── SAVE TO POCKETBASE ────────────────────────
    const userMessage = {
      role: 'user',
      content: {
        researchArea,
        paperTitle,
        abstract,
        preferredRegion,
        targetRank,
        submissionTimeline,
        careerStage,
      },
      timestamp: new Date().toISOString(),
    }
    const assistantMessage = {
      role: 'assistant',
      content: { conferences, sources: [] },
      timestamp: new Date().toISOString(),
    }

    let finalChatId = chatId
    try {
      if (chatId) {
        const existing = await pb.collection('ai_chats').getOne(chatId)
        await pb.collection('ai_chats').update(chatId, {
          messages: [...existing.messages, userMessage, assistantMessage],
        })
      } else {
        const newChat = await pb.collection('ai_chats').create({
          user: userId,
          feature: 'conference_recommendation',
          title: (paperTitle || `${researchArea} conferences`).slice(0, 200),
          messages: [userMessage, assistantMessage],
        })
        finalChatId = newChat.id
      }
    } catch (pbError) {
      console.error('PocketBase save error:', pbError.status, JSON.stringify(pbError.response, null, 2))
      console.warn('Skipping chat save, returning conferences anyway.')
    }

    // ── INCREMENT USAGE ───────────────────────────
    try {
      if (usageRecord) {
        await pb
          .collection('ai_usage_log')
          .update(usageRecord.id, { message_count: usedToday + 1 })
      } else {
        await pb.collection('ai_usage_log').create({
          user: userId,
          date: today,
          message_count: 1,
        })
      }
    } catch (usageError) {
      console.error('Usage increment error:', usageError.message)
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