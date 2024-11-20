import fs from 'fs'
import axios from 'axios'
import path from 'path'

/**
 * Downloads an image from a Google Drive URL and saves it to a specified directory.
 * @param {string} url - The Google Drive URL of the image.
 * @param {string} directory - The directory where the image will be saved (including 'storage/uploads/' prefix).
 * @param {string} baseDir - The base directory to resolve the path (optional, defaults to current working directory).
 * @returns {Promise<string>} A promise that resolves with the relative path of the saved image within the directory.
 * @throws {Error} If the URL is invalid or if there is an error downloading the image.
 */
const downloadImageFromGoogleDrive = async (
    url,
    directory,
    baseDir = process.cwd(),
) => {
    try {
        // Extract the file ID from the Google Drive URL
        const fileIdMatch = url.match(/\/file\/d\/([^/]+)/)
        if (!fileIdMatch) {
            throw new Error('Invalid Google Drive file URL.')
        }

        const fileId = fileIdMatch[1]
        const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`

        const response = await axios({
            url: directDownloadUrl,
            method: 'GET',
            responseType: 'stream',
        })

        // Construct the full path for the custom folder
        const uploadDir = path.join(baseDir, directory)

        // Create the custom folder if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // Extract the file extension from the content-type header
        const contentType = response.headers['content-type']
        const extension = contentType.split('/').pop()

        // Generate a unique filename using a timestamp and the extension
        const timestamp = Date.now()
        const filename = `${timestamp}.${extension}`

        // Construct the full file path
        const imagePath = path.join(uploadDir, filename)

        // Write the file to the custom folder
        const writer = fs.createWriteStream(imagePath)

        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // Construct the relative path within the directory, excluding 'storage/uploads/' prefix
                const relativePath = path.relative(
                    'storage/uploads/',
                    directory,
                )
                resolve(path.join(relativePath, filename))
            })
            writer.on('error', reject)
        })
    } catch (error) {
        throw new Error(`Error downloading the image: ${error.message}`)
    }
}

export default downloadImageFromGoogleDrive
