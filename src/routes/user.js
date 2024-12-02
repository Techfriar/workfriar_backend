import express from 'express'
import UserController from '../controllers/user/user-controller.js'

const userRouter = express.Router()

const user = new UserController()

userRouter
    .route('/profile-view')
    .post(
        user.getMyProfile
    )

export default userRouter