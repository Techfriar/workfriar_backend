/**
 *  If request url not found error, set to 404
 */
const requestNotFoundCheck = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
}

export { requestNotFoundCheck }
