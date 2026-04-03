import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { ZorkAnnotation } from './00-state.js'
import { zorkParser } from './agents/index.js'
import { fetchRedisClient } from '../redis.js'

// -----------------------------------------------------------------------------
// Pattern 1: Parse Location Description
//
// START ──→ zork_parser ──→ END
// -----------------------------------------------------------------------------

// Create the graph
const graph = new StateGraph(ZorkAnnotation) as any

// Add the nodes
graph.addNode('zork_parser', zorkParser)

// Add the edges
graph.addEdge(START, 'zork_parser')
graph.addEdge('zork_parser', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runParseLocation(zorkLocationDescription: string) {
  console.log(chalk.gray('Pattern: Parse Location (START ──→ zork_parser ──→ END)'))
  console.log()

  // Create the input state
  const inputState = {
    description: zorkLocationDescription
  } as typeof ZorkAnnotation.State

  // Invoke the workflow
  const finalState = await workflow.invoke(inputState)

  // Log the output
  console.log(chalk.cyan('Location:'), finalState.location)
  console.log(chalk.cyan('Objects:'), finalState.objects)
  console.log(chalk.cyan('Exits:'), finalState.exits)

  // Store the room data in Redis
  const redis = await fetchRedisClient()

  await redis.json.set(`zork:room:${finalState.location}`, '$', {
    location: finalState.location,
    objects: finalState.objects,
    exits: finalState.exits
  })
}
