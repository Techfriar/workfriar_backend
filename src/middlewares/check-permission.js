import Role from '../models/role.js'

/**
 * Middleware function factory to check user permissions
 * @param Array<String> requiredPermissions
 * @returns void
 */
const checkPermissions = (requiredPermissions) => async (req, res, next) => {
    const user = req.session.user
    if (user) {
        const role = await Role.findOne({ _id: user.role_id })
        if (role.name !== 'Super Admin') {
            if (!role.permissions.includes(requiredPermissions)) {
                res.status(401).json(
                    'Sorry you do not have access to this route',
                )
            } else {
                next()
            }
        } else {
            next()
        }
    } else {
        res.status(401).json('Sorry you do not have access to this route')
    }
}

/**
 * Middleware function factory to check user permissions
 * @param Array<String> requiredPermissions
 * @returns void
 */
const checkAnyPermissions = (requiredPermissions) => async (req, res, next) => {
    const user = req.session.user
    if (user) {
        const role = await Role.findOne({ _id: user.role_id })
        if (role.name !== 'Super Admin') {
            // Check if the user has any of the required permissions
            const hasPermission = requiredPermissions.some((permission) =>
                role.permissions.includes(permission),
            )
            // If the user has any of the required permissions, allow access to the route
            if (!hasPermission) {
                res.status(401).json(
                    'Sorry you do not have access to this route',
                )
            } else {
                next()
            }
        } else {
            next()
        }
    } else {
        res.status(401).json('Sorry you do not have access to this route')
    }
}

export { checkPermissions, checkAnyPermissions }
