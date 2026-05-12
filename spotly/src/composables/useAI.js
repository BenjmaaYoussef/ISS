import { ref } from 'vue'

const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

const loading = ref(false)
const error = ref(null)

async function _post (body) {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key) {
    throw new Error('VITE_GROQ_API_KEY is not set in .env.local')
  }
  loading.value = true
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(`Groq error ${res.status}: ${JSON.stringify(data.error ?? data)}`)
    }

    return data
  } finally {
    loading.value = false
  }
}

async function callAI (systemPrompt, userPrompt, { maxTokens = 1024, json = false } = {}) {
  try {
    const data = await _post({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
    })
    let text = data.choices[0].message.content
    if (json) {
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
      return JSON.parse(text)
    }
    return text
  } catch (error_) {
    error.value = error_.message
    throw error_
  }
}

async function callAIWithHistory (messages, { tools = [], maxTokens = 1024 } = {}) {
  try {
    const body = {
      model: MODEL,
      messages,
      max_tokens: maxTokens,
    }
    if (tools.length > 0) {
      body.tools = tools
      body.parallel_tool_calls = false // prevents Groq tool_use_failed on multi-tool turns
    }
    const data = await _post(body)
    const choice = data.choices[0]
    return {
      content: choice.message.content,
      tool_calls: choice.message.tool_calls ?? null,
      finish_reason: choice.finish_reason,
    }
  } catch (error_) {
    error.value = error_.message
    throw error_
  }
}

export function useAI () {
  return { callAI, callAIWithHistory, loading, error }
}
