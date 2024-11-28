import ProjectTeamRepository from "../repositories/admin/project-team-repository.js";
import ProjectTeamResponse from "../responses/projectteam-response.js";
import ProjectTeamRequest from "../requests/admin/projectteam-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";
const projectTeamRepo=new ProjectTeamRepository()
const projectTeamResponse=new ProjectTeamResponse()
const projectTeamRequest=new ProjectTeamRequest()
class ProjectTeamController{
    async addProjectTeam(req,res)
    {
        console.log(req.body)
        try {
            const validationResult = await projectTeamRequest.validateProjectTeam(req.body);
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message);
            } 
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
export default ProjectTeamController