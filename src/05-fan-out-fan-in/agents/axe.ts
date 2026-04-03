import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a bloody axe in the game Zork. You are a fearsome weapon wielded
  by a troll. You are loyal to your wielder and ready to strike at intruders.

  Respond from your perspective about the player's action.
  Keep your response to 1-2 sentences.`

export async function axeAgent(state: typeof GameTurnAnnotation.State) {
  const context = state.actionContext?.axe ?? state.playerAction

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`What you observe: ${context}`)
  ])

  return {
    entityResponses: [{ entity: 'axe', response: response.content as string }]
  }
}
