import CategoryRepository from "../repositories/admin/category-repository.js";
import CategoryResponse from "../responses/category-response.js";
import CreateCategoryRequest from "../requests/admin/category-request.js";

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
     *                 time_entry:
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
                await categoryResponse.sendErrorResponse(res, validationResult.message);
                return
            }
            console.log("category and timeentry",category,timeentry)
            const data = await categoryRepo.createCategory(category, timeentry);
            await categoryResponse.sendSuccessResponse(res, data, "Category Created Successfully");
        } catch (error) {
            console.error("Error in addCategory:", error);
            await categoryResponse.sendErrorResponse(res, null, "Server Error");
        }
    }

    /**
     * Get All Categories
     * 
     * @swagger
     * /admin/getcategories:
     *   get:
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
     *                   time_entry:
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
                return categoryResponse.sendSuccessResponse(res, data, "No categories found");
            }
            await categoryResponse.sendSuccessResponse(res, data, "Categories retrieved successfully");
        } catch (error) {
            console.error("Error in getCategories:", error);
            await categoryResponse.sendErrorResponse(res, null, "Server Error");
        }
    }
/**
 * Update time entry for each category
 * 
 * @swagger
 * /admin/updatecategories/{id}:
 *   put:  # Use 'put' instead of 'post'
 *     summary: Update a category's time entry
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
 *               timeentry:
 *                 type: string
 *                 enum: [Open Entry, Close Entry]
 *                 example: Open Entry
 *     responses:
 *       200:
 *         description: Successfully updated the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
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
 *                     category:
 *                       type: string
 *                     time_entry:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Invalid request or validation error
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
    async updateCategories(req,res)
    {
        try
        {
            const {timeentry}=req.body
            const {id}=req.params
            const updatedData=await categoryRepo.updateCategory(timeentry,id)
            await categoryResponse.sendSuccessResponse(res,updatedData,"Category Updated")
        }catch(error)
        {
            await categoryResponse.sendErrorResponse(res,"Server Error")

        }
    }
}
