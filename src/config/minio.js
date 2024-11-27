import { Client } from 'minio'
import dotenv from 'dotenv'

dotenv.config();
/**
 * Create a Minio config
 */
const minioConfig = new Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
})

export default minioConfig
