import io from "../config/socket.js";


// Function to emit notification to a specific recipient
const sendNotificationToRecipient = (recipientId, notificationData) => {
    io.to(recipientId).emit('notification-add', notificationData);
};

export { sendNotificationToRecipient };
