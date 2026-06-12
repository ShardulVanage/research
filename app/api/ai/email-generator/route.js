import OpenAI from 'openai'
import PocketBase from 'pocketbase'
import { DAILY_MESSAGE_LIMIT } from '@/lib/ai-usage'

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Research Assistant',
  },
})

const SYSTEM_PROMPT = `You are an expert academic communication specialist. Your task is to write professional, compelling academic emails.

KEY REQUIREMENTS:
- Match the specified tone (formal, friendly, urgent, etc.)
- Adapt content for the recipient's position and expertise level
- Maintain academic professionalism throughout
- Include clear call-to-action or next steps
- Keep emails concise but substantive (150-400 words)
- Return ONLY valid JSON — no markdown, no code fences, no extra text

JSON OUTPUT STRUCTURE — return exactly this shape:
{
  "subject": "A single subject line for all variants",
  "formal": "Full formal email body here",
  "semiformal": "Full semi-formal email body here",
  "concise": "Full concise email body here"
}

RULES:
- All email bodies must be complete, not truncated
- Use \\n for line breaks inside string values (valid JSON escape)
- Do NOT wrap output in markdown code fences
- Do NOT add any text before or after the JSON object
- Do NOT include spelling or grammatical errors
- Do NOT use informal language or slang
- Do NOT misrepresent the sender's credentials`

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      emailType, recipientName, recipientTitle, yourName,
      yourAffiliation, context, tone, additionalNotes, userId, pbToken,
      // NOTE: we intentionally ignore any incoming chatId — every submission creates a new chat
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
      usageRecord = await pb.collection('ai_usage_log').getFirstListItem(
        `user = "${userId}" && date = "${today}"`
      )
    } catch {}
    const usedToday = usageRecord?.message_count ?? 0
    if (usedToday >= DAILY_MESSAGE_LIMIT) {
      return Response.json(
        {
          error: 'DAILY_LIMIT_REACHED',
          message: `You have used all ${DAILY_MESSAGE_LIMIT} messages for today. Come back tomorrow!`,
          limitReached: true,
          resetAt: 'midnight UTC',
        },
        { status: 429 }
      )
    }

    const userPrompt = `
Generate a professional academic email with these details:
- Email Type: ${emailType}
- Recipient: ${recipientTitle} ${recipientName}
- Sender: ${yourName} from ${yourAffiliation}
- Tone: ${tone}
- Context: ${context}
${additionalNotes ? `- Additional Notes: ${additionalNotes}` : ''}
    `.trim()

    console.log('Calling OpenRouter API with model: anthropic/claude-3.5-haiku')

    const completion = await client.chat.completions.create({
      model: 'anthropic/claude-3.5-haiku',
      max_tokens: 700,
      temperature: 0.7,

      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
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

    let emails
    try {
      emails = JSON.parse(cleaned)
    } catch (parseError) {
      console.error('JSON parse failed. Raw content:', rawContent)
      console.error('Parse error:', parseError.message)
      return Response.json(
        { error: 'Failed to parse AI response', message: 'The AI returned malformed JSON. Please try again.' },
        { status: 500 }
      )
    }

    // Validate expected shape
    if (!emails.subject || !emails.formal || !emails.semiformal || !emails.concise) {
      console.error('Unexpected AI response shape:', emails)
      return Response.json(
        { error: 'Unexpected AI response', message: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 }
      )
    }

    // ── ALWAYS CREATE A NEW CHAT RECORD ──────────
    const chatRecord = {
      role: 'user',
      input: { emailType, recipientName, recipientTitle, yourName, yourAffiliation, context, tone, additionalNotes },
      output: emails,
      timestamp: new Date().toISOString(),
    }

    let newChatId = null
    try {
      const newChat = await pb.collection('ai_chats').create({
        user: userId,
        feature: 'email_generator',
        title: `${emailType} to ${recipientTitle} ${recipientName}`.slice(0, 200),
        messages: [chatRecord],
      })
      newChatId = newChat.id
    } catch (pbError) {
      console.error('PocketBase save error status:', pbError.status)
      console.error('PocketBase save error response:', JSON.stringify(pbError.response, null, 2))
      console.warn('Skipping chat save, returning emails anyway.')
    }

    // ── INCREMENT USAGE ───────────────────────────
    try {
      if (usageRecord) {
        await pb.collection('ai_usage_log').update(usageRecord.id, { message_count: usedToday + 1 })
      } else {
        await pb.collection('ai_usage_log').create({ user: userId, date: today, message_count: 1 })
      }
    } catch (usageError) {
      console.error('Usage increment error:', usageError.message)
    }

    return Response.json({
      emails,
      chatId: newChatId,
      remainingToday: DAILY_MESSAGE_LIMIT - (usedToday + 1),
    })
  } catch (error) {
    console.error('Email generator error:', error)
    return Response.json(
      { error: 'Failed to generate emails', message: error.message },
      { status: 500 }
    )
  }
}