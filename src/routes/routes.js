 import adminRouter from './admin.js'
import projectStatusRouter from './project-status-report.js'
import projectRouter from './project.js'
import userRoutes from './user.js'

const configureRoutes = (app) => {

    app.get('/',(req, res)=>res.status(200).json("Routes are good ..."))
    
    app.use('/api/admin', adminRouter) // Admin API routes
    app.use('/api/user', userRoutes) // Customer API routes
    app.use('/api/project', projectRouter)
    app.use('/api/project-status-report', projectStatusRouter)
}

export default configureRoutes
