import { HumanMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { randomZorkAgent } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 3: Single Node with Redis
//
// START ──→ random_agent ──→ END
// -----------------------------------------------------------------------------

// Create the graph
const graph = new StateGraph(MessagesAnnotation) as any

// Add the nodes
graph.addNode('random_agent', randomZorkAgent)

// Add the edges
graph.addEdge(START, 'random_agent')
graph.addEdge('random_agent', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runSingleNodeRedis() {
  console.log(chalk.gray('Pattern: Single Node with Redis (START → random_agent → END)'))
  console.log()

  // Create the input state
  const humanMessage = new HumanMessage('What is Zork?')
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
