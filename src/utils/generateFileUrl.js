/**
 * Generate file url
 * @param {string} file - The file path stored in db
 * @returns {string} The file url
 */
export const generateFileUrl = (file) => {
    let imagePath = ''
    if (file) {
        if (process.env.STORAGE_TYPE) {
            if (process.env.STORAGE_TYPE == 'minio') {
                imagePath = process.env.MINIO_URL + file
            } else if (process.env.STORAGE_TYPE == 's3') {
                imagePath = process.env.S3_URL + file
            } else {
                imagePath =
                    process.env.APP_URL + process.env.LOCAL_STORAGE_PATH + file
            }
        } else {
            imagePath =
                process.env.APP_URL + process.env.LOCAL_STORAGE_PATH + file
        }
        return imagePath
    } else {
        return ''
    }
}
