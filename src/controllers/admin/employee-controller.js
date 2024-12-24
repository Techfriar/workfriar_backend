import UserRepository from "../../repositories/user-repository.js";
import { uploadFile } from "../../utils/uploadFile.js";
import RoleRepository from "../../repositories/admin/role-repository.js";
import EmployeeRequest from "../../requests/admin/add-employee-request.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

const userRepo = new UserRepository();
const employeeRequest = new EmployeeRequest();
class EmployeeController {
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
   *               role_id:
   *                 type: string
   *                 description: Role of the employee
   *                 example: Manager
   *               reporting_manager_id:
   *                 type: string
   *                 description: Reporting manager's user ID
   *                 example: 607d1f77bcf86cd799439011
   *               phone_number:
   *                 type: string
   *                 description: users phone Number
   *                 example: 9087886467
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

  async addEmployees(req, res) {
    try {
      const {
        name,
        email,
        role_id,
        reporting_manager_id,
        phone_number,
        location,
        status,
      } = req.body;
      const validationResult = await employeeRequest.validateEmployee(req.body);
      if (!validationResult.isValid) {
        throw new CustomValidationError(validationResult.errors);
      }
      let fileurl = " ";
      if (req.files?.profile_pic) {
        const fileArray = Array.isArray(req.files.profile_pic)
          ? req.files.profile_pic
          : [req.files.profile_pic];
        for (const file of fileArray) {
          const uploadedFile = await uploadFile(file);
          if (uploadedFile?.path) {
            fileurl = uploadedFile.path;
          }
        }
      }
      const isAdminResult = await userRepo.checkPermission(role_id);
      const isAdmin = isAdminResult.status;
      const isactive = status === "active";

      const data = await userRepo.addEmployees(
        name,
        email,
        reporting_manager_id,
        phone_number,
        isAdmin,
        location,
        isactive,
        fileurl
      );

      if (data.status) {
        const roleData = await RoleRepository.addUsersToRole(role_id, [
          data.data._id,
        ]);
        if (roleData.status) {
          return res.status(200).json({
            status: true,
            message: "Employee added successfully",
            data: data.data,
          });
        } else {
          return res.status(400).json({
            status: false,
            message: "Failed to add employee to role",
            data: [],
          });
        }
      } else {
        return res.status(400).json({
          status: false,
          message: "Failed to add employee",
          data: [],
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation Error",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
        errors: error,
      });
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
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               department:
   *                 type: string
   *                 description: The department name.
   *                 example: "Technical"
   *     responses:
   *       200:
   *         description: Roles fetched successfully.
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
   *         description: Bad request, department name is missing or invalid.
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
   *         description: Internal server error.
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

  async getRoles(req, res) {
    const { department } = req.body;

    try {
      const data = await userRepo.getRoles(department);
      if (data.status) {
        res.status(200).json({
          status: true,
          message: "Roles fetched successfully",
          data: data.data,
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Failed to fetch roles",
          data: [],
        });
      }
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        errors: error,
      });
      throw new Error(error);
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
   *               role_id:
   *                 type: string
   *                 description: Role of the employee
   *                 example: Manager
   *               reporting_manager_id:
   *                 type: string
   *                 description: Reporting manager's user ID
   *                 example: 607d1f77bcf86cd799439011
   *               phone_number:
   *                 type: string
   *                 description: users phone Number
   *                 example: 9087886467
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
    const {
      id,
      name,
      email,
      role_id,
      phone_number,
      reporting_manager_id,
      location,
      status,
    } = req.body;
    let fileurl = "";
    let oldProfilePic = null;
    let newProfilePic = null;
    let isAdmin, isactive, isAdminResult;

    try {
      // Validate request
      const validationResult = await employeeRequest.validateEmployeeEdit(
        req.body
      );
      if (!validationResult.isValid) {
        throw new CustomValidationError(validationResult.errors);
      }

      // Get existing employee to store the profile picture path
      const oldEmployee = await userRepo.getEmployeeById(id);
      if (!oldEmployee) {
        return res.status(404).json({
          status: false,
          message: "Employee not found",
          data: null,
        });
      }

      // Store the old profile picture path if it exists
      oldProfilePic = oldEmployee.profile_pic;

      // Check role permissions
      if (role_id) {
        isAdminResult = await userRepo.checkPermission(role_id);
        isAdmin = isAdminResult.status;
        isactive = status === "active";
      }

      // Handle file upload if there's a new profile picture
      if (req.files?.employee_profile) {
        try {
          const fileArray = Array.isArray(req.files.employee_profile)
            ? req.files.employee_profile
            : [req.files.employee_profile];

          for (const file of fileArray) {
            // Upload the new file first
            const uploadedFile = await uploadFile(file, "employee-profiles");

            if (uploadedFile?.path) {
              newProfilePic = uploadedFile.path;
              fileurl = uploadedFile.path;

              // Only delete the old profile picture if we have successfully uploaded the new one
              if (oldProfilePic) {
                try {
                  await deleteFile(oldProfilePic);
                } catch (deleteError) {
                  console.error(
                    "Error deleting old profile picture:",
                    deleteError
                  );
                  // Continue with the update even if deletion fails
                }
              }
              break;
            }
          }
        } catch (uploadError) {
          throw new CustomValidationError({
            employee_profile: [
              `Failed to upload new profile picture: ${uploadError.message}`,
            ],
          });
        }
      }

      // Prepare update data
      const updateData = {
        ...(name && { full_name: name }),
        ...(email && { email }),
        ...(reporting_manager_id && {
          reporting_manager: reporting_manager_id,
        }),
        ...(phone_number && { phone_number }),
        ...(location && { location }),
        ...(status && { status }),
        ...(fileurl && { profile_pic: fileurl }),
        status: isactive,
        isAdmin: isAdmin,
      };

      // Update employee
      const updatedEmployee = await userRepo.updateEmployee(id, updateData);

      if (!updatedEmployee) {
        // If update fails and we uploaded a new file, clean up the new file
        if (newProfilePic) {
          try {
            await deleteFile(newProfilePic);
          } catch (cleanupError) {
            console.error(
              "Error cleaning up new profile picture after failed update:",
              cleanupError
            );
          }
        }

        return res.status(404).json({
          status: false,
          message: "Employee not found",
          data: null,
        });
      }

      // Handle role update
      if (role_id) {
        await RoleRepository.removeUserFromAllRoles(id);
        const roleData = await RoleRepository.addUsersToRole(role_id, [
          updatedEmployee.data._id,
        ]);

        if (!roleData.status) {
          return res.status(400).json({
            status: false,
            message: "Failed to update employee role",
            data: updatedEmployee,
          });
        }
      }

      res.status(200).json({
        status: true,
        message: "Employee updated successfully",
        data: updatedEmployee,
      });
    } catch (error) {
      // If there was an error and we uploaded a new file, clean it up
      if (newProfilePic) {
        try {
          await deleteFile(newProfilePic);
        } catch (cleanupError) {
          console.error(
            "Error cleaning up new profile picture after error:",
            cleanupError
          );
        }
      }

      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation Failed",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}
export default EmployeeController;
