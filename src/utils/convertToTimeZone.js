import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

// Import the locale you need, e.g., 'en'
import 'dayjs/locale/en.js'

// Extend dayjs with the plugins
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Get User Local Time by TimeZone
 *
 * @param {String} currentTime - UTC time in ISO 8601 format or similar standard date-time format.
 * @param {String} time_zone - IANA timezone string like 'Europe/London'.
 * @returns {String} - Local time in the user's timezone formatted as 'YYYY-MM-DD HH:mm'.
 */
function getUserLocalTimeByTimeZone(currentTime, time_zone) {
    // Convert UTC time to user's local time
    const localTime = dayjs.utc(currentTime).tz(time_zone)
    // Format the local time
    return localTime.format('YYYY-MM-DD HH:mm')
}

export default getUserLocalTimeByTimeZone
