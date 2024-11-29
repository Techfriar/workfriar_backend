import jwt from 'jsonwebtoken'
import UserRepository from '../repositories/user-repository.js'

const employeeRepo = new UserRepository()

/**
 * @DESC Verify JWT from authorization header Middleware
 */
const authenticateEmployee = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized' })
    } else {
        const token = authHeader.split(' ')[1]
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (decoded) {
                    const { userId } = decoded
                    const employee = await employeeRepo.getEmployee(userId)
                    req.session.user = employee
                    if (err) {
                        res.status(401).json({ message: 'Unauthorized' })
                    }
                    next()
                } else {
                    res.status(401).json({ message: 'Unauthorized' })
                }
            })
        } else {
            res.status(401).json({ message: 'Unauthorized' })
        }
    }
}

export { authenticateEmployee }
