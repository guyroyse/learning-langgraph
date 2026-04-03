import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a helpful assistant that answers questions about the classic
  text adventure game Zork. Answer the user's question.`

export async function zorkAgent(state: typeof MessagesAnnotation.State) {
  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const response: AIMessage = await llm.invoke([systemMessage, ...receivedMessages])

  return { messages: [response] }
}
