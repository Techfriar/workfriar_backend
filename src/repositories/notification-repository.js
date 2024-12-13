import Notification from "../models/notifications.js";

class NotificationRepository{
    static async createNotification(notificationData) {
        try {
            const newNotification = new Notification(notificationData);
            return await newNotification.save();
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getUserNotifications(user_id){
        try {
            return await Notification.find({user_id: user_id}).sort({createdAt: -1}).limit(3);
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default NotificationRepository;