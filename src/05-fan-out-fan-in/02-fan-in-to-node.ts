import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { GameTurnAnnotation } from './00-state.js'
import { roomAgent, trollAgent, axeAgent, swordAgent, arbiter } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 2: Fan-In to a Node
//
//         ╭──→ room_agent  ──╮
//         ├──→ troll_agent ──┤
// START ──┤                  ├──→ arbiter ──→ END
//         ├──→ axe_agent   ──┤
//         ╰──→ sword_agent ──╯
// -----------------------------------------------------------------------------

// Create the graph
const graph = new StateGraph(GameTurnAnnotation) as any

// Add the nodes
graph.addNode('room_agent', roomAgent)
graph.addNode('troll_agent', trollAgent)
graph.addNode('axe_agent', axeAgent)
graph.addNode('sword_agent', swordAgent)
graph.addNode('arbiter', arbiter)

// Add the edges
graph.addEdge(START, 'room_agent')
graph.addEdge(START, 'troll_agent')
graph.addEdge(START, 'axe_agent')
graph.addEdge(START, 'sword_agent')

graph.addEdge('room_agent', 'arbiter')
graph.addEdge('troll_agent', 'arbiter')
graph.addEdge('axe_agent', 'arbiter')
graph.addEdge('sword_agent', 'arbiter')

graph.addEdge('arbiter', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runFanInToNode(playerAction: string) {
  console.log(chalk.cyan('Player action:'), playerAction)
  console.log(chalk.gray('Pattern: Fan-In to Node (START → [all agents] → arbiter → END)'))
  console.log()

  // Invoke the workflow
  const result = await workflow.invoke({ playerAction })

  // Log the entity responses
  console.log(chalk.yellow('Entity responses:'))
  for (const { entity, response } of result.entityResponses) {
    console.log(chalk.magenta(`  ${entity}:`), response)
  }
  console.log()

  // Log the final narrative
  console.log(chalk.green('Final narrative:'), result.finalNarrative)
}
