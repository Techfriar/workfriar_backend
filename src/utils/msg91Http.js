import axios from 'axios'

/**
 * This function is responsible for making HTTP requests to the Msg91 API
 * @param {string} method - The HTTP method used to make the request.
 * @param {string} path - The URL path to make the request.
 * @param {object} params - The parameters to send in the request.
 * @returns {object} - The response from the API.
 */
async function msg91Http(method, path, params) {
    const url = process.env.MSG91_URL + `${path}`
    try {
        // Use Axios to make the HTTP request
        const response = await axios({
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + process.env.MSG9_AUTH_KEY,
            },
            data: params,
        })
        // Return the data received from the response
        return response.data
    } catch (error) {
        // If there are errors, throw the error response
        throw error.response.data
    }
}

export default msg91Http
