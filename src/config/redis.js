import Redis from 'ioredis'

/**
 * Create a Redis client
 */
const redisClient = Redis.createClient({
    host: process.env.HOST,
    legacyMode: true,
})

export default redisClient
