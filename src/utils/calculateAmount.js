/**
 * Calculate duration between two dates.
 * @param {string} duration - Vehicle booking duration.
 * @param {string} dailyPrice - Vehicle booking daily price.
 * @param {string} weeeklyPrice - Vehicle booking weekly price.
 * @param {string} monthlyPrice - Vehicle booking monthly price.
 * @returns {Promise<string>} A Promise that resolves to calculate duration.
 */
const calculateAmount = async (
    duration,
    dailyPrice,
    weeeklyPrice,
    monthlyPrice,
) => {

    let amount = 0
    if (duration == 7) {
        amount = weeeklyPrice
        return amount

    } else if (duration == 30) {
        amount = duration * monthlyPrice
        return amount

    } else {
        amount = dailyPrice

    }
    return amount
}

export default calculateAmount
