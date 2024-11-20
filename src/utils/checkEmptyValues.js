/**
 * Check each key in an object is not empty
 * @param {string} obj - The object to be check.
 * @returns {boolean} Return the status.
 */
const checkEmptyValues = async (obj) => {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (!obj[key] || obj[key].toString().trim() === '') {
            return false; // Key has an empty value
          }
        }
      }
      return true; // All keys have non-empty values
}

export default checkEmptyValues
