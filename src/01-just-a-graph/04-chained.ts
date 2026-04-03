import { HumanMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { zorkAgent, zorkFactChecker } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 4: Chained
//
// START ──→ zork_agent ──→ fact_checker ──→ END
// -----------------------------------------------------------------------------

// Create the graph
const graph = new StateGraph(MessagesAnnotation) as any

// Add the nodes
graph.addNode('zork_agent', zorkAgent)
graph.addNode('fact_checker', zorkFactChecker)

// Add the edges
graph.addEdge(START, 'zork_agent')
graph.addEdge('zork_agent', 'fact_checker')
graph.addEdge('fact_checker', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runChained() {
  console.log(chalk.gray('Pattern: Chained (START → zork_agent → fact_checker → END)'))
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
