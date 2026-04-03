import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { GameTurnAnnotation } from './00-state.js'
import { roomAgent, trollAgent, axeAgent, swordAgent, dispatcher, arbiter } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 3: Fan-In
//
// START ──→ dispatcher ──┬──→ room_agent  ──╮
//                        ├──→ troll_agent ──┤
//                        ├──→ axe_agent   ──┤
//                        ╰──→ sword_agent ──┴──→ arbiter ──→ END
// -----------------------------------------------------------------------------

// Create the graph
const graph = new StateGraph(GameTurnAnnotation) as any

// Add the nodes
graph.addNode('dispatcher', dispatcher)
graph.addNode('room_agent', roomAgent)
graph.addNode('troll_agent', trollAgent)
graph.addNode('axe_agent', axeAgent)
graph.addNode('sword_agent', swordAgent)
graph.addNode('arbiter', arbiter)

// Add the edges
graph.addEdge(START, 'dispatcher')

// Fan out from dispatcher to all agents
graph.addEdge('dispatcher', 'room_agent')
graph.addEdge('dispatcher', 'troll_agent')
graph.addEdge('dispatcher', 'axe_agent')
graph.addEdge('dispatcher', 'sword_agent')

// Fan in: all agents converge on arbiter
graph.addEdge('room_agent', 'arbiter')
graph.addEdge('troll_agent', 'arbiter')
graph.addEdge('axe_agent', 'arbiter')
graph.addEdge('sword_agent', 'arbiter')

graph.addEdge('arbiter', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runFanIn(playerAction: string) {
  console.log(chalk.cyan('Player action:'), playerAction)
  console.log(chalk.gray('Pattern: Fan-In (dispatcher → [all agents] → arbiter → END)'))
  console.log()

  // Invoke the workflow
  const result = await workflow.invoke({ playerAction })

  // Log the output
  console.log(chalk.yellow('Entity responses:'))
  for (const { entity, response } of result.entityResponses) {
    console.log(chalk.magenta(`  ${entity}:`), response)
  }
  console.log()
  console.log(chalk.green('Final narrative:'), result.finalNarrative)
}
