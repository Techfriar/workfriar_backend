// Description: Utility function to find timezone from a request object.
// Usage: const timezone = await findTimezone(req);
import axios from 'axios';
/**
 * Utility function to find timezone from a request object.
 * @param {Object} req - Express request object.
 * @returns {Promise<string|null>} - The timezone string (e.g., "America/Los_Angeles") or null if unavailable.
 */
export default async function findTimezone(req) {
    const clientIp = req.clientIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip = clientIp === "::1" || clientIp === "127.0.0.1" ? null : clientIp; // Default to a public IP for localhost testing

    try {

        if (!ip) {
            // If testing locally, use Asia/Kolkata as the default timezone
            return "Asia/Kolkata";
        }

        // Fetch geolocation data from geoPlugin API
        const response = await axios.get(`http://www.geoplugin.net/json.gp?ip=${ip}`);
        const { geoplugin_timezone: timezone } = response.data;

        // Return the timezone or null if not available
        return timezone || "Asia/Kolkata";
    } catch (error) {
        console.error("Error fetching data from geoPlugin:", error.message);
        return null;
    }
}

