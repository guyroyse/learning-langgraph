import { AIMessage } from '@langchain/core/messages'
import { MessagesAnnotation } from '@langchain/langgraph'

import { fetchRedisClient } from '../../redis.js'

const redis = await fetchRedisClient()

export async function randomZorkAgent(_state: typeof MessagesAnnotation.State) {
  const randomZorkFact = await redis.sRandMember('zork:facts')
  const response = new AIMessage(randomZorkFact ?? 'Zork is a great game!')

  return { messages: [response] }
}
