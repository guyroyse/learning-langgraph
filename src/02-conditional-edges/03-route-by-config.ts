import { HumanMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { zorkRejector, zorkAgent, zorkFactChecker } from './agents/index.js'
import { fetchRedisClient } from '../redis.js'

// -----------------------------------------------------------------------------
// Pattern 3: Route by Config (Redis config decides the path)
//
// START ──→ route_by_config ──┬──→ zork_agent ──→ zork_fact_checker ──→ END
//                             ╰──→ zork_rejector ──→ END
// -----------------------------------------------------------------------------

// Define the routing function
async function routeByConfig(_state: typeof MessagesAnnotation.State) {
  const redis = await fetchRedisClient()
  const topic = await redis.get('zork:topic')
  return topic === 'zork' ? 'zork_agent' : 'zork_rejector'
}

// Create the graph
const graph = new StateGraph(MessagesAnnotation) as any

// Add the nodes
graph.addNode('route_by_config', (_state: typeof MessagesAnnotation.State) => ({}))
graph.addNode('zork_rejector', zorkRejector)
graph.addNode('zork_agent', zorkAgent)
graph.addNode('zork_fact_checker', zorkFactChecker)

// Add the edges
graph.addEdge(START, 'route_by_config')
graph.addConditionalEdges('route_by_config', routeByConfig, ['zork_agent', 'zork_rejector'])
graph.addEdge('zork_agent', 'zork_fact_checker')
graph.addEdge('zork_fact_checker', END)
graph.addEdge('zork_rejector', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runRouteByConfig(question: string) {
  console.log(chalk.gray('Pattern: Route by Config (Redis lookup → conditional edge)'))
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
