import { Annotation } from '@langchain/langgraph'

export type EntityResponse = {
  entity: string
  response: string
}

export const GameTurnAnnotation = Annotation.Root({
  playerAction: Annotation<string>,
  relevantEntities: Annotation<string[]>({
    default: () => [],
    reducer: (_, next) => next
  }),
  entityResponses: Annotation<EntityResponse[]>({
    default: () => [],
    reducer: (prev, next) => [...prev, ...next]
  }),
  finalNarrative: Annotation<string>
})
