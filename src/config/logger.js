import path from "path";
import { fileURLToPath } from 'url';
import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import dayjs from 'dayjs';

// Define dirname
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Define the log file path
const logsDir = path.join(dirname, '..', '..', 'storage','logs');

// Ensure the logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Generate a filename based on the current date
const logFileName = `app-${dayjs().format('YYYY-MM-DD')}.log`;
const logFilePath = path.join(logsDir, logFileName);


// Create the logger
const logger = createLogger({
    level: 'info', // Set the log level
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: logFilePath }), // Log to file
    ]
});
export default logger;