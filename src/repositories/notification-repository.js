import Notification from "../models/notifications.js";
import mongoose from 'mongoose';

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

    static async groupNotificationsByDate(user_id, timezone) {
        const pipeline = [
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_id) } // Filter by user ID
            },
            {
                $addFields: {
                    createdAt: {
                        $ifNull: ["$createdAt", new Date("1970-01-01")] // Provide a fallback date if null
                    }
                }
            },
            {
                $addFields: {
                    // Adjust createdAt to the provided timezone
                    adjustedDate: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: timezone
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$adjustedDate", // Group by adjusted date
                    notifications: { $push: "$$ROOT" } // Push all notifications for that date
                }
            },
            {
                $sort: { _id: 1 } 
            },
            {
                $sort: { "notifications.createdAt": -1 }
            }
        ];

        // Run the aggregation using Mongoose
        const groupedNotifications = await Notification.aggregate(pipeline);

        // Transform the output for better usability
        const result = {};
        groupedNotifications.forEach(group => {
            result[group._id] = group.notifications;
        });

        return result;
    }
    

}

export default NotificationRepository;