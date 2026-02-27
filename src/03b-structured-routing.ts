import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import { z } from 'zod'
import chalk from 'chalk'
import dedent from 'dedent'

import { fetchLLM } from './llm.js'

const llm = fetchLLM()

const RouterResponseSchema = z.object({
  topic: z.enum(['zork', 'other']).describe('Whether the question is about Zork or not')
})

async function zorkRouter(state: typeof MessagesAnnotation.State) {
  const SYSTEM_PROMPT = dedent`
    You are a helpful assistant that routes questions to the right expert.
    Determine if the question is related to Zork or not.`

  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const structuredLLM = llm.withStructuredOutput(RouterResponseSchema)
  const responseJSON = await structuredLLM.invoke([systemMessage, ...receivedMessages])
  const responseString = JSON.stringify(responseJSON, null, 2)
  const response = new AIMessage(responseString)

  return { messages: [response] }
}

async function zorkAgent(state: typeof MessagesAnnotation.State) {
  const SYSTEM_PROMPT = dedent`
    You are a helpful assistant that answers questions about the classic
    text adventure game Zork. Answer the user's question.`

  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const response: AIMessage = await llm.invoke([systemMessage, ...receivedMessages])

  return { messages: [response] }
}

function zorkRejector(_state: typeof MessagesAnnotation.State) {
  const response = new AIMessage("I'm sorry, I can only answer questions about Zork.")
  return { messages: [response] }
}

function routeByTopic(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage
  const content = JSON.parse(lastMessage.content as string)

  return content.topic === 'zork' ? 'zork_agent' : 'zork_rejector'
}

const graph = new StateGraph(MessagesAnnotation) as any

graph.addNode('zork_router', zorkRouter)
graph.addNode('zork_agent', zorkAgent)
graph.addNode('zork_rejector', zorkRejector)

graph.addEdge(START, 'zork_router')
graph.addConditionalEdges('zork_router', routeByTopic, ['zork_agent', 'zork_rejector'])
graph.addEdge('zork_agent', END)
graph.addEdge('zork_rejector', END)

const workflow = graph.compile()

export async function run(question: string) {
  const humanMessage = new HumanMessage(question)
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
