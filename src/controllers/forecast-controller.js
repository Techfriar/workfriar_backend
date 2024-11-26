import ForecastRepository from "../repositories/admin/forecast-repository.js";
import CreateForecastRequest from "../requests/admin/forecast-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";
import ForecastResponse from "../responses/forecast-response.js";

const forecastRepo=new ForecastRepository()
const forecastRequest=new CreateForecastRequest()
const forecastResponse=new ForecastResponse()


export default class ForecastController{

 /**
 * @swagger
 * /admin/addforecast:
 *   post:
 *     summary: Add a new project forecast
 *     tags: [Forecast]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - manager
 *               - description
 *               - clientName
 *               - startDate
 *               - stage
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the opportunity/project
 *                 example: "New Website Development"
 *               manager:
 *                 type: string
 *                 description: ObjectId of the opportunity manager
 *                 example: "64ec9990c26a2a5d8cfa9921"
 *               description:
 *                 type: string
 *                 description: Detailed description of the opportunity/project
 *                 example: "Development of a new e-commerce platform."
 *               clientName:
 *                 type: string
 *                 description: Name of the client
 *                 example: "ABC Corp"
 *               billing:
 *                 type: string
 *                 description: Billing model
 *                 example: "Hourly"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the opportunity
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the opportunity
 *                 example: "2024-12-31"
 *               expectedStartdate:
 *                 type: string
 *                 format: date
 *                 description: Expected start date of the project
 *                 example: "2024-02-01"
 *               expectedEnddate:
 *                 type: string
 *                 format: date
 *                 description: Expected end date of the project
 *                 example: "2024-11-30"
 *               revenue:
 *                 type: string
 *                 description: Estimated revenue (in string format)
 *                 example: "50000"
 *               stage:
 *                 type: string
 *                 description: Current stage of the opportunity
 *                 example: "Initial"
 *               resource:
 *                 type: string
 *                 description: Expected resource breakdown (must be a number)
 *                 example: "3"
 *               projectManager:
 *                 type: string
 *                 description: ObjectId of the project manager
 *                 example: "64ec9990c26a2a5d8cfa9922"
 *               productManager:
 *                 type: string
 *                 description: ObjectId of the product manager
 *                 example: "64ec9990c26a2a5d8cfa9923"
 *               techLead:
 *                 type: string
 *                 description: ObjectId of the technical lead
 *                 example: "64ec9990c26a2a5d8cfa9924"
 *               accountManager:
 *                 type: string
 *                 description: ObjectId of the account manager
 *                 example: "64ec9990c26a2a5d8cfa9925"
 *               estimatedCompletion:
 *                 type: string
 *                 description: Estimated project completion (e.g., "6 months")
 *                 example: "6 months"
 *               team:
 *                 type: array
 *                 description: Team members with their forecasted hours
 *                 items:
 *                   type: object
 *                   required:
 *                     - team_member
 *                     - forecast_hours
 *                   properties:
 *                     team_member:
 *                       type: string
 *                       description: ObjectId of the team member
 *                       example: "64ec9990c26a2a5d8cfa9926"
 *                     forecast_hours:
 *                       type: number
 *                       description: Forecasted hours for the team member
 *                       example: 40
 *     responses:
 *       200:
 *         description: Forecast successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Forecast added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the newly created forecast
 *                       example: "64ec9990c26a2a5d8cfa9927"
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation Failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "Name is required"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
    async addForecast(req,res)
    {
        try
        {
        const{name,manager,description,clientName,billing,startDate,endDate,expectedStartdate,expectedEnddate,revenue,stage,resource,projectManager,productManager,techLead,accountManager,
            estimatedCompletion,team}=req.body
         const validationResult=await forecastRequest.validateForecast(req.body)
        if (!validationResult.isValid) {
            throw new CustomValidationError(validationResult.message)
        } 
            const forecastData = {};
            if (name) forecastData.opportunity_name = name;
            if (manager) forecastData.opportunity_manager = manager;
            if (description) forecastData.opportunity_description = description;
            if (clientName) forecastData.client_name = clientName;
            if (billing) forecastData.billing_model = billing;
            if (startDate) forecastData.opportunity_start_date = startDate;
            if (endDate) forecastData.opportunity_close_date = endDate;
            if (expectedStartdate) forecastData.expected_project_start_date = expectedStartdate;
            if (expectedEnddate) forecastData.expected_project_end_date = expectedEnddate;
            if (revenue) forecastData.estimated_revenue = revenue;
            if (stage) forecastData.opportunity_stage = stage;
            if (resource) forecastData.expected_resource_breakdown = resource;
            if (projectManager) forecastData.project_manager = projectManager;
            if (productManager) forecastData.product_manager = productManager;
            if (techLead) forecastData.tech_lead = techLead;
            if (accountManager) forecastData.account_manager = accountManager;
            if (estimatedCompletion) forecastData.estimated_project_completion = estimatedCompletion;
            if (team && Array.isArray(team)) forecastData.team_forecast = team;
            const newForecast=await forecastRepo.createForecast(forecastData)
            if(newForecast)
            {
                const  data=await forecastResponse.formattedResponse(newForecast)
                res.status(200).json(
                    {
                        status:true,
                        message:"Added new Forecast",
                        data:data,
                    })
            }
            else{
                res.status(422).json(
                    {
                        status:false,
                        message:"Failed to Add Forecast",
                        data:[],
                    })
            }
        }
        catch(error)
            {
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
    async getForecast(req,res)
    {
        try
        {

        }
        catch(error)
        {
            
        }
    }
}