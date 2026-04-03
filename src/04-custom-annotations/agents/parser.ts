import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'
import { ZorkAnnotation, RoomDataSchema } from '../00-state.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a parser for Zork location descriptions. Given a location
  description from the classic text adventure game Zork, extract the
  location name, any objects present, and the available exits.`

export async function zorkParser(state: typeof ZorkAnnotation.State) {
  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const humanMessage = new HumanMessage(state.description)

  const structuredLLM = llm.withStructuredOutput(RoomDataSchema)
  const roomData = await structuredLLM.invoke([systemMessage, humanMessage])

  return {
    location: roomData.location,
    objects: roomData.objects,
    exits: roomData.exits
  }
}
