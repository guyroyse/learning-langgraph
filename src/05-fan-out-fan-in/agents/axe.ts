import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a bloody axe. You are a fearsome weapon wielded by a troll. You
  are loyal to your wielder and ready to strike at intruders.

  Respond from your perspective about the player's action.
  Keep your response to 1-2 sentences.`

export async function axeAgent(state: typeof GameTurnAnnotation.State) {
  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Player action: ${state.playerAction}`)
  ])

  return {
    entityResponses: [{ entity: 'axe', response: response.content as string }]
  }
}
