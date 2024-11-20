import axios from 'axios'

/**
 * Utility class for interacting with the Mailercloud.
 */
export default class MailerCloud {
    /**
     * This function is responsible for creating contact in Mailercloud
     * @param {object} params - The parameters to send in the request.
     * @returns {object} - The response from the API.
     */
    static async createContact(params) {
        const url = process.env.MAILERCLOUD_URL

        const options = {
            method: 'POST',
            url: `${url}/contacts`,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `${process.env.AUTH_API_KEY}`,
            },
            data: params,
        }
        try {
            const { data } = await axios.request(options)
            return data
        } catch (error) {
            console.error(error)
            return error.response.data.errors[0]
        }
    }
}
