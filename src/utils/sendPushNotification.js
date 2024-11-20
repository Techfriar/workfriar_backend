import fcmTokenRepository from '../repositories/fcmTokenRepository.js'
import notificationSettingsRepository from '../repositories/notificationSettingsRepository.js'
import PushNotificationUtil from './pushNotificationUtil.js'

// Initialize repositories
const fcmTokenRepo = new fcmTokenRepository()
const notificationSettingRepo = new notificationSettingsRepository()

// Function to send push notification
const sendPushNotification = async (
    title,
    body,
    channel,
    customerId = null,
    type = null,
    type_id = null,
    isGuest,
) => {
    //Dont send notification if it is guest user
    if (isGuest) {
        return
    }
    // Enqueue the notification to be sent
    await enqueueNotification(customerId, title, body, channel, type, type_id)
}

// Function to prepare and enqueue notifications
async function enqueueNotification(
    customerId,
    title,
    body,
    channel,
    type,
    type_id,
) {
    let fcmTokens = []
    let tokens

    // Retrieve FCM tokens based on customer ID
    if (customerId) {
        tokens = await fcmTokenRepo.listFcmTokenWithCustomerId(customerId)
    } else {
        tokens = await fcmTokenRepo.listFcmToken()
    }

    // Filter FCM tokens based on notification settings
    await Promise.all(
        tokens.map(async (fcm) => {
            const notificationSetting =
                await notificationSettingRepo.getNotificationSettings(
                    fcm.customer_id,
                )
            if (notificationSetting.settings[channel] === true) {
                fcmTokens.push(fcm.token)
            }
        }),
    )

    // Send notifications to FCM if there are tokens
    if (fcmTokens.length > 0) {
        await sendNotificationsToFCM(
            fcmTokens,
            title,
            body,
            channel,
            type,
            type_id,
        )
    }
}

// Function to send notifications to FCM
async function sendNotificationsToFCM(
    fcmTokens,
    title,
    body,
    channel,
    type,
    type_id,
) {
    const data = { [type]: type_id.toString() }
    await PushNotificationUtil.sendPushNotification(
        title,
        body,
        fcmTokens,
        data,
    )
}

export default sendPushNotification
