import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'
import dedent from 'dedent'

import { fetchLLM } from '../../llm.js'

const llm = fetchLLM()

const SYSTEM_PROMPT = dedent`
  You are a helpful assistant that routes questions to the right expert. You
  will be provided with a question and you should decide if it is related
  to Zork. If it is related to Zork, you should respond with "zork". If it
  is not related to Zork, you should respond with "other".`

export async function zorkRouter(state: typeof MessagesAnnotation.State) {
  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const response: AIMessage = await llm.invoke([systemMessage, ...receivedMessages])

  return { messages: [response] }
}

