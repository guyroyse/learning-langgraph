import { HumanMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { zorkParser } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 1: Structured Output for Parsing
//
// START ──→ zork_parser ──→ END
// -----------------------------------------------------------------------------

// Create the graph
const graph = new StateGraph(MessagesAnnotation) as any

// Add the nodes
graph.addNode('zork_parser', zorkParser)

// Add the edges
graph.addEdge(START, 'zork_parser')
graph.addEdge('zork_parser', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runParseLocation(zorkLocationDescription: string) {
  console.log(chalk.gray('Pattern: Structured Output for Parsing (START ──→ zork_parser ──→ END)'))
  console.log()

  // Create the input state
  const humanMessage = new HumanMessage(zorkLocationDescription)
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
