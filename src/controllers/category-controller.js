import CategoryRepository from "../repositories/admin/category-repository.js";
import CategoryResponse from "../responses/category-response.js";
import CreateCategoryRequest from "../requests/admin/category-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";

const categoryRepo = new CategoryRepository();
const categoryResponse = new CategoryResponse();
const createCategoryRequest = new CreateCategoryRequest();

export default class CategoryController {
    /**
     * @swagger
     * tags:
     *   name: Categories
     *   description: API for managing categories
     */

    /**
     * Add Category
     * 
     * @swagger
     * /admin/addcategory:
     *   post:
     *     summary: Create a new category
     *     tags: [Categories]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               category:
     *                 type: string
     *                 example: "Bug Fixing"
     *               timeentry:
     *                 type: string
     *                 example: "Open Entry"
     *     responses:
     *       201:
     *         description: Category created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                 category:
     *                   type: string
     *                 timeentry:
     *                   type: string
     *                 createdAt:
     *                   type: string
     *                 updatedAt:
     *                   type: string
     *       400:
     *         description: Validation error
     *       500:
     *         description: Server error
     */

    async addCategory(req, res) {
        try {
            const { category, timeentry } = req.body
            const validationResult = await createCategoryRequest.validateCategory(category,timeentry);
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message);
            }
            const newCategory = await categoryRepo.createCategory(category, timeentry);
            if(newCategory)
            {
                const  data=await categoryResponse.formattedResponse(newCategory)
                res.status(200).json(
                    {
                        status:true,
                        message:"Category Added Successfully",
                        data:data,
                    })
            }
            else
            {
                res.status(422).json(
                    {
                        status:false,
                        message:"Failed to Add Category",
                        data:[],
                    })
            }
          
        } catch (error) {
            
                if (error instanceof CustomValidationError) {
                    return res.status(422).json({
                        status: false,
                        message: "Validation Failed",
                        errors: error.errors, 
                    });
                } else {
                    return res.status(500).json({
                        status: false,
                        message: "Internal Server Error",
                        errors: error.message || error,
                    });
                
            }
        }
    }

    /**
     * Get All Categories
     * 
     * @swagger
     * /user/getcategories:
     *   post:
     *     summary: Retrieve all categories
     *     tags: [Categories]
     *     responses:
     *       200:
     *         description: Successfully retrieved all categories
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   _id:
     *                     type: string
     *                   category:
     *                     type: string
     *                   timeentry:
     *                     type: string
     *                   createdAt:
     *                     type: string
     *                   updatedAt:
     *                     type: string
     *       500:
     *         description: Server error
     */

   
    async getCategories(req,res) {
        try {
            const data = await categoryRepo.getAllCategories()
            if (data.length === 0) {
                res.status(422).json({
                    status:false,
                    message:"No Category Found",
                    data:[],
                })
                return
            }
            else
            {
                const formattedData=await categoryResponse.formatCategorySet(data)  
                res.status(200).json({
                    status:true,
                    message:"Categories",
                    data:formattedData,
                })
            }
        } catch (error) {
                res.status(500).json(
                {
                    status:false,
                    message:"Internal Server Error",
                    data:[],
                })
        }
    }
/**
 * Update category details (time entry or category)
 * 
 * @swagger
 * /admin/updatecategories/{id}:
 *   put:
 *     summary: Update a category's time entry, category name, or both
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: The name of the category
 *                 example: Work
 *               timeentry:
 *                 type: string
 *                 enum: [Open Entry, Close Entry]
 *                 description: The time entry type for the category
 *                 example: Open Entry
 *             oneOf:
 *               - required: [category]
 *               - required: [timeentry]
 *     responses:
 *       200:
 *         description: Successfully updated the category
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
 *                   example: "Category updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "637a9b6c1234567890abcdef"
 *                     category:
 *                       type: string
 *                       example: "Work"
 *                     timeentry:
 *                       type: string
 *                       example: "Open Entry"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-20T12:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-25T12:00:00.000Z"
 *       400:
 *         description: Invalid request or validation error (e.g., empty payload)
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
 *                   example: "No data provided for update"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Category not found
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
 *                   example: "Category not found"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */

async updateCategories(req, res) {
    try {
        const { id } = req.params; 
        const updateFields = req.body; 
        const validationResult = await createCategoryRequest.validateUpdateCategory(updateFields);
        if (!validationResult.isValid) {
            throw new CustomValidationError(validationResult.message);
        }
        if (updateFields.timeentry) {
            updateFields.time_entry = updateFields.timeentry;
            delete updateFields.timeentry; 
        }
        const updatedData = await categoryRepo.updateCategory(updateFields, id);

        if (updatedData) {
            const data = await categoryResponse.formattedResponse(updatedData);
            return res.status(200).json({
                status: true,
                message: "Category updated successfully",
                data: data,
            });
        } else {
            return res.status(404).json({
                status: false,
                message: "Category not found or update failed",
                data: [],
            });
        }
    } catch (error) {
            if (error instanceof CustomValidationError) {
                return res.status(422).json({
                    status: false,
                    message: "Validation Failed",
                    errors: error.errors,
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: "Internal Server Error",
                    errors: error.message || error,
                });
            }
    }
}

}
