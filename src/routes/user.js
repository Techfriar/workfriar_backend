import express from 'express'
import UserController from '../controllers/user/user-controller.js'
import CategoryController from '../controllers/category-controller.js'
import NotificationController from '../controllers/notification-controller.js';
import TimeSheetSummaryController from '../controllers/timeSheet-summarycontroller.js';
const categoryController = new CategoryController();

const userRouter = express.Router()

const user = new UserController()
const timesheetSummary = new TimeSheetSummaryController()
const notification = new NotificationController()

userRouter
    .route('/profile-view')
    .post(
        user.getMyProfile
    )
// Route to get all categories
userRouter.route("/getcategories").post(categoryController.getCategories)


userRouter.route("/getduedates").post(timesheetSummary.getDatesController)

userRouter.route("/getdates").post(timesheetSummary.getAllDatesController)

userRouter
    .route('/notifications')
    .post(notification.getNotifications
)

userRouter
    .route('/all-notifications')
    .post(notification.getAllNotification
)

export default userRouter