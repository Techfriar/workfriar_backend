import PushNotification from 'pushnotification_js'

export default class PushNotificationUtil {
    /**
     * Sends a push notification using the PushNotification library.
     *
     * @param {string} title - The title of the push notification.
     * @param {string} body - The body/content of the push notification.
     * @param {Array<string>} fcmTokens - An array of FCM tokens to which the notification will be sent.
     * @param {Object} [data={}] - An optional data object to include in the notification.
     * @returns {Promise<Object>} The response from the push notification service.
     *
     * @throws {Error} Throws an error if sending the notification fails.
     */
    static async sendPushNotification(title, body, fcmTokens, data) {
        try {
            // Initialize the PushNotification instance with the necessary configuration
            const pushNotification = new PushNotification({
                protocol: process.env.PUSH_NOTIFICATION_PROTOCOL,
                host: process.env.PUSH_NOTIFICATION_HOST,
                port: process.env.PUSH_NOTIFICATION_PORT,
            })

            // Send the push notification using the provided title, body, and FCM tokens
            const send = await pushNotification.sendNotification(
                title,
                body,
                fcmTokens,
                data,
            )
            // Return the result of the push notification request
            return send
        } catch (error) {
            // Catch and throw any errors that occur during the notification sending process
            throw new Error(error)
        }
    }
}
