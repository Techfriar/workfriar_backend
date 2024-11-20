
/**
 * Calculate duration between two dates.
 * @param {string} pickupDate - Vehicle booking date.
 * @param {string} returnDate - Vehicle booking end date.
 * @returns {Promise<string>} A Promise that resolves to calculate duration.
 */
const calculateDuration = async (pickupDate,returnDate) => {
    const start = new Date(pickupDate)
    const end = new Date(returnDate)

    const timeDiff = Math.abs(end.getTime() - start.getTime())
    const duration = Math.ceil(timeDiff / (1000 * 3600 * 24))

    return duration
}

export default calculateDuration
