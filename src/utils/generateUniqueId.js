import crypto from 'crypto'

export default class GenerateUniqueId {
    // Function to generate a unique ID with a specified length
    static generate(length) {
        const randomBytes = crypto.randomBytes(Math.ceil(length / 2))
        const uniqueId = randomBytes.toString('hex').slice(0, length)
        return uniqueId
    }
}
