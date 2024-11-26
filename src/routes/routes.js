 import adminRouter from './admin.js'
// import employeeRouter from './employee.js'

const configureRoutes = (app) => {

    app.get('/',(req, res)=>res.status(200).json("Routes are good ..."))
    
    app.use('/api', adminRouter) // Admin API routes
//     app.use('/api/employee', employeeRouter) // Customer API routes
}

export default configureRoutes
