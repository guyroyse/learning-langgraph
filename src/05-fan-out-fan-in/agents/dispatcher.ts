import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const ActionContextSchema = z.object({
  room: z.string().describe('What the room observes happening within it'),
  troll: z.string().describe('What is happening to or around the troll'),
  axe: z.string().describe('What is happening to or around the axe'),
  sword: z.string().describe('What is happening to or around the sword')
})

const SYSTEM_PROMPT = dedent`
  You are a dispatcher for a Zork text adventure game. Given a player's action,
  describe what each entity observes happening, without revealing the player's
  intent or strategy.

  For example, if the player "attacks the troll with the sword":
  - The troll sees: "A blade is swinging toward you"
  - The sword feels: "You are being swung at something"
  - The room observes: "Combat is occurring within your walls"
  - The axe sees: "Your wielder is under attack"

  Keep each description to 1 brief sentence.`

export async function dispatcher(state: typeof GameTurnAnnotation.State) {
  const structuredLLM = llm.withStructuredOutput(ActionContextSchema)
  const response = await structuredLLM.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Player action: ${state.playerAction}`)
  ])

  return {
    relevantEntities: ['room', 'troll', 'axe', 'sword'],
    actionContext: response
  }
}
