/**
 * Generate a slug based on input parameters.
 * @param {*} param1 - The first parameter.
 * @param {*} param2 - The second parameter.
 * @returns {string} - The generated slug.
 */
export function generateSlug(param1, param2) {
    // Replace spaces in param1 and param2 with hyphens
    const sanitizedParam1 = param1.replace(/\s+/g, '-')
    const sanitizedParam2 = param2.replace(/\s+/g, '-')

    // Create a string by taking the first 2 characters of sanitizedParam1 and sanitizedParam2 and joining them with a hyphen.
    let str = `${sanitizedParam1}-${sanitizedParam2}`

    // Convert the resulting string to uppercase.
    return str.toUpperCase()
}

/**
 * Regenerate a slug based on input slug.
 * @param {*} slug - The input slug.
 * @returns {string} - The regenerated slug.
 */
export function regenerateSlug(slug) {
    // Split the input slug by the hyphen, but only if the hyphen is followed by a digit.
    const parts = slug.split(/-(?=\d$)/)
    if (parts[1]) {
        // If the slug contains a number part, increment it by 1.
        const num = parseInt(parts[1]) + 1
        return `${parts[0]}-${num}`
    } else {
        // If the slug doesn't contain a number part, add "-1" to it.
        return `${parts[0]}-1`
    }
}
