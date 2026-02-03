import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import dedent from 'dedent'

import { fetchLLM } from './llm.js'
import { fetchRedisClient, clearRedisClient } from './redis.js'

const llm = fetchLLM()
const redis = await fetchRedisClient()

async function zorkRouter(state: typeof MessagesAnnotation.State) {
  const SYSTEM_PROMPT = dedent`
    You are a helpful assistant that routes questions to the right expert. You
    will be provided with a question and you should decide if it is related
    to Zork. If it is related to Zork, you should respond with "zork". If it
    is not related to Zork, you should respond with "other".`

  const systemMessage = new SystemMessage(SYSTEM_PROMPT)
  const receivedMessages: BaseMessage[] = state.messages

  const response: AIMessage = await llm.invoke([systemMessage, ...receivedMessages])

  return { messages: [response] }
}

function zorkRejector(_state: typeof MessagesAnnotation.State) {
  const response = new AIMessage("I'm sorry, I can only answer questions about Zork.")
  return { messages: [response] }
}

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

function routeByTopic(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage
  const content = lastMessage.content as string

  return content === 'zork' ? 'zork_agent' : 'zork_rejector'
}

// @ts-ignore
function routeRandomly(_state: typeof MessagesAnnotation.State) {
  return Math.random() < 0.5 ? 'zork_agent' : 'zork_rejector'
}

// @ts-ignore
async function routeByConfig(_state: typeof MessagesAnnotation.State) {
  const topic = await redis.get('zork:topic')
  return topic === 'zork' ? 'zork_agent' : 'zork_rejector'
}

const graph = new StateGraph(MessagesAnnotation) as any

graph.addNode('zork_router', zorkRouter)
graph.addNode('zork_rejector', zorkRejector)
graph.addNode('zork_agent', zorkAgent)
graph.addNode('zork_fact_checker', zorkFactChecker)

graph.addEdge(START, 'zork_router')
graph.addConditionalEdges('zork_router', routeByTopic, ['zork_agent', 'zork_rejector'])
graph.addEdge('zork_agent', 'zork_fact_checker')
graph.addEdge('zork_fact_checker', END)
graph.addEdge('zork_rejector', END)

const workflow = graph.compile()

export async function run(question: string) {
  const humanMessage = new HumanMessage(question)
  const inputState = {
    messages: [humanMessage]
  } as typeof MessagesAnnotation.State

  const finalState: typeof MessagesAnnotation.State = await workflow.invoke(inputState)

  for (const message of finalState.messages) {
    console.log(`${message.type}: ${message.content}`)
  }

  await clearRedisClient()
}
