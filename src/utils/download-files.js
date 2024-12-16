import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import minioConfig from '../config/minio.js';
import dotenv from 'dotenv';

dotenv.config();

// Set the download bucket for Minio
const downloadBucket = process.env.DOWNLOAD_BUCKET || 'workfriar';
const storageType = process.env.STORAGE_TYPE;
const localStoragePath = process.env.LOCAL_STORAGE_PATH || '/storage/uploads/';

/**
 * Download files, handling both single and multiple files.
 * @param {string|string[]} filePaths - A single file path or an array of file paths.
 * @param {string} [zipFileName] - Name of the resulting ZIP file if multiple files are downloaded.
 * @param {Response} [res] - Express response object to stream directly.
 * @returns {Promise<void|{stream: Readable, filename: string}>} 
 */
async function downloadFiles(filePaths, zipFileName = 'files.zip', res) {
    if (Array.isArray(filePaths)) {
        if (filePaths.length === 1) {
            // Single file logic if only one file in array
            const result = await downloadSingleFile(filePaths[0]);
            return streamSingleFile(res, result.stream, result.filename);
        }
        // Multiple files logic
        return downloadMultipleFiles(filePaths, zipFileName, res);
    }

    // Single file logic
    const result = await downloadSingleFile(filePaths);
    return streamSingleFile(res, result.stream, result.filename);
}

/**
 * Stream a single file directly to response
 * @param {Response} res - Express response object.
 * @param {Readable} stream - File read stream.
 * @param {string} filename - Name of the file.
 */
function streamSingleFile(res, stream, filename) {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    stream.pipe(res);
}


/**
 * Download a single file
 * @param {string} filePath - The path of the file to download.
 * @returns {Promise<{stream: Readable, filename: string}>} The file stream and its original name.
 */
async function downloadSingleFile(filePath) {
    if (storageType === 'minio') {
        return downloadFromMinio(filePath);
    } else if (storageType === 's3') {
        return downloadFromS3(filePath);
    } else {
        return downloadFromLocal(filePath);
    }
}

/**
 * Download multiple files as a ZIP
 * @param {string[]} filePaths - Array of file paths to download.
 * @param {string} zipFileName - Name of the resulting ZIP file.
 * @param {Response} res - Express response object to stream directly.
 */
async function downloadMultipleFiles(filePaths, zipFileName, res) {
    const archive = archiver('zip', { zlib: { level: 9 } }); // Create a ZIP archive

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe the archive stream directly to the response
    archive.pipe(res);

    // Append each file to the archive
    for (const filePath of filePaths) {
        try {
            const { stream, filename } = await downloadSingleFile(filePath);
            archive.append(stream, { name: filename });
        } catch (err) {
            console.error(`Error adding file to archive: ${filePath}`, err);
            archive.append(`Error: Could not add file ${filePath}`, { name: `error_${path.basename(filePath)}.txt` });
        }
    }

    // Finalize the archive
    archive.finalize();
}


// Download a file from local storage
const downloadFromLocal = (filePath) => {
    const fullPath = path.join(localStoragePath, filePath);
    return new Promise((resolve, reject) => {
        if (fs.existsSync(fullPath)) {
            resolve({
                stream: fs.createReadStream(fullPath),
                filename: path.basename(filePath),
            });
        } else {
            reject(new Error('File not found in local storage.'));
        }
    });
};

// Download a file from Minio
const downloadFromMinio = (filePath) => {
    return new Promise((resolve, reject) => {
        const stream = minioConfig.getObject(downloadBucket, filePath, (err, dataStream) => {
            if (err) {
                return reject(err);
            }
            resolve({
                stream: dataStream,
                filename: path.basename(filePath),
            });
        });
    });
};

// Download a file from S3
const downloadFromS3 = (filePath) => {
    const s3 = new awsConfig.s3();
    const params = {
        Bucket: downloadBucket,
        Key: filePath,
    };

    return new Promise((resolve, reject) => {
        const stream = s3.getObject(params).createReadStream();
        stream.on('error', (err) => reject(err));
        resolve({
            stream: stream,
            filename: path.basename(filePath),
        });
    });
};

export { downloadFiles };



