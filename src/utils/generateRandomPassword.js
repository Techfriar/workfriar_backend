/**
 * Generates a random Password for employee.
 * @returns {Promise<string>} A Promise that resolves to the generated password.
 */
const generateRandomPassword = async () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

export default generateRandomPassword
