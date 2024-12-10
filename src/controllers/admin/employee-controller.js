import UserRepository from "../../repositories/user-repository.js"
import uploadFile from "../../utils/uploadFile.js"
import RoleRepository from "../../repositories/admin/role-repository.js"
import EmployeeRequest from "../../requests/admin/add-employee-request.js"
import { CustomValidationError } from "../../exceptions/custom-validation-error.js"

const userRepo = new UserRepository()
const employeeRequest=new EmployeeRequest()
class EmployeeController{

/**
 * @swagger
 * /admin/addemployee:
 *   post:
 *     summary: Add a new employee
 *     description: This endpoint allows you to add a new employee to the system, including uploading a profile picture, checking their role permissions, and assigning them to the relevant role.
 *     tags:
 *       - Employees
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the employee
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: Email of the employee
 *                 example: john.doe@example.com
 *               role:
 *                 type: string
 *                 description: Role of the employee
 *                 example: Manager
 *               reporting_manager:
 *                 type: string
 *                 description: Reporting manager's user ID
 *                 example: 607d1f77bcf86cd799439011
 *               location:
 *                 type: string
 *                 description: Location of the employee
 *                 example: New York
 *               status:
 *                 type: string
 *                 enum: ['active', 'inactive']
 *                 description: Employment status of the employee
 *                 example: active
 *               profile_pic:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture of the employee (file upload)
 *     responses:
 *       200:
 *         description: Employee added successfully and role assignment successful
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
 *                   example: Employee added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 607d1f77bcf86cd799439012
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *       400:
 *         description: Bad request or failed to add employee or role assignment
 *       422:
 *         description: Validation error due to invalid data
 *       500:
 *         description: Internal Server Error
 */



    async addEmployees(req,res)
    {
        const {name,email,role,reporting_manager,location,status}=req.body
        const validationResult = await employeeRequest.validateEmployee(req.body);
        if (!validationResult.isValid) {
            throw new CustomValidationError(validationResult.message);
        }
        let fileurl=" "
        try
        {
            
        if (req.files?.profile_pic) {
            const fileArray = Array.isArray(req.files.profile_pic)? req.files.profile_pic: [req.files.profile_pic];
            for (const file of fileArray) {
            const uploadedFile = await uploadFile(file);
            if (uploadedFile?.path) {
            fileurl =uploadedFile.path;
        }
        }
        }
         const isAdminResult=await userRepo.checkPermission(role)
         const isAdmin=isAdminResult.status
        const isactive=status==="active"?true:false
     
        const data=await userRepo.addEmployees(name,email,reporting_manager,isAdmin,location,isactive,fileurl)


        if(data.status)
        {
            const roleData=await RoleRepository.addUsersToRole(role,[data.data._id])
            if(roleData.status)
            {
                res.status(200).json({
                    status:true,
                    message:"Employee added successfully",
                    data:data.data
                })
            }else
            {
                res.status(400).json({
                    status:false,
                    message:"Failed to add employee to role",
                    data:[]
                })
            }
        }
        else
        {
            res.status(400).json({
                status:false,
                message:"Failed to add employee",
                data:[]
            })
        }   
        }
        catch(error)
        {
            if(error instanceof CustomValidationError)
            {
                res.status(422).json({
                    status:false,
                    message:error.message,
                    errors:error.errors
                })
            }
            res.status(500).json({
                status:false,
                message:"Internal Server Error",
                errors:error
            })
        }
    }

/**
 * @swagger
 * /admin/getroles:
 *   post:
 *     summary: Fetch roles for a given department
 *     description: This endpoint allows you to fetch roles within a specified department.
 *     tags:
 *       - Employees
 *     parameters:
 *       - in: body
 *         name: department
 *         description: Department for which roles are to be fetched
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             department:
 *               type: string
 *               description: Department name to get roles for
 *               example: "Technical"
 *     responses:
 *       200:
 *         description: Successfully fetched roles for the department
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
 *                       role:
 *                         type: string
 *                         example: "Manager"
 *                       department:
 *                         type: string
 *                         example: "Technical"
 *       400:
 *         description: Failed to fetch roles
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
 *                   example: "Failed to fetch roles"
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
 *                   example: "Internal Server Error"
 *                 errors:
 *                   type: string
 *                   example: "Error details"
 */

