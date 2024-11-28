import ProjectTeamRepository from "../repositories/admin/project-team-repository.js";
import ProjectTeamResponse from "../responses/projectteam-response.js";

const projectTeamRepo=new ProjectTeamRepository()
const projectTeamResponse=new ProjectTeamResponse()
class ProjectTeamController{
    async addProjectTeam(req,res)
    {
        try {
         /*    const { category, timeentry } = req.body
            const validationResult = await createCategoryRequest.validateCategory(category,timeentry);
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message);
            } */
            const newTeam = await projectTeamRepo.createTeam(req.body);
            if(newTeam)
            {
                const  data=await projectTeamResponse.formattedResponse(newTeam)
                res.status(200).json(
                    {
                        status:true,
                        message:"Project Team Created",
                        data:data,
                    })
            }
            else
            {
                res.status(422).json(
                    {
                        status:false,
                        message:"Failed to Add Project Team",
                        data:[],
                    })
            }
          
        } catch (error) {
            
                if (error instanceof CustomValidationError) {
                    return res.status(422).json({
                        status: false,
                        message: "Validation Failed",
                        errors: error.errors, 
                    });
                } else {
                    return res.status(500).json({
                        status: false,
                        message: "Internal Server Error",
                        errors: error.message || error,
                    });
                
            }
        }
    }
}