import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { zorkRouter, zorkAgent, zorkRejector } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 2: Structured Output for Routing
//
// START ──→ zork_router ──┬──→ zork_agent ──→ END
//                         ╰──→ zork_rejector ──→ END
// -----------------------------------------------------------------------------

// Define the routing function
function routeByTopic(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage
  const content = JSON.parse(lastMessage.content as string)

  return content.topic === 'zork' ? 'zork_agent' : 'zork_rejector'
}

// Create the graph
const graph = new StateGraph(MessagesAnnotation) as any

// Add the nodes
graph.addNode('zork_router', zorkRouter)
graph.addNode('zork_agent', zorkAgent)
graph.addNode('zork_rejector', zorkRejector)

// Add the edges
graph.addEdge(START, 'zork_router')
graph.addConditionalEdges('zork_router', routeByTopic, ['zork_agent', 'zork_rejector'])
graph.addEdge('zork_agent', END)
graph.addEdge('zork_rejector', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runRouteByTopic(question: string) {
  console.log(chalk.gray('Pattern: Structured Output for Routing (router ──→ conditional)'))
  console.log()

  // Create the input state
  const humanMessage = new HumanMessage(question)
  const inputState = {
    messages: [humanMessage]
  } as typeof MessagesAnnotation.State

  // Invoke the workflow
  const finalState: typeof MessagesAnnotation.State = await workflow.invoke(inputState)

  // Log the output
  for (const message of finalState.messages) {
    const label = message.type === 'human' ? chalk.blue('human:') : chalk.green('ai:')
    console.log(label)
    console.log(message.content)
  }
}
