import jwt from 'jsonwebtoken'
import { isTokenBlacklisted } from '../services/blackListToken.js'
import UserRepository from '../repositories/user-repository.js'
import Unseal from '../utils/unSealIronSeal.js'

const UserRepo = new UserRepository()

/**
 * @DESC Verify JWT from authorization header Middleware
 */
const authenticateEmployee = async (req, res, next) => {
    const cookie = req.cookies
    if(!cookie?.workfriar_user_intersection) {
        if(!cookie?.workfriar_admin_intersection) {
            res.status(401).json({ message: 'Unauthorized' })
        }
    } else {
        const unSealedToken = await Unseal(cookie.workfriar_user_intersection??cookie.workfriar_admin_intersection)

        const token = unSealedToken.data.token
        // const token = unSealedToken.data.token.split(' ')[1]

        if (token) {
            // if(await isTokenBlacklisted(token)) {
            //     res.status(401).json({ message: 'Unauthorized' })
            // }

            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (decoded) {
                    const { userId } = decoded
                    const user = await UserRepo.getUserById(userId)

                    req.session.user = user

                    if (err) {
                        return res.status(401).json({ message: 'Unauthorized' })
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
