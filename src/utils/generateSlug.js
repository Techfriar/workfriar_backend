import slug from 'slug'
/**
 * Generates a URL-friendly slug from the provided text.
 * @param {string} text - The text from which the slug will be generated.
 * @returns {string} The generated URL-friendly slug.
 */
const generateSlug = (text) => {
    // Generate a random number between 1 and 10 (inclusive).
    const min = 1
    const max = 10
    const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min

    // Combine the input text with the random number to create a new string.
    // We use the 'slug' package to convert the combined string to a URL-friendly slug.
    const slugText = slug(text + randomInteger)

    // Return the generated URL-friendly slug.
    return slugText
}

export default generateSlug
