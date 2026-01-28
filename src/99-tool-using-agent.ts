import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { MessagesAnnotation, StateGraph, START, END } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { z } from 'zod'
import dedent from 'dedent'

import { fetchLLM } from './llm.js'

const additionTool = tool(args => args.numbers.reduce((a, b) => a + b), {
  name: 'AddArrayOfNumbers',
  description: 'Accepts an array of numbers and adds them together',
  schema: z.object({
    numbers: z.array(z.number()).describe('The numbers to add together')
  })
})

const subtractionTool = tool(args => args.a - args.b, {
  name: 'SubtractTwoNumbers',
  description: 'Subtracts the second number from the first',
  schema: z.object({
    a: z.number().describe('The number to subtract from'),
    b: z.number().describe('The number to subtract')
  })
})

const tools = [additionTool, subtractionTool]

export async function calculator(question: string): Promise<string> {
  // Create the graph that will run the agent
  const graph = new StateGraph(MessagesAnnotation) as any

  // Bind the tool to the LLM
  const llm = fetchLLM().bindTools(tools)

  // add the agent node that decides whether to use tools or respond
  graph.addNode('agent', async (state: typeof MessagesAnnotation.State) => {
    const SYSTEM_PROMPT = dedent`
      You are a helpful assistant that solves math word problems. You have
      access to tools to help you do this. Whenever possible, you should use
      the tools.`
    const systemMessage = new SystemMessage(SYSTEM_PROMPT)

    const response = await llm.invoke([systemMessage, ...state.messages])
    return { messages: [response] }
  })

  // Add the tools node that executes tool calls
  graph.addNode('tools', new ToolNode(tools))

  graph.addEdge(START, 'agent')

  graph.addConditionalEdges(
    'agent',
    (state: typeof MessagesAnnotation.State) => {
      const lastMessage = state.messages[state.messages.length - 1] as AIMessage
      const areThereTools = lastMessage.tool_calls !== undefined && lastMessage.tool_calls.length > 0
      return areThereTools ? 'tools' : END
    },
    ['tools', END]
  )

  graph.addEdge('tools', 'agent')

  graph.addEdge('agent', END)

  // Compile the graph
  const workflow = graph.compile()

  // Run the workflow
  const humanMessage = new HumanMessage(question)
  const inputMessages = {
    messages: [humanMessage]
  } as typeof MessagesAnnotation.State

  const outputMessages = await workflow.invoke(inputMessages)

  // Return the answer which is the last message
  const lastMessage = outputMessages.messages[outputMessages.messages.length - 1]
  return lastMessage.content as string
}
