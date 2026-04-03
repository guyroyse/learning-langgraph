import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { GameTurnAnnotation } from './00-state.js'
import { roomAgent, trollAgent, axeAgent, swordAgent, router, arbiter } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 4: Combined (Conditional Fan-Out + Fan-In)
//
// START ──→ router ──┬──→ room_agent ────╮
//                    ├──→ troll_agent ───┤
//                    ├──→ axe_agent ─────┤
//                    ╰──→ sword_agent ───┴──→ arbiter ──→ END
// -----------------------------------------------------------------------------

// Define the routing function
function routeToEntitiesThenArbiter(state: typeof GameTurnAnnotation.State) {
  const destinations: string[] = []
  if (state.relevantEntities.includes('room')) destinations.push('room_agent')
  if (state.relevantEntities.includes('troll')) destinations.push('troll_agent')
  if (state.relevantEntities.includes('axe')) destinations.push('axe_agent')
  if (state.relevantEntities.includes('sword')) destinations.push('sword_agent')
  return destinations.length > 0 ? destinations : ['arbiter']
}

// Create the graph
const graph = new StateGraph(GameTurnAnnotation) as any

// Add the nodes
graph.addNode('router', router)
graph.addNode('room_agent', roomAgent)
graph.addNode('troll_agent', trollAgent)
graph.addNode('axe_agent', axeAgent)
graph.addNode('sword_agent', swordAgent)
graph.addNode('arbiter', arbiter)

// Add the edges
graph.addEdge(START, 'router')
graph.addConditionalEdges('router', routeToEntitiesThenArbiter)
graph.addEdge('room_agent', 'arbiter')
graph.addEdge('troll_agent', 'arbiter')
graph.addEdge('axe_agent', 'arbiter')
graph.addEdge('sword_agent', 'arbiter')
graph.addEdge('arbiter', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runCombined(playerAction: string) {
  console.log(chalk.cyan('Player action:'), playerAction)
  console.log(chalk.gray('Pattern: Combined (router → [selected agents] → arbiter → END)'))
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
  console.log()
  console.log(chalk.green('Final narrative:'), result.finalNarrative)
}
