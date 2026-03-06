import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { Annotation, StateGraph, START, END } from '@langchain/langgraph'
import { z } from 'zod'
import chalk from 'chalk'
import dedent from 'dedent'

import { fetchLLM } from './llm.js'
import { fetchRedisClient, clearRedisClient } from './redis.js'

const llm = fetchLLM()

const RoomDataSchema = z.object({
  location: z.string().describe('The name of the current location'),
  objects: z.array(z.string()).describe('Objects in the current location (e.g., brass lantern, elvish sword, leaflet)'),
  exits: z.array(z.string()).describe('Available exits (e.g., north, south, east, west, up, down)')
})

// Explicit version - shows what's happening behind the scenes
const ExplicitZorkAnnotation = Annotation.Root({
  description: Annotation<string>({
    default: () => '',
    reducer: (_prev, next) => next
  }),
  location: Annotation<string>({
    default: () => '',
    reducer: (_prev, next) => next
  }),
  objects: Annotation<string[]>({
    default: () => [],
    reducer: (prev, next) => [...prev, ...next]
  }),
  exits: Annotation<string[]>({
    default: () => [],
    reducer: (prev, next) => [...prev, ...next]
  })
})

// Shortcut version - simple and clean
const ZorkAnnotation = Annotation.Root({
  description: Annotation<string>,
  location: Annotation<string>,
  objects: Annotation<string[]>,
  exits: Annotation<string[]>
})

async function zorkParser(state: typeof ZorkAnnotation.State) {
  const SYSTEM_PROMPT = dedent`
    You are a parser for Zork location descriptions. Given a location
    description from the classic text adventure game Zork, extract the
    location name, any objects present, and the available exits.`

  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const humanMessage = new HumanMessage(state.description)

  const structuredLLM = llm.withStructuredOutput(RoomDataSchema)
  const roomData = await structuredLLM.invoke([systemMessage, humanMessage])

  return {
    location: roomData.location,
    objects: roomData.objects,
    exits: roomData.exits
  }
}

const graph = new StateGraph(ZorkAnnotation) as any

graph.addNode('zork_parser', zorkParser)
graph.addEdge(START, 'zork_parser')
graph.addEdge('zork_parser', END)

const workflow = graph.compile()

export async function run(zorkLocationDescription: string) {
  const redis = await fetchRedisClient()

  const inputState = {
    description: zorkLocationDescription
  } as typeof ZorkAnnotation.State

  const finalState = await workflow.invoke(inputState)

  console.log(chalk.cyan('Location:'), finalState.location)
  console.log(chalk.cyan('Objects:'), finalState.objects)
  console.log(chalk.cyan('Exits:'), finalState.exits)

  await redis.json.set(`zork:room:${finalState.location}`, '$', {
    location: finalState.location,
    objects: finalState.objects,
    exits: finalState.exits
  })

  await clearRedisClient()
}
