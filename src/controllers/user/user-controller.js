import UserRepository from "../../repositories/user-repository"

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
            // Extract token from Authorization header
			// const token = req.headers.authorization?.split(' ')[1];  // 'Bearer <token>'

			// if (!token) {
			// 	return res.status(401).json({ 
			// 		status:false,
			// 		message: 'No token provided',
			// 		data: []
			// 	});
			// }

			// // Decode the token without verifying it (get the payload)
			// const decoded = jwt.decode(token);  // Decode without verification

			// const UserId = decoded.UserId;

            const UserId = '6744a7c9707ecbeea1efd14c'
            const userData = await userRepo.getUserExpanded( UserId )

            console.log('here', userData)

            if (adminData) {
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