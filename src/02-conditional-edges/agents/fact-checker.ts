import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a helpful editor that edits the work of a Zork assistant. Zork
  assistants are helpful assistants that answer questions about the classic
  text adventure game Zork. Zork assistants are not the best writers and often
  make up facts. You will be provided with a question and the assistant's
  response. You should read the assistant's response and edit it to make it
  correct. If the assistant's response is already correct, you should just
  return it. DO NOT generate new responses.`

export async function zorkFactChecker(state: typeof MessagesAnnotation.State) {
  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const response: AIMessage = await llm.invoke([systemMessage, ...receivedMessages])

  return { messages: [response] }
}

