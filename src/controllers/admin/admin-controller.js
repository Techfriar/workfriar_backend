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
     * Add User
     *
     * @swagger
     * /user/add:
     *   post:
     *     tags:
     *       - User
     *     summary: Add user
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: Enter name
     *               email:
     *                 type: string
     *                 description: Enter email address
     *               gender:
     *                 type: string
     *                 description: Enter gender(male or female or other)
     *               country_code:
     *                 type: string
     *                 description: Enter country code(+971)
     *               country_unicode:
     *                 type: string
     *                 description: Enter country unicode(ae)
     *               phone:
     *                 type: string
     *                 description: Enter phone number
     *               employee_id:
     *                 type: string
     *                 description: Enter user id
     *               address:
     *                 type: string
     *                 description: Enter address
     *               postal_code:
     *                 type: string
     *                 description: Enter customer postal_code
     *               city:
     *                 type: string
     *                 description: Enter customer city
     *               country:
     *                 type: string
     *                 description: Enter customer country
     *               emirate:
     *                 type: string
     *                 description: Enter emirate
     *               role_id:
     *                 type: string
     *                 description: Enter role id
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Enter profile image link
     *     responses:
     *       200:
     *         description: Success
     *       400:
     *         description: Bad Request
     *       500:
     *         description: Internal Server Error
     */
    async addUser(req, res) {
        try {
            const validatedData = await new AddUserRequest(req).validate()
            for (const fieldName in req.files) {
                if (Object.hasOwnProperty.call(req.files, fieldName)) {
                    const fileArray = req.files[fieldName]
                    for (const file of fileArray) {
                        const folderName = 'employees'

                        const uploadedFile = await uploadFile(file, folderName)
                        if (uploadedFile.path) {
                            req.body.file = uploadedFile.path
                        }
                    }
                }
            }

            if (validatedData.file != undefined) {
                validatedData.profile_pic_path = req.body.file
                delete validatedData.file
            }

            //Generate random password
            const password = await generateRandomPassword()
            validatedData['password'] = await bcryptPassword(password)
            const employeeDetails = await employeeRepo.addUser(
                validatedData,
            )

            if (employeeDetails) {
                const employeeData = await UserResponse.format(
                    employeeDetails,
                )

                /**
                 * Send login credentials through email
                 */
                await emailRepo.employeWelcome(
                    validatedData.email,
                    validatedData.email,
                    password,
                )
                io.emit('user-add', employeeData)

                res.status(200).json({
                    status: true,
                    message: 'User data added successfully.',
                    data: employeeData,
                })
            } else {
                res.status(422).json({
                    status: false,
                    message: 'Failed to add user.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(422).json({
                status: false,
                message: 'Failed to add user.',
                errors: error,
            })
        }
    }

    /**
     * Get User
     *
     * @swagger
     * /user/get:
     *   post:
     *     tags:
     *       - User
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
     * Update User
     *
     * @swagger
     * /user/update:
     *   post:
     *     tags:
     *       - User
     *     security:
     *       - bearerAuth: []
     *     summary: Update User
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: Enter name
     *               email:
     *                 type: string
     *                 description: Enter email address
     *               gender:
     *                 type: string
     *                 description: Enter gender(male or female or other)
     *               country_code:
     *                 type: string
     *                 description: Enter country code(+971)
     *               country_unicode:
     *                 type: string
     *                 description: Enter country unicode(ae)
     *               phone:
     *                 type: string
     *                 description: Enter phone number
     *               employee_id:
     *                 type: string
     *                 description: Enter user id
     *               address:
     *                 type: string
     *                 description: Enter address
     *               postal_code:
     *                 type: string
     *                 description: Enter customer postal_code
     *               city:
     *                 type: string
     *                 description: Enter customer city
     *               country:
     *                 type: string
     *                 description: Enter customer country
     *               emirate:
     *                 type: string
     *                 description: Enter emirate
     *               role_id:
     *                 type: string
     *                 description: Enter role id
     *               password:
     *                 type: string
     *                 description: Enter password
     *               confirm_password:
     *                 type: string
     *                 description: Enter confirm password
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Enter profile image link
     *     responses:
     *       200:
     *         description: Success
     *       400:
     *         description: Bad Request
     *       500:
     *         description: Internal Server Error
     */
    async updateUser(req, res) {
        try {
            const validatedData = await new UpdateUserRequest(
                req,
            ).validate()
            for (const fieldName in req.files) {
                if (Object.hasOwnProperty.call(req.files, fieldName)) {
                    const fileArray = req.files[fieldName]
                    for (const file of fileArray) {
                        const folderName = 'employees'

                        const uploadedFile = await uploadFile(file, folderName)
                        if (uploadedFile.path) {
                            req.body.file = uploadedFile.path
                        }
                    }
                }
            }

            const employeeData = await employeeRepo.getUser(
                validatedData.id,
            )

            if (validatedData.file != undefined) {
                validatedData.profile_pic_path = req.body.file
                delete validatedData.file
            } else {
                validatedData.profile_pic_path = employeeData.profile_pic_path
            }

            const newPassword =
                validatedData.password &&
                (await bcryptPassword(validatedData.password))

            if (newPassword && employeeData.password !== newPassword) {
                validatedData['password'] = newPassword

                /**
                 * Send updated password through email
                 */

                await emailRepo.employePasswordUpdate(
                    validatedData.email,
                    validatedData.name,
                    validatedData.password,
                )
            } else {
                validatedData['password'] = employeeData.password
            }
            const updatedUser = await employeeRepo.updateUser(
                validatedData,
            )
            if (updatedUser) {
                const employeeData = await UserResponse.format(
                    updatedUser,
                )
                io.emit('user-update', employeeData)
                res.status(200).json({
                    status: true,
                    message: 'User data updated successfully.',
                    data: employeeData,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Unable to update user.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(422).json({
                status: false,
                message: 'Unable to update user.',
                errors: error,
            })
        }
    }

    /**
     * List Users
     *
     * @swagger
     * /user/list:
     *   post:
     *     tags:
     *       - User
     *     summary: List Users
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
     *               page_number:
     *                 type: number
     *                 description: Enter page number
     *               keyword:
     *                 type: number
     *                 description: Enter keyword
     *               status:
     *                 type: string
     *                 description: Enter status
     *               role_id:
     *                 type: string
     *                 description: Enter role id
     *     responses:
     *       200:
     *         description: Success
     *       422:
     *         description: Unprocessable Entity
     *       401:
     *         description: Unauthenticated
     */
    async listUsers(req, res) {
        const { page_number, keyword, status, role_id } = req.body
        const employeeRequest = new ListUserRequest({
            page_number,
            keyword,
            status,
            role_id,
        })
        try {
            const validatedData = await employeeRequest.validate()

            const employees = await employeeRepo.listUsers(
                validatedData.page_number,
                validatedData.keyword,
                validatedData.status,
                validatedData.role_id,
            )
            if (employees) {
                const employeesData = await Promise.all(
                    employees.items.map(
                        async (user) =>
                            await UserResponse.format(user),
                    ),
                )

                // Filter employees whose role is super admin
                const emp = employeesData.filter(
                    (user) => user.role.name != 'Super Admin',
                )

                const data = {
                    employees: emp,
                    employeeCount: employees.total,
                }
                res.status(200).json({
                    status: true,
                    message: 'Users listed successfully.',
                    data: data,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Unable to list employees.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(422).json({
                status: false,
                message: 'Failed to list employees.',
                errors: error,
            })
        }
    }

    /**
     * Delete User
     *
     * @swagger
     * /user/delete:
     *   post:
     *     tags:
     *       - User
     *     summary: Delete User
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
     *                 type: string
     *                 description: Enter id
     *     responses:
     *       200:
     *         description: Success
     *       422:
     *         description: Unprocessable Entity
     *       401:
     *         description: Unauthenticated
     */
    async deleteUser(req, res) {
        const { id } = req.body
        const employeeRequest = new DeleteUserRequest({ id })
        try {
            const validatedData = await employeeRequest.validate()
            const employeeData = await employeeRepo.getUser(id)
            if (employeeData.profile_pic_path) {
                deleteFile(employeeData.profile_pic_path)
            }
            const deleteUser = await employeeRepo.deleteUser(
                validatedData.id,
            )
            if (deleteUser) {
                io.emit('user-delete', validatedData.id)
                res.status(200).json({
                    status: true,
                    message: 'User deleted successfully.',
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Unable to delete user',
                })
            }
        } catch (error) {
            res.status(422).json({
                status: false,
                message: 'Unable to delete user',
                errors: error,
            })
        }
    }

    /**
     * Get My Profile
     *
     * @swagger
     * /user/get_my_profile:
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

    /**
     * Update Profile
     *
     * @swagger
     * /user/update_my_profile:
     *   post:
     *     tags:
     *       - User
     *     security:
     *       - bearerAuth: []
     *     summary: Update my profile
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: Enter name
     *               email:
     *                 type: string
     *                 description: Enter email
     *               country_code:
     *                 type: string
     *                 description: Enter country code(+971)
     *               country_uni_code:
     *                 type: string
     *                 description: Enter country uni code(ae)
     *               phone:
     *                 type: string
     *                 description: Enter phone
     *     responses:
     *       200:
     *         description: Success
     *       422:
     *         description: Unprocessable Entity
     *       401:
     *         description: Unauthenticated
     */
    async updateProfile(req, res) {
        const { name, email, phone, country_code, country_unicode } = req.body
        const employeeRequest = new UpdateMyProfileRequest({
            id: req.session.user.id,
            name,
            email,
            phone,
            country_code,
            country_unicode,
        })

        try {
            const validatedData = await employeeRequest.validate()

            const updatedProfile = await employeeRepo.updateUser(
                validatedData,
            )
            if (updatedProfile) {
                const employeeData = await UserResponse.format(
                    updatedProfile,
                )
                io.emit('user-update', employeeData)

                res.status(200).json({
                    status: true,
                    message: 'Profile updated successfully.',
                    data: employeeData,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Unable to update profile.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(200).json({
                status: false,
                message: 'Unable to update profile.',
                errors: error,
            })
        }
    }

    /**
     * Update User profile pic
     *
     * @swagger
     * /user/update_profile_picture:
     *   post:
     *     tags:
     *       - User
     *     summary: Update profile picture
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *                 description: Enter id
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Enter profile image link
     *     responses:
     *       200:
     *         description: Success
     *       400:
     *         description: Bad Request
     *       500:
     *         description: Internal Server Error
     */
    async updateProfilePicture(req, res) {
        for (const fieldName in req.files) {
            if (Object.hasOwnProperty.call(req.files, fieldName)) {
                const fileArray = req.files[fieldName]
                for (const file of fileArray) {
                    const folderName = 'employees'

                    const uploadedFile = await uploadFile(file, folderName)
                    if (uploadedFile.path) {
                        req.body.file = uploadedFile.path
                    }
                }
            }
        }
        const { id, file } = req.body

        if (!req.body.file === undefined) {
            res.status(200).json({
                status: false,
                message: 'Failed to upload image',
                data: [],
            })
        }
        const employeeRequest = new UpdateProfilePictureRequest({
            id,
            file,
        })
        try {
            await employeeRequest.validate()
            const employeeData = await employeeRepo.getUser(req.body.id)
            if (
                employeeData.profile_pic_path != file &&
                employeeData.profile_pic_path !== undefined
            ) {
                deleteFile(employeeData.profile_pic_path)
            }
            employeeData.profile_pic_path = file
            const updatedProfile = await employeeRepo.updateUser(
                employeeData,
            )
            if (updatedProfile) {
                const employeeDetails = await UserResponse.format(
                    employeeData,
                )
                io.emit('user-update', employeeDetails)

                res.status(200).json({
                    status: true,
                    message: 'Profile picture updated successfully.',
                    data: employeeDetails,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Failed to update profile picture.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(422).json({
                status: false,
                message: 'Failed to update profile picture.',
                errors: error,
            })
        }
    }

    /**
     * Change Role
     *
     * @swagger
     * /user/change_role:
     *   post:
     *     tags:
     *       - User
     *     security:
     *       - bearerAuth: []
     *     summary: User change role
     *     produces:
     *       - application/json
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *                 description: Enter user id
     *               role:
     *                 type: string
     *                 description: Enter new role id
     *     responses:
     *       200:
     *         description: Success
     *       422:
     *         description: Unprocessable Entity
     *       401:
     *         description: Unauthenticated
     */
    async changeRole(req, res) {
        const { id, role } = req.body
        const employeeRequest = new UpdateRoleRequest({
            id: id,
            role: role,
        })
        try {
            const validatedData = await employeeRequest.validate()
            const updatedProfile = await employeeRepo.updateUser({
                id: validatedData.id,
                role_id: validatedData.role,
            })
            if (updatedProfile) {
                const employeeData = await UserResponse.format(
                    updatedProfile,
                )
                io.emit('user-update', employeeData)

                res.status(200).json({
                    status: true,
                    message: 'Role changed successfully.',
                    data: employeeData,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Unable to change role.',
                    data: [],
                })
            }
        } catch (error) {
            res.status(200).json({
                status: false,
                message: 'Unable to change role.',
                errors: error,
            })
        }
    }

    /**
     * Change User Status (Active/Inactive)
     *
     * @swagger
     * /user/change-status:
     *   post:
     *     tags:
     *       - User
     *     summary: Change User Status (Active/Inactive)
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
     *                 type: string
     *                 description: Enter id
     *             status:
     *                 type: boolean
     *                 description: Enter status (true/false)
     *     responses:
     *       200:
     *         description: Success
     *       422:
     *         description: Unprocessable Entity
     *       401:
     *         description: Unauthenticated
     */
    async changeUserStatus(req, res) {
        const { id, status } = req.body
        const employeeRequest = new ChangeUserStatusRequest({ id, status })
        try {
            const validatedData = await employeeRequest.validate()

            const updateStatusUser =
                await employeeRepo.changeUserStatus(validatedData.id)

            if (updateStatusUser) {
                const employeeData = await UserResponse.format(
                    updateStatusUser,
                )
                io.emit('user-update', employeeData)
                res.status(200).json({
                    status: true,
                    message: 'User updated successfully.',
                    data: employeeData,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Unable to update user',
                    data: [],
                })
            }
        } catch (error) {
            res.status(200).json({
                status: false,
                message: 'Unable to update user',
                errors: error,
            })
        }
    }

    
}