    async getRoles(req,res)
    {
        const {department}=req.body
        try
        {
            const data=await userRepo.getRoles(department)
            if(data.status)
            {
                res.status(200).json({
                    status:true,
                    message:"Roles fetched successfully",
                    data:data.data
                })
            }
            else
            {
                res.status(200).json({
                    status:false,
                    message:"Failed to fetch roles",
                    data:[]
                })
            }
        }
        catch(error)
        {
            res.status(500).json({
                status:false,
                message:"Internal Server Error",
                errors:error
            })
            throw new Error(error)
        }
    }

/**
 * @swagger
 * /admin/editemployee:
 *   post:
 *     summary: Edit an existing employee
 *     description: This endpoint allows you to edit an existing employee's information, including updating their profile picture, role, and other details.
 *     tags:
 *       - Employees
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the employee to edit
 *                 example: 607d1f77bcf86cd799439012
 *               name:
 *                 type: string
 *                 description: Full name of the employee
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: Email of the employee
 *                 example: john.doe@example.com
 *               role:
 *                 type: string
 *                 description: Role of the employee
 *                 example: Manager
 *               reporting_manager:
 *                 type: string
 *                 description: Reporting manager's user ID
 *                 example: 607d1f77bcf86cd799439011
 *               location:
 *                 type: string
 *                 description: Location of the employee
 *                 example: New York
 *               status:
 *                 type: string
 *                 enum: ['active', 'inactive']
 *                 description: Employment status of the employee
 *                 example: active
 *               profile_pic:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture of the employee (optional file upload)
 *     responses:
 *       200:
 *         description: Employee updated successfully and role assignment successful
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
 *                   example: Employee updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 607d1f77bcf86cd799439012
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *       400:
 *         description: Bad request or failed to update employee or role assignment
 *       422:
 *         description: Validation error due to invalid data
 *       500:
 *         description: Internal Server Error
 */

async editEmployee(req, res) {
    const { id, name, email, role, reporting_manager, location, status } = req.body;
    let fileurl="";

    try {
        const validationResult = await employeeRequest.validateEmployeeEdit(req.body);
        if (!validationResult.isValid) {
            throw new CustomValidationError(validationResult.message);
        }

        const isAdminResult=await userRepo.checkPermission(role)
        const isAdmin=isAdminResult.status
       const isactive=status==="active"?true:false

        if (req.files?.employee_profile) {
            const fileArray = Array.isArray(req.files.employee_profile)
                ? req.files.employee_profile
                : [req.files.employee_profile];
            
            for (const file of fileArray) {
                const uploadedFile = await uploadFile(file);
                if (uploadedFile?.path) {
                    fileurl = uploadedFile.path;
                    break;
                }
            }
        }
        const updateData = {};
        if (name) updateData.full_name = name;
        if (email) updateData.email = email;
        if (reporting_manager) updateData.reporting_manager = reporting_manager;
        if (location) updateData.location = location;
        if (status) updateData.status = status;
        if (fileurl) updateData.profile_pic = fileurl;
        updateData.status=isactive;
        updateData.isAdmin=isAdmin;
     
        const updatedEmployee = await userRepo.updateEmployee(id, updateData);

        if (!updatedEmployee) {
            return res.status(404).json({
                status: false,
                message: "Employee not found",
                data: null
            });
        }
        if (role) {
            await RoleRepository.removeUserFromAllRoles(id);

            const roleData=await RoleRepository.addUsersToRole(role,[updatedEmployee.data._id])

            if (!roleData.status) {
                return res.status(400).json({
                    status: false,
                    message: "Failed to update employee role",
                    data: updatedEmployee
                });
            }
        }

        res.status(200).json({
            status: true,
            message: "Employee updated successfully",
            data: updatedEmployee
        });

    } catch (error) {
      
        if (error instanceof CustomValidationError) {
            return res.status(422).json({
                status: false,
                message: error.message,
                errors: error.errors
            });
        }
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            errors: error.message
        });
    }
}
}
export default EmployeeController