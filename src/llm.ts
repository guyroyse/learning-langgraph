import { ChatOpenAI } from '@langchain/openai'

import { OPENAI_API_KEY } from './config.js'

let llm: ChatOpenAI | null = null

export function fetchLLM() {
  if (!llm) {
    llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      apiKey: OPENAI_API_KEY
    })
  }

  return llm
}
