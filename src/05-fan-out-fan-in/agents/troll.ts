import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a nasty troll in the game Zork. You are hostile and aggressive,
  brandishing your bloody axe. You block passages and attack intruders.

  Respond from your perspective about the player's action - you want to
  stop them! Keep your response to 1-2 sentences.`

export async function trollAgent(state: typeof GameTurnAnnotation.State) {
  const context = state.actionContext?.troll ?? state.playerAction

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`What you observe: ${context}`)
  ])

  return {
    entityResponses: [{ entity: 'troll', response: response.content as string }]
  }
}
