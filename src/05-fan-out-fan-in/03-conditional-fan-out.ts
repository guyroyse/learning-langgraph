import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { GameTurnAnnotation } from './00-state.js'
import { roomAgent, trollAgent, axeAgent, swordAgent, router, arbiter } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 3: Conditional Fan-Out
//
//                    ╭──→ room_agent  ──╮
//                    ├──→ troll_agent ──┤
// START ──→ router ──┤                  ├──→ arbiter ──→ END
//                    ├──→ axe_agent   ──┤
//                    ╰──→ sword_agent ──╯
// -----------------------------------------------------------------------------

// Define the routing function
function routeToEntities(state: typeof GameTurnAnnotation.State) {
  return state.relevantEntities.length > 0 ? state.relevantEntities : END
}

// Map routing function return values to node names
const entityToNode: Record<string, string> = {
  room: 'room_agent',
  troll: 'troll_agent',
  axe: 'axe_agent',
  sword: 'sword_agent'
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
graph.addConditionalEdges('router', routeToEntities, entityToNode)
graph.addEdge('room_agent', 'arbiter')
graph.addEdge('troll_agent', 'arbiter')
graph.addEdge('axe_agent', 'arbiter')
graph.addEdge('sword_agent', 'arbiter')
graph.addEdge('arbiter', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runConditionalFanOut(playerAction: string) {
  console.log(chalk.cyan('Player action:'), playerAction)
  console.log(chalk.gray('Pattern: Conditional Fan-Out (router → [selected agents] → arbiter → END)'))
  console.log()

  // Invoke the workflow
  const result = await workflow.invoke({ playerAction })

  // Log the output
  console.log(chalk.yellow('Entity responses:'))
  for (const { entity, response } of result.entityResponses) {
    console.log(chalk.magenta(`  ${entity}:`), response)
  }
  console.log()

  // Log the final narrative
  console.log(chalk.green('Final narrative:'), result.finalNarrative)
}
