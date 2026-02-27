import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import chalk from 'chalk'
import dedent from 'dedent'

import { fetchLLM } from './llm.js'
import { fetchRedisClient, clearRedisClient } from './redis.js'

const llm = fetchLLM()
const redis = await fetchRedisClient()

async function zorkAgent(state: typeof MessagesAnnotation.State) {
  const SYSTEM_PROMPT = dedent`
    You are a helpful assistant that answers questions about the classic
    text adventure game Zork. You will be provided with a question and you
    should answer it. You should only answer questions related to Zork. If
    a question is not related to Zork, you should respond with "I'm sorry,
    I can only answer questions about Zork."`

  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const response: AIMessage = await llm.invoke([systemMessage, ...receivedMessages])

  return { messages: [response] }
}

// @ts-ignore
async function dumbZorkAgent(_state: typeof MessagesAnnotation.State) {
  const response = new AIMessage('I dunno. I am a dumb Zork agent.')

  return { messages: [response] }
}

// @ts-ignore
async function randomZorkAgent(_state: typeof MessagesAnnotation.State) {
  const randomZorkFact = await redis.sRandMember('zork:facts')
  const response = new AIMessage(randomZorkFact ?? 'Zork is a great game!')
  return { messages: [response] }
}

async function zorkFactChecker(state: typeof MessagesAnnotation.State) {
  const SYSTEM_PROMPT = dedent`
    You are a helpful editor that edits the work of a Zork assistant. Zork
    assistants are helpful assistants that answer questions about the classic
    text adventure game Zork. Zork assistants are not the best writers and often
    make up facts. You will be provided with a question and the assistant's
    response. You should read the assistant's response and edit it to make it
    correct. If the assistant's response is already correct, you should just
    return it. DO NOT generate new responses.`

  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const response: AIMessage = await llm.invoke([systemMessage, ...receivedMessages])

  return { messages: [response] }
}

const graph = new StateGraph(MessagesAnnotation) as any

graph.addNode('zork_agent', zorkAgent)
// graph.addNode('zork_agent', dumbZorkAgent)
// graph.addNode('zork_agent', randomZorkAgent)
graph.addNode('zork_fact_checker', zorkFactChecker)

graph.addEdge(START, 'zork_agent')
graph.addEdge('zork_agent', 'zork_fact_checker')
graph.addEdge('zork_fact_checker', END)

const workflow = graph.compile()

export async function run() {
  const humanMessage = new HumanMessage('What is Zork?')
  const inputState = {
    messages: [humanMessage]
  } as typeof MessagesAnnotation.State

  const finalState: typeof MessagesAnnotation.State = await workflow.invoke(inputState)

  for (const message of finalState.messages) {
    const label = message.type === 'human' ? chalk.blue('human:') : chalk.green('ai:')
    console.log(label)
    console.log(message.content)
  }

  await clearRedisClient()
}
