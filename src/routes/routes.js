 import adminRouter from './admin.js'
//  import employeeRouter from './employee.js'

 const configureRoutes = (app) => {
 
       app.use('/api', adminRouter) // Admin API routes
//     app.use('/api/employee', employeeRouter) // Customer API routes
       app.use('/api/project', projectRouter)
}

export default configureRoutes
