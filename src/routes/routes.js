import adminRouter from './admin.js'
import projectStatusRouter from './project-status-report.js'
import projectRouter from './project.js'
import userRouter from './user.js'
import timesheetRouter from './timesheet.js'
import {authenticateEmployee} from '../middlewares/authenticate-employee.js'


const configureRoutes = (app) => {

    app.get('/',(req, res)=>res.status(200).json("Routes are good ..."))
    
    app.use('/api/admin', adminRouter) // Admin API routes
    app.use('/api/user', userRouter) // Customer API routes
    app.use('/api/project', projectRouter)
    app.use('/api/project-status-report', projectStatusRouter)

    app.use('/api/timesheet', 
        timesheetRouter
    )
}

export default configureRoutes
