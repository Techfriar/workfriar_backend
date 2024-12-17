import UserRepository from "../../repositories/user-repository.js"
import UserResponse from "../../responses/user-response.js"

const userRepo = new UserRepository()

export default class UserController{
    /**
     * Get My Profile
     *
     * @swagger
     * /user/profile-view:
     *   post:
     *     tags:
     *       - User
     *     summary: Get my profile
     *     security:
     *       - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Success
     *       422:
     *         description: Unprocessable Entity
     *       401:
     *         description: Unauthenticated
     */
    async getMyProfile(req, res) {
        try {
           // Extract UserId from the user session
			const UserId = req.session.user.id;
            
            const userData = await userRepo.getUserExpanded( UserId )

            if (userData) {
                const userDetails = await UserResponse.format( userData )
                res.status(200).json({
                    status: true,
                    message: 'Profile fetched successfully.',
                    data: userDetails,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Failed to get profile.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(422).json({
                status: false,
                message: 'Failed to get profile.',
                errors: error,
            })
        }
    }
}