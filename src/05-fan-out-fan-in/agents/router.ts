import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const RouterResponseSchema = z.object({
  entities: z
    .array(z.enum(['room', 'troll', 'axe', 'sword']))
    .describe('Which entities are relevant to the player action')
})

const SYSTEM_PROMPT = dedent`
  You are a router for a text adventure game. Given a player's action,
  determine which game entities are relevant and should respond.

  Available entities:
  - room: The environment
  - troll: A hostile troll blocking passages
  - axe: The troll's bloody axe
  - sword: The player's glowing elvish sword

  For combat actions, include the weapons and combatants.
  For examining something, only include that entity.
  For movement or looking, include the room.`

export async function router(state: typeof GameTurnAnnotation.State) {
  const structuredLLM = llm.withStructuredOutput(RouterResponseSchema)
  const response = await structuredLLM.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Player action: ${state.playerAction}`)
  ])

  return { relevantEntities: response.entities }
}
