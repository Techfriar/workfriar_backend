import express from 'express'
import multer from 'multer'

/*
|--------------------------------------------------------------------------
| Employee API Routes
|--------------------------------------------------------------------------
|
| In this section, you can define the employee api routes and corresponding controller methods.
|
*/

const employeeRouter = express.Router()
const multerMiddleware = multer().single('file')
const upload = multer()

const employee = new EmployeeController()

/**
 * Employee Signup Routes
 */
// employeeRouter.route('/sign_up').post(authEmployee.signUp) // Register a new employee

/**
 * Employee Login Routes
 */
// employeeRouter.route('/login/otp/send').post(authEmployee.sendLoginOtp) // Send OTP to employee's phone or email for login
export default employeeRouter
