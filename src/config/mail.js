import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// Load environment variables from the .env file into process.env
dotenv.config()

// Create a transporter with smtp host
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // True for port 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
    tls: {
        ciphers: 'SSLv3',
    },
})

export default transporter
