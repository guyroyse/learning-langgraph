import { Annotation } from '@langchain/langgraph'
import { z } from 'zod'

// Schema for structured LLM output
export const RoomDataSchema = z.object({
  location: z.string().describe('The name of the current location'),
  objects: z.array(z.string()).describe('Objects in the current location (e.g., brass lantern, elvish sword, leaflet)'),
  exits: z.array(z.string()).describe('Available exits (e.g., north, south, east, west, up, down)')
})

// Explicit version - shows what's happening behind the scenes
export const ExplicitZorkAnnotation = Annotation.Root({
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
export const ZorkAnnotation = Annotation.Root({
  description: Annotation<string>,
  location: Annotation<string>,
  objects: Annotation<string[]>,
  exits: Annotation<string[]>
})
