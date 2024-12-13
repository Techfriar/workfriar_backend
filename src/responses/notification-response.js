class NotificationResponse{
    async dashboardNotificationResponse(notification){
        return{
            message: notification.message,
            type: notification.type,
        }
    }
}

export default NotificationResponse;