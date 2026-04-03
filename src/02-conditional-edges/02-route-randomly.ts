import { HumanMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { zorkRejector, zorkAgent, zorkFactChecker } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 2: Route Randomly (coin flip decides the path)
//
// START ──→ route_randomly ──┬──→ zork_agent ──→ zork_fact_checker ──→ END
//                            ╰──→ zork_rejector ──→ END
// -----------------------------------------------------------------------------

// Define the routing function
function routeRandomly(_state: typeof MessagesAnnotation.State) {
  return Math.random() < 0.5 ? 'zork_agent' : 'zork_rejector'
}

// Create the graph
const graph = new StateGraph(MessagesAnnotation) as any

// Add the nodes
graph.addNode('route_randomly', (_state: typeof MessagesAnnotation.State) => ({}))
graph.addNode('zork_rejector', zorkRejector)
graph.addNode('zork_agent', zorkAgent)
graph.addNode('zork_fact_checker', zorkFactChecker)

// Add the edges
graph.addEdge(START, 'route_randomly')
graph.addConditionalEdges('route_randomly', routeRandomly, ['zork_agent', 'zork_rejector'])
graph.addEdge('zork_agent', 'zork_fact_checker')
graph.addEdge('zork_fact_checker', END)
graph.addEdge('zork_rejector', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runRouteRandomly(question: string) {
  console.log(chalk.gray('Pattern: Route Randomly (coin flip → conditional edge)'))
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
