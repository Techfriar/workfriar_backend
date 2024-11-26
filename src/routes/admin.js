import express from 'express'

import CategoryController from '../controllers/category-controller.js'
import ForecastController from '../controllers/forecast-controller.js';
const categoryController = new CategoryController();
const forecastController=new ForecastController()

const adminRouter=express.Router()

//Route for adding category
adminRouter.post("/admin/addcategory",categoryController.addCategory.bind(categoryController));

// Route to get all categories
adminRouter.get("/admin/getcategories",categoryController.getCategories.bind(categoryController));

// Route for updating Category
adminRouter.put("/admin/updatecategories/:id", categoryController.updateCategories.bind(categoryController));

//Route for adding new Forecast
adminRouter.post("/admin/addforecast",forecastController.addForecast.bind(forecastController))

//Route for getting forecast
adminRouter.post("/admin/getforecast",forecastController.getForecast.bind(forecastController))


export default adminRouter
