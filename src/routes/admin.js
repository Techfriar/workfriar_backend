import express from 'express'

import CategoryController from '../controllers/category-controller.js'
import ForecastController from '../controllers/forecast-controller.js';
const categoryController = new CategoryController();
const forecastController=new ForecastController()
// import multer from 'multer'

// import {
//     checkAnyPermissions,
//     checkPermissions,
// } from '../middlewares/checkPermission.js'
// import { authenticateAdmin } from '../middlewares/authenticateEmployee.js'
// import uploadCsv from '../utils/uploadCsv.js'




// const upload = multer()
// const multerMiddleware = multer().single('file')
import ClientController from '../controllers/admin/client-controller.js'


const adminRouter=express.Router()

//Route for adding category
adminRouter.post("/admin/addcategory",categoryController.addCategory.bind(categoryController));
// Route to get all categories
adminRouter.get("/admin/getcategories",categoryController.getCategories.bind(categoryController));

// Route for updating Category
adminRouter.put("/admin/updatecategories/:id", categoryController.updateCategories.bind(categoryController));

//Route for adding new Forecast
adminRouter.post("/admin/addforecast",forecastController.addForecast.bind(forecastController))
const client = new ClientController()
// const auth = new AuthController()

//Route for getting forecast
adminRouter.post("/admin/getforecast",forecastController.getForecast.bind(forecastController))


/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').put(client.editClient)


export default adminRouter
