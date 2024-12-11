// import redisClient  from '../config/redis.js';


export async function blacklistToken(token, expiresIn) {
    await redisClient.setex(token, expiresIn, 'blacklisted'); // Set expiry based on token expiration
}

export async function isTokenBlacklisted(token) {
    const result = await redisClient.get(token);
    return result === 'blacklisted';
}
