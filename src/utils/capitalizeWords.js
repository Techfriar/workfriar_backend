/**
 * To capitalize the first letter in a string.
 * @param {string} string - The text to be capitalized.
 * @returns {Promise<string>} A Promise that resolves to the capitalized string.
 */
const capitalizeWords = (string) => {
    if (string) {
        if (string.length <= 3) return string.toUpperCase()
        return string.charAt(0).toUpperCase() + string.slice(1)
    }
}

export default capitalizeWords
