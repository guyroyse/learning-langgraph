import { AIMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'

export function zorkRejector(_state: typeof MessagesAnnotation.State) {
  const response = new AIMessage("I'm sorry, I can only answer questions about Zork.")
  return { messages: [response] }
}
