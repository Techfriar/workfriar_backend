import projectRouter from './project.js'

const configureRoutes = (app) => {
    app.use('/api/project', projectRouter)
}

export default configureRoutes
