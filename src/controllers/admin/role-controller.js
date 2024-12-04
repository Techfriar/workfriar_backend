import RoleRepository from "../../repositories/role-repository.js";
import RoleRequest from "../../requests/admin/role-request.js";
import Permission from "../../models/permission.js";
import Role from "../../models/role.js";

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
 *                       example: ["view", "create", "edit", "delete"]
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

            console.log(validatedData, 'validatedData');
            
            // Validate role and department
            if (!role || !department) {
                return res.status(400).json({ message: "Role and department are required." });
            }

            // Step 1: Process permissions
            const permissionIds = await Promise.all(
                permissions.map(async (permission) => {
                    const { category, actions } = permission;

                    // Check if the permission already exists
                    let existingPermission = await Permission.findOne({ category });

                    if (existingPermission) {
                        // Only add actions if "view" is present in existing actions
                        if (!existingPermission.actions.includes("view")) {
                            throw new Error(
                                `Cannot add actions to permission "${category}" without the "view" action.`
                            );
                        }

                        // Merge actions, ensuring no duplicates
                        const updatedActions = Array.from(
                            new Set([...existingPermission.actions, ...actions])
                        );

                        // Update the permission in the database
                        existingPermission.actions = updatedActions;
                        await existingPermission.save();

                        return existingPermission._id;
                    } else {
                        // Create a new permission if it doesn't exist
                        const newPermission = await Permission.create(permission);
                        return newPermission._id;
                    }
                })
            );

            // Step 2: Create the role with the associated permissions
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
            console.error(error);
            res.status(500).json({ 
                status: false,
                message: 'Error creating role', 
                data: []
            });
        }
    }
    
    async mapRole(req, res) {
        try {
            const { roleId, userIds } = req.body;

            await RoleRequest.validateMapUsersToRole(roleId, userIds);
            const updatedRole = await RoleRepository.addUsersToRole(roleId, userIds);
           
            res.status(200).json({
                status: true,
                message: "Role mapped successfully",
                data: updatedRole
            })
        } catch (error) {
            if (error.name === 'ValidationError') {
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
    
}