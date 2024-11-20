import fs from 'fs'
import multer from 'multer'

/**
 * Configuration for storing uploaded CSV files
 */

const localStoragePath = process.env.LOCAL_STORAGE_PATH || 'storage/uploads/'

const csvStorage = multer.diskStorage({
    destination: (_req, file, cb) => {
        const dir = `${localStoragePath}csv`
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        cb(null, dir)
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

/**
 * Filter function to determine if a file should be accepted or rejected
 */
const csvFilter = (_req, file, cb) => {
    console.log('Reading file in middleware', file.originalname)
    if (file == undefined) {
        cb('Please upload a file to proceed.', false)
    } else {
        cb(null, true)
    }
}
/**
 * Export a multer middleware instance with the configured storage and filter
 */
export default multer({
    storage: csvStorage,
    fileFilter: csvFilter,
})
