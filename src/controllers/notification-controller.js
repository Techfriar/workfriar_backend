import NotificationRepository from "../repositories/notification-repository.js";
import NotificationRequest from "../requests/admin/notification-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";
import { sendNotificationToRecipient } from "../utils/sendNotificationToRecipient.js";
import findTimezone from "../utils/findTimeZone.js";
import getLocalDateStringForTimezone from "../utils/getLocalDateStringForTimezone.js";

class NotificationController {
    static NotificationRepo = new NotificationRepository();
    static NotificationRequest = new NotificationRequest();
    async createNotification(user_id, message, type) {
        try {
            if (!user_id || !message) {
                throw new CustomValidationError('UserId and message are required fields');
            }

            const notification = {
                user_id,
                message,
                type,
            };

            const newNotification = await NotificationRepository.createNotification(notification);
            sendNotificationToRecipient(user_id, newNotification);
            return newNotification;
        } catch (error) {
            throw new Error('An unexpected error occurred while creating the notification');
        }
    }

    /**
     * @swagger
     * /user/notifications:
     *   post:
     *     summary: Get notifications for a user
     *     tags:
     *      - Notification
     *     requestBody:
     *       
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *             properties:
     *               user_id:
     *                 type: string
     *                 description: The ID of the user to fetch notifications for
     *     responses:
     *       200:
     *         description: Successful response with notifications
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Notifications fetched successfully
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Notification'
     *       422:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ServerError'
     */
    async getNotifications(req, res) {
        try {

            const user_id = req.session.user.id;

            if (!user_id) {
                throw new CustomValidationError('UserId is a required field');
            }

            const validateUser = await NotificationRequest.validateUser(user_id);
            if (validateUser.error) {
                throw new CustomValidationError(validatedDates.error);
            }

            const notifications = await NotificationRepository.getUserNotifications(user_id);
            if (notifications.length > 0) {
                res.status(200).json({
                    status: true,
                    message: 'Notifications fetched successfully',
                    data: notifications,
                })
            }
            else {
                res.status(200).json({
                    status: true,
                    message: 'No notifications found',
                    data: [],
                })
            }

        }
        catch (err) {
            if (err instanceof CustomValidationError) {
                res.status(422).json({
                    status: false,
                    message: 'Validation error',
                    errors: err.errors,
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: err.message,
                    data: [],
                });
            }
        }
    }

    /**
     * @swagger
     * /user/all-notifications:
     *   post:
     *     summary: Get all notifications for a user grouped by date
     *     tags:
     *       - Notification
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Successful response with notifications grouped by date
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Notifications fetched successfully
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       date:
     *                         type: string
     *                         format: date
     *                       notifications:
     *                         type: array
     *                         items:
     *                           $ref: '#/components/schemas/Notification'
     *       422:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationError'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ServerError'
     */

    async getAllNotification(req, res) {
        try {
            const user_id = req.session.user.id;

            if (!user_id) {
                throw new CustomValidationError('UserId is a required field');
            }

            const validateUser = await NotificationRequest.validateUser(user_id);
            if (validateUser.error) {
                throw new CustomValidationError(validateUser.error);
            }

            const timezone = await findTimezone(req);
            let today = getLocalDateStringForTimezone(timezone, new Date());
            today = new Date(today);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            const notifications = await NotificationRepository.groupNotificationsByDate(user_id, timezone);

            const result = [];
            for (const date in notifications) {
                const formattedNotifications = notifications[date].map((notification) => {
                    // Format the time from createdAt
                    const time = new Date(notification.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    return {
                        message: notification.message,
                        time: time,
                        type: notification.type,
                    };
                });

                if (date === today.toISOString().split('T')[0]) {
                    result.push({ date: 'Today', notifications: formattedNotifications });
                } else if (date === yesterday.toISOString().split('T')[0]) {
                    result.push({ date: 'Yesterday', notifications: formattedNotifications });
                } else {
                    const formattedDate = new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    });
                    result.push({ date: formattedDate, notifications: formattedNotifications });
                }
            }

            res.status(200).json({
                status: true,
                message: 'Notifications fetched successfully',
                data: result.length > 0 ? result : [],
            });

        } catch (err) {
            if (err instanceof CustomValidationError) {
                res.status(422).json({
                    status: false,
                    message: 'Validation error',
                    errors: err.errors,
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: err.message,
                    data: [],
                });
            }
        }
    }

    /**
     * @swagger
     * /admin/notify-user:
     *   post:
     *     summary: Send a notification to a user
     *     tags:
     *       - Notification
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *             properties:
     *               user_id:
     *                 type: string
     *                 description: The ID of the user to notify
     *     responses:
     *       200:
     *         description: Notification sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Notification sent successfully
     *                 data:
     *                   type: array
     *                   items: {}
     *       422:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: Validation error
     *                 errors:
     *                   type: object
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: An unexpected error occurred
     *                 data:
     *                   type: array
     *                   items: {}
     */

    async notifyUser(req, res) {
        try {
            const { user_id, date_range } = req.body
            if (!user_id) {
                throw new CustomValidationError('UserId is a required fields');
            }

            const validateUser = await NotificationRequest.validateUser(user_id);
            if (validateUser.error) {
                throw new CustomValidationError(validateUser.error);
            }

            const notification = {
                user_id,
                message: `You have pending timesheets for ${date_range}`,
                type: 'warning',
            };

            const newNotification = await NotificationRepository.createNotification(notification);
            sendNotificationToRecipient(user_id, newNotification);
            if (newNotification) {
                res.status(200).json({
                    status: true,
                    message: 'Notification sent successfully',
                    data: [],
                })
            }

        } catch (err) {
            if (err instanceof CustomValidationError) {
                res.status(422).json({
                    status: false,
                    message: 'Validation error',
                    errors: err.errors,
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: err.message,
                    data: [],
                });
            }
        }
    }

}

export default NotificationController;