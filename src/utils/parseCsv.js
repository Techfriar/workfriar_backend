import { createReadStream } from 'fs'
import { parse } from 'fast-csv'

/**
 * Parse a CSV file and return the data as an array of objects.
 * @param {string} filename - The name of the CSV file.
 * @returns {Promise<Array<object>>} - Resolves with the parsed data.
 */
const parseCSV = async (filename) => {
    const localStoragePath =
        process.env.LOCAL_STORAGE_PATH || 'storage/uploads/'

    return new Promise((resolve, reject) => {
        const uploadedSpecs = []
        const path = `${localStoragePath}csv/` + filename

        createReadStream(path)
            .pipe(parse({ headers: true }))
            .on('error', (error) => reject(error))
            .on('data', (row) => uploadedSpecs.push(row))
            .on('end', () => resolve(uploadedSpecs))
    })
}

export default parseCSV
