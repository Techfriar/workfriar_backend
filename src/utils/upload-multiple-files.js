import fs from 'fs';
import { Readable } from 'stream';
import minioConfig from '../config/minio';

// Set upload bucket minio
const uploadBucket = process.env.UPLOAD_BUCKET || 'workfriar';

// Set the project location based on the environment variable
const storageType = process.env.STORAGE_TYPE;
const localStoragePath = process.env.LOCAL_STORAGE_PATH || '/storage/uploads/';

/**
 * Function to upload the file based on the environment
 * @param {File} file - The file to be uploaded
 * @param {string} folderName - The folder name to be uploaded
 * @returns {Promise<{path: string, filename: string}>} The uploaded file path and filename.
 */
async function uploadMultipleFiles(files, folderName) {
    if(!Array.isArray(files)) {
        throw new Error('Files must be an array');
    }

    const uploadPromises = files.map(async (file) => {
        return new Promise((resolve, reject) => {
            try {
                if (storageType === 'minio') {
                    uploadToMinio(file, resolve, reject);
                } else if (storageType === 's3') {
                    uploadToS3(file, resolve, reject);
                } else {
                    uploadToLocal(file, folderName, resolve, reject)
                }
            } catch (error) {
                reject(error);
            }
        });
    });

    return Promise.all(uploadPromises);
}

const uploadToLocal = (file, folderName, resolve, reject) => {
    const uploadDir = './' + localStoragePath + folderName // Custom folder path

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${file.originalname}`
    const filePath = `${uploadDir}/${uniqueFileName}`

    fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
            reject(err)
        }else{
            resolve({
                path: `${folderName}/${uniqueFileName}`,
                filename: file.originalname,
            })
        }
    })
}

const uploadToMinio = (file, resolve, reject) => {
    const fileBuffer = file.buffer || file
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${file.originalname || file.name}`

    const readableStream = Readable.from(fileBuffer)

    minioConfig.putObject(
        uploadBucket,
        uniqueFileName,
        readableStream,
        function (error) {
            if (error) {
                reject(error)
            }
            const objectUrl = `${uniqueFileName}`
            resolve({
                path: objectUrl, // Include the object URL in req.uploadedFile as the path
                filename: uniqueFileName,
            })
        },
    )
}

const uploadToS3 = (file, resolve, reject) => {
    const fileBuffer = file.buffer
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${file.originalname}`

    const s3 = new awsConfig.s3()
    const params = {
        Bucket: uploadBucket,
        Key: uniqueFileName,
        Body: fileBuffer,
    }

    s3.upload(params, (error) => {
        if (error) {
            reject(error)
        }
        const objectUrl = `${uniqueFileName}`
        resolve({
            path: objectUrl, // Include the object URL in req.uploadedFile as the path
            filename: uniqueFileName,
        })
    })
}

export default uploadMultipleFiles