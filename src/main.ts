import chalk from 'chalk'
import dedent from 'dedent'

import { runSingleNodeLLM, runSingleNodeHardcoded, runSingleNodeRedis, runChained } from './01-just-a-graph/index.js'
import { runRouteByTopic, runRouteRandomly, runRouteByConfig } from './02-conditional-edges/index.js'
import {
  runParseLocation as runStructuredParseLocation,
  runRouteByTopic as runStructuredRouteByTopic
} from './03-structured-output/index.js'
import { runParseLocation } from './04-custom-annotations/index.js'
import { clearRedisClient } from './redis.js'

// -----------------------------------------------------------------------------
// Part 1: Just a Graph
// -----------------------------------------------------------------------------

console.log('')
console.log(chalk.bold.yellow('Running Single Node with LLM'))
await runSingleNodeLLM()

console.log('')
console.log(chalk.bold.yellow('Running Single Node with Hardcoded Response'))
await runSingleNodeHardcoded()

console.log('')
console.log(chalk.bold.yellow('Running Single Node with Redis'))
await runSingleNodeRedis()

console.log('')
console.log(chalk.bold.yellow('Running Chained (Zork Agent → Fact Checker)'))
await runChained()

// -----------------------------------------------------------------------------
// Part 2: Conditional Edges
// -----------------------------------------------------------------------------

console.log('')
console.log(chalk.bold.yellow('Running Route by Topic with a Zork question'))
await runRouteByTopic('What is Zork?')

console.log('')
console.log(chalk.bold.yellow('Running Route by Topic with a non-Zork question'))
await runRouteByTopic('What is the capital of France?')

console.log('')
console.log(chalk.bold.yellow('Running Route Randomly'))
await runRouteRandomly('What is Zork?')

console.log('')
console.log(chalk.bold.yellow('Running Route by Config'))
await runRouteByConfig('What is Zork?')

// -----------------------------------------------------------------------------
// Part 3: Structured Output
// -----------------------------------------------------------------------------

console.log('')
console.log(chalk.bold.yellow('Running Structured Output for Parsing'))
await runStructuredParseLocation(dedent`
  Kitchen
  You are in the kitchen of the white house. A table seems to have been used recently for the preparation of
  food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney leads
  down and to the east is a small window which is open.
  A bottle is sitting on the table.
  The glass bottle contains:
    A quantity of water
  On the table is an elongated brown sack, smelling of hot peppers.`)

console.log('')
console.log(chalk.bold.yellow('Running Structured Output for Routing (Zork question)'))
await runStructuredRouteByTopic('What is Zork?')

console.log('')
console.log(chalk.bold.yellow('Running Structured Output for Routing (non-Zork question)'))
await runStructuredRouteByTopic('What is the capital of France?')

// -----------------------------------------------------------------------------
// Part 4: Custom Annotations
// -----------------------------------------------------------------------------

console.log('')
console.log(chalk.bold.yellow('Running Parse Location'))
await runParseLocation(dedent`
  Kitchen
  You are in the kitchen of the white house. A table seems to have been used recently for the preparation of
  food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney leads
  down and to the east is a small window which is open.
  A bottle is sitting on the table.
  The glass bottle contains:
    A quantity of water
  On the table is an elongated brown sack, smelling of hot peppers.`)

// -----------------------------------------------------------------------------
// Cleanup
// -----------------------------------------------------------------------------

await clearRedisClient()

console.log('')
