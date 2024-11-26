import adminRouter from './admin.js'
import employeeRouter from './employee.js'
import holidayRouter from './holiday.js'

const configureRoutes = (app) => {
    
    app.use('/api', adminRouter) // Admin API routes
    app.use('/api/employee', employeeRouter) // Customer API routes
    app.use('/api/holiday', holidayRouter)
}

export default configureRoutes
