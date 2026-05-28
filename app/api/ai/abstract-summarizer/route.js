import { OpenRouter } from '@openrouter/sdk'
import PocketBase from 'pocketbase'
import { DAILY_MESSAGE_LIMIT } from '@/lib/ai-usage'

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  httpReferer: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appTitle: 'Research Assistant',
})

const MAX_INPUT_LENGTH = 10000

const SYSTEM_PROMPT = `You are an expert research assistant specializing in academic paper analysis and summarization.

Your task is to analyze research papers and abstracts, then provide clear, structured summaries.

KEY REQUIREMENTS:
- Provide summaries for the specified target audience level
- Use clear, jargon-appropriate language
- Highlight main contributions and findings
- Return ONLY valid JSON, no markdown, no extra text
- Each summary should be comprehensive yet concise

JSON OUTPUT STRUCTURE REQUIRED:
{
  "oneLine": "A single comprehensive sentence summarizing the entire paper",
  "summary": "2-3 paragraph technical summary highlighting methodology, results, and implications",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "methodology": "Brief description of research methodology used",
  "targetAudienceInsight": "How this research applies to the target audience",
  "limitations": "Known limitations or scope constraints"
}

NEGATIVE PROMPTING - DO NOT:
- Do not add citations or references not in the original text
- Do not speculate beyond what is stated in the paper
- Do not use generic or vague descriptions
- Do not include marketing language or hype
- Do not modify technical terms or change meanings
- Do not add your own opinions or interpretations
- Do not create fictional details
- Do not return markdown formatting, code blocks, or explanations outside JSON
- Do not summarize repetitively - be concise and focused
- Do not ignore the target audience specification
}
`

export async function POST(req) {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    const body = await req.json()
    const { inputText, inputType, targetAudience, paperTitle, doi, userId, chatId } = body

    if (!inputText || inputText.trim().length < 50) {
      return Response.json(
        { error: 'Input text too short. Please provide at least 50 characters.' },
        { status: 400 }
      )
    }
    const trimmedInput = inputText.trim().slice(0, MAX_INPUT_LENGTH)

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
Input Type: ${inputType}
Target Audience: ${targetAudience}
${paperTitle ? `Paper Title: ${paperTitle}` : ''}
${doi ? `DOI: ${doi}` : ''}

Text to Analyze:
"""
${trimmedInput}
"""
    `.trim()

    console.log('Calling OpenRouter API with model: anthropic/claude-3.5-haiku')

    const completion = await client.chat.send({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const summary = JSON.parse(completion.choices[0].message.content)

    // ── SAVE TO POCKETBASE ────────────────────────
    const chatTitle = paperTitle || `${trimmedInput.slice(0, 50)}…`
    const userMessage = {
      role: 'user',
      content: { inputText: trimmedInput, inputType, targetAudience, paperTitle, doi },
      timestamp: new Date().toISOString(),
    }
    const assistantMessage = {
      role: 'assistant',
      content: summary,
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
        feature: 'abstract_summarizer',
        title: chatTitle,
        messages: [userMessage, assistantMessage],
      })
      finalChatId = newChat.id
    }

    // ── INCREMENT USAGE ───────────────────────────
    if (usageRecord) {
      await pb.collection('ai_usage_log').update(usageRecord.id, {
        message_count: usedToday + 1,
      })
    } else {
      await pb.collection('ai_usage_log').create({ user: userId, date: today, message_count: 1 })
    }

    return Response.json({
      summary,
      chatId: finalChatId,
      remainingToday: DAILY_MESSAGE_LIMIT - (usedToday + 1),
    })
  } catch (error) {
    console.error('Abstract summarizer error:', error)
    return Response.json(
      { error: 'Failed to summarize abstract', message: error.message },
      { status: 500 }
    )
  }
}