const { ai } = require('../config')

class AiService {
  constructor() {}

  async reply(history = [], targetUser = '') {
    const targetHint = targetUser ? ` Responde directamente a ${targetUser} sobre su último mensaje.` : ''
    const messages = [
      {
        role: 'system',
        content: `Eres un asistente útil y claro. Responde en español de forma concisa.${targetHint}`
      },
      ...history.slice(-10).map((m) => ({
        role: m.username === 'IA' ? 'assistant' : 'user',
        content: m.username === 'IA' ? m.message : `${m.username || 'Anónimo'}: ${m.message}`
      }))
    ]

    const headers = { 'Content-Type': 'application/json' }
    if (ai.apiKey) {
      headers.Authorization = `Bearer ${ai.apiKey}`
    }

    const res = await fetch(ai.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: ai.model, messages }),
      signal: AbortSignal.timeout(30000)
    })

    if (!res.ok) {
      throw new Error(`AI error ${res.status}: ${await res.text()}`)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  }
}

module.exports = AiService
