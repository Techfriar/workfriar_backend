/**
 * If Mongoose not found error, set to 404 and change message
 */
const dbErrorHandler = (err, req, res) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode
    let message = err.message

    // If Mongoose not found error, set to 404 and change message
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404
        message = 'Resource not found'
    }

    res.status(statusCode).json({
        status: false,
        message: message,
        error: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
}

export { dbErrorHandler }
