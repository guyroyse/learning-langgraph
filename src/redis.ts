import { createClient } from 'redis'

let redis: ReturnType<typeof createClient> | null = null

export async function fetchRedisClient() {
  if (!redis) redis = await createClient().connect()
  return redis
}

export async function clearRedisClient() {
  if (redis) await redis.quit()
  redis = null
}
