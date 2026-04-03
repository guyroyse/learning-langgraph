import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { GameTurnAnnotation } from './00-state.js'
import { roomAgent, trollAgent, axeAgent, swordAgent, router } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 2: Conditional Fan-Out
//
// START ──→ router ──┬──→ room_agent  ──→ END
//                    ├──→ troll_agent ──→ END
//                    ├──→ axe_agent   ──→ END
//                    ╰──→ sword_agent ──→ END
// -----------------------------------------------------------------------------

// Define the routing function
function routeToEntities(state: typeof GameTurnAnnotation.State) {
  const destinations: string[] = []
  if (state.relevantEntities.includes('room')) destinations.push('room_agent')
  if (state.relevantEntities.includes('troll')) destinations.push('troll_agent')
  if (state.relevantEntities.includes('axe')) destinations.push('axe_agent')
  if (state.relevantEntities.includes('sword')) destinations.push('sword_agent')
  return destinations.length > 0 ? destinations : [END]
}

// Create the graph
const graph = new StateGraph(GameTurnAnnotation) as any

// Add the nodes
graph.addNode('router', router)
graph.addNode('room_agent', roomAgent)
graph.addNode('troll_agent', trollAgent)
graph.addNode('axe_agent', axeAgent)
graph.addNode('sword_agent', swordAgent)

// Add the edges
graph.addEdge(START, 'router')
graph.addConditionalEdges('router', routeToEntities)
graph.addEdge('room_agent', END)
graph.addEdge('troll_agent', END)
graph.addEdge('axe_agent', END)
graph.addEdge('sword_agent', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runConditionalFanOut(playerAction: string) {
  console.log(chalk.cyan('Player action:'), playerAction)
  console.log(chalk.gray('Pattern: Conditional Fan-Out (router → [selected agents] → END)'))
  console.log()

  // Invoke the workflow
  const result = await workflow.invoke({ playerAction })

  // Log the output
  console.log(chalk.blue('Router selected:'), result.relevantEntities.join(', '))
  console.log()
  console.log(chalk.yellow('Entity responses:'))
  for (const { entity, response } of result.entityResponses) {
    console.log(chalk.magenta(`  ${entity}:`), response)
  }
}
