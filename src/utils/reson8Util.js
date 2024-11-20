import axios from 'axios'

/**
 * Generates an OTP (One-Time Password) using the Reson8 API.
 * @param {string} country_code - The country code for the phone number.
 * @param {string} phone - The phone number to which the OTP will be sent.
 * @returns {Promise<Object>} - A Promise that resolves to the response data from the OTP request.
 */
const generateReson8Otp = async (country_code, phone) => {
    try {
        const url = 'https://www.reson8.ae/rest-api/v1/otp/send'
        const requestBody = {
            from: 'DIAMONDLEASE',
            to: country_code + phone,
            otpLength: 4,
            validity: 1,
        }
        const jsonRequestBody = JSON.stringify(requestBody)
        const headers = {
            'Content-Type': 'application/json',
            'X-Reson8-ID': process.env.X_RESON8_ID,
            'X-Reson8-Token': process.env.X_REASON8_TOKEN,
            'api-key': process.env.API_KEY,
        }
        const response = await axios.post(url, jsonRequestBody, { headers })
        console.log(response)
        console.log('OTP request sent successfully:', response.data)
        return response.data
    } catch (error) {
        console.log(error.response.data)
        console.log(error.response.status)
        // console.error('Failed to send OTP request:', error.message)
        return false
    }
}

/**
 * Verifies an OTP (One-Time Password) using the Reson8 API.
 * @param {string} otpReference - The reference ID of the OTP request.
 * @param {string} otpCode - The OTP code to verify.
 * @returns {Promise<Object>} - A Promise that resolves to the verification response data.
 */
const verifyOtp = async (otpReference, otpCode) => {
    try {
        const url = 'https://www.reson8.ae/rest-api/v1/otp/verify'
        // const url = `${otpBaseUrl}verify`;

        const requestBody = {
            otpReference,
            otpCode,
        }
        const headers = {
            'Content-Type': 'application/json',
            'X-Reson8-ID': process.env.X_RESON8_ID,
            'X-Reson8-Token': process.env.X_REASON8_TOKEN,
            'api-key': process.env.API_KEY,
        }

        const response = await axios.post(url, requestBody, { headers })
        if (response.data.errorLevel === 0) {
            console.log(
                'OTP verification successful:',
                response.data.procResponse,
            )
            return response.data
        } else {
            console.error('OTP verification failed:', response.data)
            return false
        }
    } catch (error) {
        console.error('Failed to verify OTP:', error.message)
        return false
    }
}

const sendPaymentLinkViaSMS = async (country_code, phone, paymentLink) => {
    try {
        const url = 'https://www.reson8.ae/rest-api/v1/message'
        const requestBody = {
            from: 'DIAMONDLEASE',
            to: country_code + phone,
            text: `Hi, We would like to bring to your attention that a payment of AED ${paymentLink.amount} is requested by Workfriar. To complete this payment, kindly click on the link below. ${paymentLink.url}`,
        }
        const jsonRequestBody = JSON.stringify(requestBody)
        const headers = {
            'Content-Type': 'application/json',
            'X-Reson8-ID': process.env.X_RESON8_ID,
            'X-Reson8-Token': process.env.X_REASON8_TOKEN,
            'api-key': process.env.API_KEY,
        }
        const response = await axios.post(url, jsonRequestBody, { headers })
        return response.data
    } catch (error) {
        return false
    }
}

export { generateReson8Otp, verifyOtp, sendPaymentLinkViaSMS }
