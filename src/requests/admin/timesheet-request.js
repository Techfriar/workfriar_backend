import Joi from 'joi';
// import ProjectRepository from '../../repositories/'
// import TaskCateogryRepository from '../../repositories/'
import UserRepository from '../../repositories/user-repository';      
import { CustomValidationError } from '../../exceptions/custom-validation-error';

export default class CreateTimesheetRequest {

        static ProjectRepo = new ProjectRepository()
        static UserRepo = new UserRepository()
        static  TaskCategoryRepo = new TaskCateogryRepository()

      // Validate Project, User, and TaskCategory references
    async validateReferences(project_id, user_id, task_category_id) {
        const project = await ProjectRepo.findById(project_id);
        if (!project) throw new CustomValidationError('Project not found');

        const user = await UserRepo.getUserById(user_id)
        if (!user) throw new Error('User not found');
        if (!project.team.includes(user_id)) throw new CustomValidationError('User is not part of the project team');

        const taskCategory = await TaskCategory.findById(task_category_id);
        if (!taskCategory) throw new CustomValidationError('Task Category not found');

        return { project, user, taskCategory };
    }
}