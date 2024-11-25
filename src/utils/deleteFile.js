import fs from 'fs'
import minioConfig from '../config/minio.js'
// import awsConfig from '../config/aws.js'

/**
 * Deletes a file from the file system.
 * @param {string} filePath - The path of the file to be deleted.
 */
const deleteFile = (filePath) => {
    // Use the 'fs.unlink' method to delete the file at the specified 'filePath'.
    // The 'fs.unlink' method deletes a file asynchronously.

    const fileUrl = process.env.LOCAL_STORAGE_PATH + filePath

    if (process.env.STORAGE_TYPE) {
        const parts = filePath?.split('/')
        const bucket = parts[0]
        const filename = parts[1]

        if (process.env.STORAGE_TYPE == 'minio') {
            minioConfig.removeObject(bucket, filename, (err) => {
                if (err) {
                    console.error('Error removing object:', err)
                } else {
                    console.log('Object deleted successfully!')
                }
            })
        } else if (process.env.STORAGE_TYPE == 's3') {
            awsConfig.deleteObject(bucket, filename, (err) => {
                if (err) {
                    console.error('Error removing object:', err)
                } else {
                    console.log('Object deleted successfully!')
                }
            })
        } else {
            if (fs.existsSync(fileUrl)) {
                fs.unlink(fileUrl, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${fileUrl}`, err)
                    }
                })
            }
        }
    }
}
export default deleteFile;