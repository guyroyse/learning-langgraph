import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'
import { z } from 'zod'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'

const llm = fetchLLM()

export const LocationDescriptionSchema = z.object({
  location: z.string().describe('The name of the current location'),
  objects: z.array(z.string()).describe('Objects in the current location (e.g., window, tree, house)'),
  exits: z.array(z.string()).describe('Available exits (e.g., north, up, window)')
})

const SYSTEM_PROMPT = dedent`
  You are a parser for Zork location descriptions. Given a location
  description from the classic text adventure game Zork, extract the
  location name, any objects present, and the available exits.`

export async function zorkParser(state: typeof MessagesAnnotation.State) {
  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const structuredLLM = llm.withStructuredOutput(LocationDescriptionSchema)
  const responseJSON = await structuredLLM.invoke([systemMessage, ...receivedMessages])
  const responseString = JSON.stringify(responseJSON, null, 2)

  return { messages: [new AIMessage(responseString)] }
}
