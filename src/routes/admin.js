import express from 'express'

import CategoryController from '../controllers/category-controller.js'
const categoryController = new CategoryController();

const adminRouter=express.Router()

//Route for adding category
adminRouter.post("/admin/addcategory",categoryController.addCategory.bind(categoryController));

// Route to get all categories
adminRouter.get("/admin/getcategories",categoryController.getCategories.bind(categoryController));



// Route for updating Category
adminRouter.put("/admin/updatecategories/:id", categoryController.updateCategories.bind(categoryController));


export default adminRouter
