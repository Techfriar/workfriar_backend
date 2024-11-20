/**
 * Generates a random One-Time Password (OTP) of the specified length.
 * @returns {Promise<string>} A Promise that resolves to the generated OTP.
 */
const generateRandomNumber = async (count = 4) => {
    // Define the characters from which the OTP will be generated.
    const digits = '0123456789'
    let otp = ''
    for (let i = 0; i < count; i++) {
        // Choose a random digit from the 'digits' string and append it to the OTP.
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp
}

export default generateRandomNumber
