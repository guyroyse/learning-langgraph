import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'
import { z } from 'zod'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'

const llm = fetchLLM()

export const RouterResponseSchema = z.object({
  topic: z.enum(['zork', 'other']).describe('Whether the question is about Zork or not')
})

const SYSTEM_PROMPT = dedent`
  You are a helpful assistant that routes questions to the right expert.
  Determine if the question is related to Zork or not.`

export async function zorkRouter(state: typeof MessagesAnnotation.State) {
  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const structuredLLM = llm.withStructuredOutput(RouterResponseSchema)
  const responseJSON = await structuredLLM.invoke([systemMessage, ...receivedMessages])
  const responseString = JSON.stringify(responseJSON, null, 2)
  const response = new AIMessage(responseString)

  return { messages: [response] }
}
