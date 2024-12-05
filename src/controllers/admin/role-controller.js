import RoleRepository from "../../repositories/admin/role-repository.js";
import RoleRequest from "../../requests/admin/role-request.js";
import Permission from "../../models/permission.js";
import Role from "../../models/role.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import RoleResponse from "../../responses/role-responses.js";

export default class RoleController {
    
/**
 * Create Role
 *
 * @swagger
 * /admin/add-role:
 *   post:
 *     tags:
 *       - Role
 *     summary: Create a new role
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
 *             required:
 *               - role
 *               - department
 *             optional:
 *               - permissions
 *             properties:
 *               role:
 *                 type: string
 *                 example: "Project Manager"
 *               department:
 *                 type: string
 *                 enum: [Management, Finance, HR, Operations, Technical]
 *                 example: "Management"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - category
 *                     - actions
 *                   properties:
 *                     category:
 *                       type: string
 *                       example: "projects"
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["view", "review", "edit", "delete"]
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
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
 *                   example: "Role created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64b7a1234cdef567890ab123"
 *                       role:
 *                         type: string
 *                         example: "Project Manager"
 *                       department:
 *                         type: string
 *                         example: "Management"
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["64b7a1234cdef567890ab124", "64b7a1234cdef567890ab125"]
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-07-19T10:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-07-19T10:00:00.000Z"
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthenticated
 *       500:
 *         description: Internal Server Error
 */
    
    async createRole(req, res) {
        try {   
            const validatedData = await RoleRequest.validateCreateRole(req.body);

            const { role, department, permissions, status } = validatedData;

            //Process permissions
            const permissionIds = await Promise.all(
                permissions.map(async (permission) => {  
                    // Create a new permission if it doesn't exist
                    const newPermission = await Permission.create(permission);
                    return newPermission._id;    
                })
            );

            //Create the role with the associated permissions
            const newRole = await Role.create({
                role,
                department,
                permissions: permissionIds,
                status,
            });

            // Respond with the created role
            res.status(201).json({
                status: true,
                message: 'Role created successfully',
                date: [newRole],
            });
        } catch (error) {

            if(error instanceof CustomValidationError) {
                return res.status(400).json({
                    status: false,
                    message: error.message,
                    data: []
                })
            }
            return res.status(500).json({ 
                status: false,
                message: 'Error creating role', 
                data: []
            });
        }
    }
    
/**
 * Map Users to Role
 *
 * @swagger
 * /admin/map-role:
 *   post:
 *     tags:
 *       - Role
 *     summary: Map users to a role
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
 *             required:
 *               - roleId
 *               - userIds
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "674d7882d16f166e7fc2979e"
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64b7a1234cdef567890ab124", "64b7a1234cdef567890ab125"]
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
 *                   example: "Role mapped successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64b7a1234cdef567890ab123"
 *                     role:
 *                       type: string
 *                       example: "Project Manager"
 *                     department:
 *                       type: string
 *                       example: "Management"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["64b7a1234cdef567890ab126", "64b7a1234cdef567890ab127"]
 *                     users:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["64b7a1234cdef567890ab124", "64b7a1234cdef567890ab125"]
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-07-19T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-07-19T11:00:00.000Z"
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthenticated
 *       500:
 *         description: Internal Server Error
 */
    async mapRole(req, res) {
        try {
            const { roleId, userIds } = await RoleRequest.validateMapUsersToRole(req.body);

            const updatedRole = await RoleRepository.addUsersToRole(roleId, userIds);
           
            res.status(200).json({
                status: true,
                message: "Role mapped successfully",
                data: updatedRole
            })
        } catch (error) {
            if (error instanceof CustomValidationError) {
                return res.status(400).json({
                    status: false,
                    message: error.message,
                    data: []
                })
            }
            res.status(500).json({ 
                status: false,
                message: 'Error mapping role', 
                data: []
            });
        }
    }

/**
 * View All Roles
 *
 * @swagger
 * /admin/all-roles:
 *   post:
 *     tags:
 *       - Role
 *     summary: Retrieve all roles
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
 *                   example: "Roles fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64b7a1234cdef567890ab123"
 *                       role:
 *                         type: string
 *                         example: "Project Manager"
 *                       department:
 *                         type: string
 *                         example: "Management"
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             category:
 *                               type: string
 *                               example: "Projects"
 *                             actions:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["view", "edit", "delete"]
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-07-19T10:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-07-19T10:00:00.000Z"
 *       401:
 *         description: Unauthenticated
 *       500:
 *         description: Internal Server Error
 */
    async viewAllRoles(req, res) {
        try {
            const roles = await RoleRepository.getAllRoles();
            const formattedRoles = await Promise.all(roles.map(async(roles) => await RoleResponse.formatRole(roles)))
            res.status(200).json({
                status: true,
                message: "Roles fetched successfully",
                data: formattedRoles
            })
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error fetching roles',
                data: []
            });
        }
    }

/**
 * Delete Role
 *
 * @swagger
 * /admin/delete-role:
 *   post:
 *     tags:
 *       - Role
 *     summary: Delete a role
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
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "64b7a1234cdef567890ab123"
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
 *                   example: "Role deleted successfully"
 *                 data:
 *                   type: array
 *                   example: []
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid role ID"
 *                 data:
 *                   type: array
 *                   example: []
 *       401:
 *         description: Unauthenticated
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error deleting role"
 *                 data:
 *                   type: array
 *                   example: []
 */
    async deleteRole (req, res) {
        try {
            const { roleId } = await RoleRequest.validateDeleteRole(req.body);

            await RoleRepository.deleteRole(roleId);

            res.status(200).json({
                status: true,
                message: "Role deleted successfully",
                data: []
            })
        } catch (error) {
            if (error instanceof CustomValidationError) {
                return res.status(400).json({
                    status: false,
                    message: error.message,
                    data: []
                })
            }
            res.status(500).json({
                status: false,
                message: 'Error deleting role',
                data: []
            });
        }
    }
}