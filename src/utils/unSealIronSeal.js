import Iron from '@hapi/iron';

/**
 * Decrypt the given data using hapi/iron
 * @param {string} encodeObject - Encrypted data by hapi/iron
 * @returns {Promise<Object>} Decoded object
 */

const IntersectionSecret = process.env.INTERSECTION_SECRET;

/**
 * Decrypt the given data using hapi/iron
 * @param {string} encodeObject - Encrypted data by hapi/iron
 * @returns {Promise<Object>} Decoded object
 */
export default async function decode(encodeObject) {
    try {
        const decodeObject = await Iron.unseal(
            encodeObject,
            IntersectionSecret, // Replace with your actual secret
            Iron.defaults
        );

        const expiresAt = decodeObject.createdAt + decodeObject.maxAge;

        // Validate the expiration date of the session
        if (Date.now() > expiresAt) {
            throw new Error("Encoded Object is expired");
        }

        return decodeObject;
    } catch (error) {
        console.error("Error decoding object:", error.message);
        throw error;
    }
}

