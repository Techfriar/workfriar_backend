import capitalizeWords from '../utils/capitalizeWords.js'
import { generateFileUrl } from '../utils/generateFileUrl.js'
import RoleMinResponse from './roleMinResponse.js'

export default class UserResponse {
    /**
     * Transform the user resource into an object.
     *
     * @param {Object} user - The user object to transform.
     * @return {Object} - An object containing selected properties from the user.
     */
    static async format(user) {
        return {
            id: user._id,
            name: capitalizeWords(user.name),
            email: user.email,
            country_code: user?.country_code,
            country_unicode: user?.country_unicode,
            phone: user?.phone,
            status: user.status ,
            profile_pic_path:
                generateFileUrl(user.profile_pic_path) ||
                process.env.APP_URL + 'public/images/no-user.png',
            employee_id: user?.employee_id,
        }
    }
}



//how to call
// await UserResponse.format(user),


//how to call if a array of objects are called (In controller)
//const data = await Promise.all(
//     users.map(
//         async (user) =>
//             await UserResponse.format(user),
//     ),
// )

