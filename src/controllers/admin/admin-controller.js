import { CustomValidationError } from '../../exceptions/custom-validation-error.js'
import RoleRepository from '../../repositories/admin/role-repository.js'
import EmailRepository from '../../repositories/email-repository.js'
import UserRepository from '../../repositories/user-repository.js'
import AddUserRequest from '../../requests/admin/add-employee-request.js'
import FetchEmployeeRequest from '../../requests/admin/fetch-employee-request.js'
import GetUserRequest from '../../requests/admin/fetch-employee-request.js'
import RoleRequest from '../../requests/admin/role-request.js'
import UserResponse from '../../responses/user-response.js'
import bcryptPassword from '../../utils/bcryptPassword.js'
import capitalizeWords from '../../utils/capitalizeWords.js'

const employeeRepo = new UserRepository()
const userRepo = new UserRepository()
const emailRepo = new EmailRepository()

export default class AdminController {
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
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *       properties:
     *         userId:
     *         type: string
     *         description: Enter user id
     *     description: Get my profile
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
			let UserId = req.session.user.id;

            // check if user id passed through request
            if(req.body.userId) {
                UserId = req.body.id
            }

            const adminData = await userRepo.getUserExpanded( UserId )

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
 * List All Employees Data
 *
 * @swagger
 * /admin/employees-data:
 *   post:
 *     tags:
 *       - Admin
 *     summary: List All Employees Data with pagination
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tabKey:
 *                  type: string
 *                  example: Operations
 *               page:
 *                 type: integer
 *                 description: Page number (default 1)
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of items per page (default 10)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employees fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64b7a1234cdef567890ab123"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       role:
 *                         type: string
 *                         example: "Manager"
 *                       department:
 *                         type: string
 *                         example: "Human Resources"
 *                       reporting_manager:
 *                         type: string
 *                         example: "Jane Smith"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *                       profile_pic: 
 *                         type: string
 *                         example: "http://example-imgsc.URL_ADDRESS" 
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 100
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */


