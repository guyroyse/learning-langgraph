import { StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'

import { GameTurnAnnotation } from './00-state.js'
import { roomAgent, trollAgent, axeAgent, swordAgent } from './agents/index.js'

// -----------------------------------------------------------------------------
// Pattern 1: Fan-Out / Fan-In
//
//         ╭──→ room_agent  ──╮
//         ├──→ troll_agent ──┤
// START ──┤                  ├──→ END
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

// Add the edges
graph.addEdge(START, 'room_agent')
graph.addEdge(START, 'troll_agent')
graph.addEdge(START, 'axe_agent')
graph.addEdge(START, 'sword_agent')

graph.addEdge('room_agent', END)
graph.addEdge('troll_agent', END)
graph.addEdge('axe_agent', END)
graph.addEdge('sword_agent', END)

// Compile the graph
const workflow = graph.compile()

// Run the workflow
export async function runFanOutFanIn(playerAction: string) {
  console.log(chalk.cyan('Player action:'), playerAction)
  console.log(chalk.gray('Pattern: Fan-Out / Fan-In (START → [all agents] → END)'))
  console.log()

  // Invoke the workflow
  const result = await workflow.invoke({ playerAction })

  // Log the output
  console.log(chalk.yellow('Entity responses:'))
  for (const { entity, response } of result.entityResponses) {
    console.log(chalk.magenta(`  ${entity}:`), response)
  }
}
