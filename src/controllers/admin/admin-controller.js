import EmailRepository from '../../repositories/email-repository.js'
import UserRepository from '../../repositories/user-repository.js'
import AddUserRequest from '../../requests/admin/add-employee-request.js'
import UserResponse from '../../responses/user-response.js'
import bcryptPassword from '../../utils/bcryptPassword.js'

const employeeRepo = new UserRepository()
const userRepo = new UserRepository()
const emailRepo = new EmailRepository()

export default class UserController {
    /**
     * Get User
     *
     * @swagger
     * /admin/get:
     *   post:
     *     tags:
     *       - Admin
     *     summary: Get User
     *     security:
     *       - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: id
     *                 description: Enter id
     *     responses:
     *       200:
     *         description: Success
     *       422:
     *         description: Unprocessable Entity
     *       401:
     *         description: Unauthenticated
     */
    async getUser(req, res) {
        const { id } = req.body
        try {
            const employeeRequest = new GetUserRequest({ id })

            const validatedData = await employeeRequest.validate()
            const employeeData = await employeeRepo.getUser(
                validatedData.id,
            )

            if (employeeData) {
                const employeeDetails = await UserResponse.format(
                    employeeData,
                )
                res.status(200).json({
                    status: true,
                    message: 'User data fetched successfully.',
                    data: employeeDetails,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Failed to get user.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(422).json({
                status: false,
                message: 'Failed to get user.',
                errors: error,
            })
        }
    }

    /**
     * Get My Profile
     *
     * @swagger
     * /admin/profile-view:
     *   post:
     *     tags:
     *       - Admin
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
            const adminData = await userRepo.getUserExpanded( UserId )

            console.log('here', adminData)

            if (adminData) {
                const adminDetails = await UserResponse.format( adminData )
                res.status(200).json({
                    status: true,
                    message: 'Profile fetched successfully.',
                    data: adminDetails,
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
