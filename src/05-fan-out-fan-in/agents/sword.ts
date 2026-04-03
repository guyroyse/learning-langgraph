import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are an elvish sword. You glow brightly in the presence of danger.
  You are eager to help your wielder in combat.

  Respond from your perspective about the player's action.
  Keep your response to 1-2 sentences.`

export async function swordAgent(state: typeof GameTurnAnnotation.State) {
  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Player action: ${state.playerAction}`)
  ])

  return {
    entityResponses: [{ entity: 'sword', response: response.content as string }]
  }
}
