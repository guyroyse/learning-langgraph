import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { GameTurnAnnotation } from '../00-state.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are the arbiter for a text adventure game. Multiple game entities
  have responded to a player's action. Your job is to synthesize their
  perspectives into a cohesive narrative response, resolving any conflicts.
  Write in second person, present tense, and be evocative.
  Keep your response to 2-4 sentences.`

export async function arbiter(state: typeof GameTurnAnnotation.State) {
  const entitySummary = state.entityResponses
    .map(entityResponse => `${entityResponse.entity}: ${entityResponse.response}`)
    .join('\n')

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(dedent`
      Player action:
      ${state.playerAction}

      Entity responses:
      ${entitySummary}`)
  ])

  return { finalNarrative: response.content as string }
}