    async listAllEmployeesData(req, res) {
        try {
            const page = parseInt(req.body.page) || 1;
            const limit = parseInt(req.body.limit) || 10;
            const skip = (page - 1) * limit;

            let department = req.body.tabKey

            if(!department || department == "all") department = null
            else department = capitalizeWords(department)

            // Fetch total count of employees
            const totalItems = await userRepo.countAllUsers(department);
           
            // Fetch all employees from the database
            const employees = await userRepo.getAllUsers(skip, limit, department); // Replace with your repository function

            if (employees && employees.length > 0) {
                // Format employee data if required
                const formattedEmployees = await Promise.all(employees.map(employee => UserResponse.formatEmployee(employee)));

                // Calculate total pages
                const totalPages = Math.ceil(totalItems / limit);

                res.status(200).json({
                    status: true,
                    message: "Employees fetched successfully.",
                    data: formattedEmployees,
                    pagination: {
                        totalItems,
                        currentPage: page,
                        pageSize: limit,
                        totalPages
                    }
                });
            } else {
                res.status(200).json({
                    status: false,
                    message: "No employees found.",
                    data: [],
                    pagination: {
                        totalItems: 0,
                        currentPage: page,
                        pageSize: limit,
                        totalPages: 0
                    }
                });
            }
        } catch (error) {
                        
            res.status(422).json({
                status: false,
                message: "Failed to fetch employees.",
                date: [],
                errors: error,
            });
        }
    }   

/**
 * List All Employees
 *
 * @swagger
 * /admin/list-all-employees:
 *   post:
 *     tags:
 *       - Admin
 *     summary: list All Employees
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employees fetched successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64b7a1234cdef567890ab123"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
    
    async listAllEmployees(req, res) {
        try {
            // Fetch all employees from the database
            const employees = await userRepo.getAllUsers(); // Replace with your repository function

            const formattedEmployees = await Promise.all(employees.map(employee => UserResponse.formatEmployeeForListing(employee)));

            res.status(200).json({
                status: true,
                message: "Employees fetched successfully.",
                data: formattedEmployees,
            });
        } catch (error) {
            res.status(422).json({
                status: false,
                message: "Failed to fetch employees.",
                errors: error,
            });
        }
    }

/**
 * Get Employee Details
 *
 * @swagger
 * /admin/employee-details:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Get Employee Details
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Employee ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee data fetched successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "674d80901b1320de33e2467f"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     phone_number:
 *                       type: string
 *                       example: "7123431323"
 *                     reporting_manager:
 *                       type: string
 *                     reporting_manager_id:
 *                       type: string
 *                       example: "1as23f31f2332a"   
 *                     role:
 *                       type: string
 *                       example: "Project Manager"
 *                     role_id:
 *                       type: string
 *                       example: "11sdd2123d213"
 *                     department:
 *                       type: string
 *                       example: "Operations"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     profile_pic_path:
 *                       type: string
 *                       example: "https://example.com/images/john-doe.jpg"
 *                     location:
 *                       type: string
 *                       example: "Dubai"
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

    async getEmployeeDetails(req, res) {
        const { id } = req.body
        try {
            const employeeData = await FetchEmployeeRequest.validateUserId( id )

            if (employeeData) {
                const employeeDetails = await UserResponse.formatEmployeeDetails(
                    employeeData,
                )
                res.status(200).json({
                    status: true,
                    message: 'Employee data fetched successfully.',
                    data: employeeDetails,
                })
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Failed to get employee.',
                    data: [],
                })
            }
        } catch (error) {
            if(error instanceof CustomValidationError) {
                return res.status(400).json({
                    status: false,
                    message: 'Failed to get employee.',
                    errors: error.errors,
                })
            }
            res.status(500).json({
                status: false,
                message: 'Failed to get employee.',
                errors: error,
            })
        }
    }

/**
 * Update Employee Role
 *
 * @swagger
 * /admin/update-employee-role:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Update Employee Role
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - newRole
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee to update
 *               newRole:
 *                 type: string
 *                 description: New role for the employee
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee role updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "674d80901b1320de33e2467f"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       example: "Senior Manager"
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Employee Not Found
 *       500:
 *         description: Internal Server Error
 */
    async updateEmployeeRole(req, res) {
        const { newRole: roleId, employeeId: userId } = req.body
        try {
            const UserData = await FetchEmployeeRequest.validateUserId( userId )

            if(UserData?.roles) {
                await RoleRepository.removeUserFromRole(UserData.roles[0]._id, userId)
            }
            const { roleId: validatedRoleId, userIds } = await RoleRequest.validateMapUsersToRole({ roleId, userIds: [userId] });

            const updatedRole = await RoleRepository.addUsersToRole(validatedRoleId, userIds);

            res.status(200).json({
                status: true,
                message: 'Employee role updated successfully.',
                data: updatedRole,
            });
        } catch (error) { 
            if(error instanceof CustomValidationError) {
                return res.status(400).json({
                    status: false,
                    message: 'Failed to update employee role.',
                    errors: error.errors,
                })
            }
            console.log(error);
            
            res.status(500).json({
                status: false,
                message: 'Failed to update employee role.',
                errors: error,
            })
        }

    }
 
/**
 * Delete Employee
 *
 * @swagger
 * /admin/delete-employee:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Delete an employee
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee to delete
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee deleted successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "674d80901b1320de33e2467f"
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Employee Not Found
 *       500:
 *         description: Internal Server Error
 */
    async deleteEmployee(req, res) {
        const { employeeId: id } = req.body
        try {
            await FetchEmployeeRequest.validateUserId( id )
 
            await userRepo.deleteUser(id)
            await RoleRepository.removeUserFromAllRoles(id)

            res.status(200).json({
                status: true,
                message: 'Employee deleted successfully.',
                data: [],
            })

        } catch (error) {
            if(error instanceof CustomValidationError) {
                return res.status(400).json({
                    status: false,
                    message: 'Failed to delete employee.',
                    errors: error.errors,
                })
            }
            res.status(500).json({
                status: false,
                message: 'Failed to delete employee.',
                errors: error,
            })
        }
    }

}
