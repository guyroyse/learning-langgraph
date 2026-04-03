import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a small, blood-stained room with passages to the east, south, and a
  forbidding hole to the west. Bloodstains and deep scratches mar your walls.

  Respond from the room's perspective about how the player's action affects
  or interacts with your environment. Keep your response to 1-2 sentences.`

export async function roomAgent(state: typeof GameTurnAnnotation.State) {
  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Player action: ${state.playerAction}`)
  ])

  return {
    entityResponses: [{ entity: 'room', response: response.content as string }]
  }
}
