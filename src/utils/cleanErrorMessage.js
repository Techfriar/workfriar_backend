/**
 * Cleans and formats an error message for better readability.
 * @param {string} errorMessage - The error message to be cleaned.
 * @returns {string} The cleaned and formatted error message.
 */
const cleanErrorMessage = (errorMessage) => {
    // Remove special characters from the error message
    const cleanedMessage = errorMessage.replace(/[^\w\s]/gi, '')
    // Replace underscores with spaces in the cleaned error message.

    let newCleanedMessage = cleanedMessage.replace('_', ' ')
    newCleanedMessage = newCleanedMessage.replace('_', ' ')
    // Capitalize the first letter of the error message
    return newCleanedMessage.charAt(0).toUpperCase() + newCleanedMessage.slice(1)+'.';
}

export default cleanErrorMessage
