import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import dedent from 'dedent'

import { fetchLLM } from './llm.js'

export async function romanClassifier(document: string): Promise<[string, string]> {
  // Create the graph that will run the agent
  const graph = new StateGraph(MessagesAnnotation) as any

  // Add the node that is the summarizer
  graph.addNode('summarizer', async (state: typeof MessagesAnnotation.State) => {
    const llm = fetchLLM()

    const SYSTEM_PROMPT = dedent`
      You are a summarization AI. You will be provided with a text passage
      that contains historical information about ancient civilizations. Your
      job is to summarize the text passage.`
    const systemMessage = new SystemMessage(SYSTEM_PROMPT)

    const messages = [systemMessage, state.messages[0]]

    const response = await llm.invoke(messages)
    return { messages: [response] }
  })

  graph.addNode('classifier', async (state: typeof MessagesAnnotation.State) => {
    const llm = fetchLLM()

    const SYSTEM_PROMPT = dedent`
      You are a civilizational classifier AI. You will be provided with a text
      passage that is contains information about an ancient civilization. You
      need to determine if that civilization is Ancient Rome or not.`

    const systemMessage = new SystemMessage(SYSTEM_PROMPT)
    const messages = [systemMessage, state.messages[1]]

    const response = await llm.invoke(messages)
    return { messages: [response] }
  })

  // Wire up the graph
  graph.addEdge(START, 'summarizer')
  graph.addEdge('summarizer', 'classifier')
  graph.addEdge('classifier', END)

  // Compile the graph
  const workflow = graph.compile()

  // Run the workflow
  const humanMessage = new HumanMessage(document)
  const inputMessages = {
    messages: [humanMessage]
  } as typeof MessagesAnnotation.State

  const outputMessages = await workflow.invoke(inputMessages)

  // Return the classification which is the last message
  return [outputMessages.messages[1].content, outputMessages.messages[2].content]
}
