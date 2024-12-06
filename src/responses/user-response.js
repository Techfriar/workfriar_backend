import capitalizeWords from '../utils/capitalizeWords.js'
// import { generateFileUrl } from '../utils/generateFileUrl.js'
// import RoleMinResponse from './roleMinResponse.js'

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
                name: capitalizeWords(user.full_name),
                email: user.email,
                location: user.location,
                phone: user?.phone,
                role: user?.roles?.role,
                reporting_manager: user?.reporting_manager,
                profile_pic_path: user.profile_pic,
            }
    }

    /**
     * Transform the user resource into an object.
     *
     * @param {Object} user - The user object to transform.
     * @return {Object} - An object containing selected properties from the user.
     */
    static async formatEmployee(user) {
        return {
            id: user._id,
            name: capitalizeWords(user.full_name),
            email: user.email,
            role: user?.roles?.role,
            department: user?.roles?.department,
            reporting_manager: user?.reporting_manager,
            status: user.status
        }
    }
    /**
     * Transform the user resource into an object.
     *
     * @param {Object} user - The user object to transform.
     * @return {Object} - An object containing selected properties from the user.
     */
    static async formatEmployeeForListing(user) {
        return {
            id: user._id,
            name: capitalizeWords(user.full_name),
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

