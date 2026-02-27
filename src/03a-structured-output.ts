import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import { z } from 'zod'
import chalk from 'chalk'
import dedent from 'dedent'

import { fetchLLM } from './llm.js'

const llm = fetchLLM()

const LocationDescriptionSchema = z.object({
  location: z.string().describe('The name of the current location'),
  objects: z.array(z.string()).describe('Objects in the current location (e.g., window, tree, house)'),
  exits: z.array(z.string()).describe('Available exits (e.g., north, up, window)')
})

async function zorkParser(state: typeof MessagesAnnotation.State) {
  const SYSTEM_PROMPT = dedent`
    You are a parser for Zork location descriptions. Given a location
    description from the classic text adventure game Zork, extract the
    location name, any objects present, and the available exits.`

  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const structuredLLM = llm.withStructuredOutput(LocationDescriptionSchema)
  const responseJSON = await structuredLLM.invoke([systemMessage, ...receivedMessages])
  const responseString = JSON.stringify(responseJSON, null, 2)

  return { messages: [new AIMessage(responseString)] }
}

const graph = new StateGraph(MessagesAnnotation) as any

graph.addNode('zork_parser', zorkParser)
graph.addEdge(START, 'zork_parser')
graph.addEdge('zork_parser', END)

const workflow = graph.compile()

export async function run(zorkLocationDescription: string) {
  const humanMessage = new HumanMessage(zorkLocationDescription)
  const inputState = {
    messages: [humanMessage]
  } as typeof MessagesAnnotation.State

  const finalState: typeof MessagesAnnotation.State = await workflow.invoke(inputState)

  for (const message of finalState.messages) {
    const label = message.type === 'human' ? chalk.blue('human:') : chalk.green('ai:')
    console.log(label)
    console.log(message.content)
  }
}
