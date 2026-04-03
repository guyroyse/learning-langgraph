import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { GameTurnAnnotation } from './00-state.js'
import { roomAgent, trollAgent, axeAgent, swordAgent, dispatcher } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 1: Fan-Out
//
// START ──→ dispatcher ──┬──→ room_agent  ──→ END
//                        ├──→ troll_agent ──→ END
//                        ├──→ axe_agent   ──→ END
//                        ╰──→ sword_agent ──→ END
// -----------------------------------------------------------------------------

// Create the graph
const graph = new StateGraph(GameTurnAnnotation) as any

// Add the nodes
graph.addNode('dispatcher', dispatcher)
graph.addNode('room_agent', roomAgent)
graph.addNode('troll_agent', trollAgent)
graph.addNode('axe_agent', axeAgent)
graph.addNode('sword_agent', swordAgent)

// Add the edges
graph.addEdge(START, 'dispatcher')

// Fan out from dispatcher to all agents
graph.addEdge('dispatcher', 'room_agent')
graph.addEdge('dispatcher', 'troll_agent')
graph.addEdge('dispatcher', 'axe_agent')
graph.addEdge('dispatcher', 'sword_agent')

// All agents go to END
graph.addEdge('room_agent', END)
graph.addEdge('troll_agent', END)
graph.addEdge('axe_agent', END)
graph.addEdge('sword_agent', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runFanOut(playerAction: string) {
  console.log(chalk.cyan('Player action:'), playerAction)
  console.log(chalk.gray('Pattern: Fan-Out (dispatcher → [all agents] → END)'))
  console.log()

  // Invoke the workflow
  const result = await workflow.invoke({ playerAction })

  // Log the output
  console.log(chalk.yellow('Entity responses:'))
  for (const { entity, response } of result.entityResponses) {
    console.log(chalk.magenta(`  ${entity}:`), response)
  }
}
