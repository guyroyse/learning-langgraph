import { AIMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'

export async function dumbZorkAgent(_state: typeof MessagesAnnotation.State) {
  const response = new AIMessage('I dunno. I am a dumb Zork agent.')
  return { messages: [response] }
}
