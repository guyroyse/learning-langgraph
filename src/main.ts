import { run as runJustAGraph } from './01-just-a-graph.js'
import { run as runConditionalEdges } from './02-conditional-edges.js'

console.log('Running just a graph...')
await runJustAGraph()

console.log('')
console.log('Running conditional edges with a question about Zork...')
await runConditionalEdges('What is Zork?')

console.log('')
console.log('Running conditional edges with a question about France...')
await runConditionalEdges('What is the capital of France?')
