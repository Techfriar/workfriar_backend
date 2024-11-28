import express from 'express'
import UserController from '../controllers/user/user-controller.js'

const userRoutes = express.Router()

const user = new UserController()

userRoutes
    .route('/profile-view')
    .post(
        // authenticateUser,
        user.getMyProfile
    )

export default userRoutes