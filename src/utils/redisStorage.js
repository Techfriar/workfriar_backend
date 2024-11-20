import redisClient from '../config/redis.js'

//Redis connection errors
redisClient.on('error', (error) => {
    console.error('Redis connection error:', error)
})

/**
 * Store OTP in Redis
 * @param {string} key - The key to store in Redis
 * @param {string} value - The value associated with the key
 * @returns {boolean} - true/false
 */
const storeData = async (key, value) => {
    try {
        await redisClient.set(key, value, 'EX', 60)
        return true
    } catch (error) {
        console.error('error:', error)
        return false
    }
}

/**
 * Retrieve OTP from Redis based on email
 * @param {string} key  The key to stored in Redis
 * @returns {Promise<string|null>} - The retrieved OTP or null if not found
 */
const getData = async (key) => {
    try {
        const otp = await redisClient.get(key)
        return otp
    } catch (error) {
        console.error('error:', error)
        return false
    }
}

/**
 * Remove OTP in Redis
 * @param {string} key - The email to stored in Redis
 * @returns {boolean} - true/false
 *
 */
const deleteData = async (key) => {
    try {
        await redisClient.del(key)
        return true
    } catch (error) {
        return false
    }
}

/**
 * Store user details in Redis with the phone number as the key
 * @param {string} key - The phone number to stored in Redis
 * @param {array} userDetails - The user details to stored in Redis
 * @returns {boolean} - true/false
 *
 */
const storeUserDetails = async (key, userDetails) => {
    try {
        // Store user details in Redis with the phone number as the key
        await redisClient.set(key, JSON.stringify(userDetails))
        return true
    } catch (error) {
        return false
    }
}

/**
 * Get user details in Redis with the phone number as the key
 * @param {string} key - The phone number to stored in Redis
 * @returns {array | null} userDetails - The user details to stored in Redis
 *
 */
const retrieveUserDetails = async (key) => {
    try {
        // Retrieve user details from Redis using the phone number as the key
        const storedUserDetails = await redisClient.get(key)
        if (storedUserDetails) {
            return JSON.parse(storedUserDetails);
        } else {
            return null
        }
    } catch (error) {
        console.error('Error retrieving user details:', error)
        return null
    }
}

export { storeData, getData, deleteData, storeUserDetails, retrieveUserDetails }
