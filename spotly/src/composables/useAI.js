import { ref } from 'vue'

const MODEL = 'qwen2.5:3b'
const ENDPOINT = 'http://localhost:11434/v1/chat/completions'

const loading = ref(false)
const error = ref(null)

async function _post (body) {
  loading.value = true
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      throw new Error(`Ollama error ${res.status}: ${await res.text()} — is Ollama running? (ollama serve)`)
    }
    return await res.json()
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
