import Role from '../models/Role.js';
import User from '../models/user.js';
import Permission from '../models/permission.js';
/**
 * Middleware function factory to check user permissions
 * @param String requiredCategory, requiredAction
 * @returns void
 */
const checkPermissions = (requiredCategory, requiredAction) => async (req, res, next) => {
    try {

        //temporary true for development
        // return true

        // const user = req.session.user; // Assuming user data is stored in session
        const user = {email: 'john.doe@example.com'}
        user._id = '6744a7c9707ecbeea1efd14c'
        if (user) {
            // Find the user and populate roles with permissions
            const userWithRoles = await User.findById(user._id)
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions', // Populate permissions within roles
                    model: 'Permission', // Ensure this matches the Permission model name
                },
            })
            .lean(); // Use lean() for faster query and plain JS object          
  
        if (!userWithRoles || !userWithRoles.roles || userWithRoles.roles.length === 0) {
            return res.status(403).json({ message: 'No roles assigned to the user' });
        }
        
        // Check if the user has the required permission
        const hasPermission = userWithRoles.roles.some((role) => {
            // Super Admins bypass all checks
            if (role.role === 'Super Admin') {
                return true;
            }
    
            // Check if the role is active
            if (!role.status) {
                return false;
            }
    
            // Check permissions within the role            
            return role.permissions.some((permission) => {
                console.log(permission, requiredCategory, requiredAction);
                
                return (
                    permission.category === requiredCategory &&
                    permission.actions.includes(requiredAction)
                );
            });
        });
  
        if (!hasPermission) {
            return res.status(401).json({
                message: 'Sorry, you do not have access to this route',
            });
        }
    
            next(); // User has the required permissions
        } else {
            res.status(401).json({ message: 'Unauthorized: User not logged in' });
        }
    } catch (error) {
        console.error('Error checking permissions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
  

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
