import chalk from 'chalk'
import dedent from 'dedent'

import { run as runJustAGraph } from './01-just-a-graph.js'
import { run as runConditionalEdges } from './02-conditional-edges.js'
import { run as runStructuredOutput } from './03a-structured-output.js'
import { run as runStructuredRouting } from './03b-structured-routing.js'

console.log('')
console.log(chalk.bold.yellow('Running just a graph'))
await runJustAGraph()

console.log('')
console.log(chalk.bold.yellow('Running conditional edges with a question about Zork'))
await runConditionalEdges('What is Zork?')

console.log('')
console.log(chalk.bold.yellow('Running conditional edges with a question about France'))
await runConditionalEdges('What is the capital of France?')

console.log('')
console.log(chalk.bold.yellow('Running structured output'))
await runStructuredOutput(dedent`
  Kitchen
  You are in the kitchen of the white house. A table seems to have been used recently for the preparation of
  food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney leads
  down and to the east is a small window which is open.
  A bottle is sitting on the table.
  The glass bottle contains:
    A quantity of water
  On the table is an elongated brown sack, smelling of hot peppers.`)

console.log('')
console.log(chalk.bold.yellow('Running structured routing with a Zork question'))
await runStructuredRouting('What is Zork?')

console.log('')
console.log(chalk.bold.yellow('Running structured routing with a non-Zork question'))
await runStructuredRouting('What is the capital of France?')

console.log('')
