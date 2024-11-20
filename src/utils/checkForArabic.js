/**
 * Function to check if a given text contains any Arabic characters.
 *
 * @param {string} text - The text to be checked for Arabic characters.
 * @returns {boolean} - Returns true if the text contains Arabic characters, otherwise false.
 */
const checkForArabic = (text) => {
    const arabicCharPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
    return arabicCharPattern.test(text)
}

export default checkForArabic
