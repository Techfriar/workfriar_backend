import NotificationRepository from "../repositories/notification-repository.js";
import NotificationRequest from "../requests/admin/notification-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";
import { sendNotificationToRecipient } from "../utils/sendNotificationToRecipient.js";

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
     *                 success:
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
            // const token = req.headers.authorization?.split(' ')[1];
            // if (!token) {
            //     return res.status(401).json({ 
            //         status: false,
            //         message: 'No token provided',
            //         data: []
            //     });
            // }
            // const decoded = jwt.decode(token);
            // const user_id = decoded.UserId;
            
            const user_id = '6756c072ddd097b3e4bbadd5'
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
                    success: true,
                    message: 'Notifications fetched successfully',
                    data: notifications,
                })
            }
            else {
                res.status(200).json({
                    success: true,
                    message: 'No notifications found',
                    data: [],
                })
            }

        }
        catch (err) {
            if (err instanceof CustomValidationError) {
                res.status(422).json({
                    success: false,
                    message: 'Validation error',
                    errors: err.errors,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: err.message,
                    data: [],
                });
            }
        }
    }
}

export default NotificationController;