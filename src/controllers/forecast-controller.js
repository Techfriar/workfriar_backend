import ForecastRepository from "../repositories/admin/forecast-repository.js";
import CreateForecastRequest from "../requests/admin/forecast-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";
import ForecastResponse from "../responses/forecast-response.js";

const forecastRepo=new ForecastRepository()
const forecastRequest=new CreateForecastRequest()   
const forecastResponse=new ForecastResponse()


export default class ForecastController{

   
//Function for mapping items from cline side to database entries
   static async formattedForecast(input) {
        const allowedKeys = {
            name: "opportunity_name",
            manager: "opportunity_manager",
            description: "opportunity_description",
            clientName: "client_name",
            billing: "billing_model",
            startDate: "opportunity_start_date",
            endDate: "opportunity_close_date",
            expectedStartdate: "expected_project_start_date",
            expectedEnddate: "expected_project_end_date",
            revenue: "estimated_revenue",
            stage: "opportunity_stage",
            resource: "expected_resource_breakdown",
            projectManager: "project_manager",
            productManager: "product_manager",
            techLead: "tech_lead",
            accountManager: "account_manager",
            estimatedCompletion: "estimated_project_completion",
            team: "team_forecast",
        };
    
        const forecastData = Object.entries(allowedKeys).reduce((acc, [key, mappedKey]) => {
            if (input[key]) {
                acc[mappedKey] = input[key];
            }
            return acc;
        }, {});
    
        return forecastData;
    }
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
 *                 example: "Closed Won"
 *               status:
 *                 type:string
 *                 description:Current status of the opportunity
 *                  example:"On hold"
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

    async addForecastController(req,res)
    {
        try                     
        {
         const validationResult=await forecastRequest.validateForecast(req.body)
        if (!validationResult.isValid) {
            throw new CustomValidationError(validationResult.message)
        } 
       
        const forecastData=await ForecastController.formattedForecast(req.body)
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
 /**
 * Get all Project Forecasts
 * 
 * @swagger
 * /admin/getallforecast:
 *   post:
 *     summary: Retrieve a list of all project forecasts
 *     tags: [Forecast]
 *     responses:
 *       200:
 *         description: A list of all project forecasts
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
 *                   example: "Forecasts"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "6746b68444117998965847ff"
 *                       opportunity_name:
 *                         type: string
 *                         example: "Project Alpha"
 *                       opportunity_manager:
 *                         type: string
 *                         example: "John Doe"
 *                       opportunity_date:
 *                         type: string
 *                         example: "01/01/2024 - 12/31/2024"
 *                       client_name:
 *                         type: string
 *                         example: "Client X"
 *                       opportunity_stage:
 *                         type: string
 *                         example: "Closed Won"
 *                       status:
 *                         type: string
 *                         example: "Not Started"
 *       422:
 *         description: No project forecasts found
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
 *                   example: "No Project forecasts Found"
 *                 data:
 *                   type: array
 *                   items: []
 *       500:
 *         description: Internal server error
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
 *                 data:
 *                   type: array
 *                   items: []
 */

     async getForecastController(req,res)
    {
            try {
                const data = await forecastRepo.getForecast()
                if (data.length === 0) {
                    res.status(422).json({
                        status:false,
                        message:"No Project forecasts Found",
                        data:[],
                    })
                    return
                }
                else
                {  
                    const forecastData=await forecastResponse.formatForecastSet(data) 
                  
                    res.status(200).json({
                        status:true,
                        message:"Forecasts",
                        data:forecastData,
                    })
                }
            } catch (error) {
                    res.status(500).json(
                    {
                        status:false,
                        message:"Internal Server Error",
                        data:[],
                    })
            }
    }
 /**
 * Get Project Forecast by ID
 * 
 * @swagger
 * /admin/getforecast:
 *   post:
 *     summary: Retrieve a single project forecast by its ID
 *     tags: [Forecast]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the project forecast to retrieve
 *                 example: "6746b68444117998965847ff"
 *     responses:
 *       200:
 *         description: Details of the requested project forecast
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
 *                   example: "Forecast"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6746b68444117998965847ff"
 *                     opportunity_name:
 *                       type: string
 *                       example: "Project Alpha"
 *                     opportunity_manager:
 *                       type: string
 *                       example: "John Doe"
 *                     client_name:
 *                       type: string
 *                       example: "Client X"
 *                     opportunity_description:
 *                       type: string
 *                       example: "This is a description of Project Alpha."
 *                     opportunity_start_date:
 *                       type: string
 *                       example: "01/01/2024"
 *                     opportunity_close_date:
 *                       type: string
 *                       example: "12/31/2024"
 *                     expected_project_start_date:
 *                       type: string
 *                       example: "02/01/2024"
 *                     expected_project_end_date:
 *                       type: string
 *                       example: "12/31/2025"
 *                     estimated_revenue:
 *                       type: string
 *                       example: "$500,000"
 *                     opportunity_stage:
 *                       type: string
 *                       example: "Closed Won"
 *                     expected_resource_breakdown:
 *                       type: string
 *                       example: "60% Engineering, 40% QA"
 *                     project_manager:
 *                       type: string
 *                       example: "Alice Johnson"
 *                     product_manager:
 *                       type: string
 *                       example: "Bob Martin"
 *                     tech_lead:
 *                       type: string
 *                       example: "Charlie Brown"
 *                     account_manager:
 *                       type: string
 *                       example: "David White"
 *                     estimated_project_completion:
 *                       type: string
 *                       example: "11/30/2025"
 *                     status:
 *                       type: string
 *                       example: "Not Started"
 *                     team_forecast:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Jane Smith"
 *                           forecast_hours:
 *                             type: string
 *                             example: "40"
 *       422:
 *         description: No forecast found for the provided ID
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
 *                   example: "No Project forecasts Found"
 *                 data:
 *                   type: array
 *                   items: []
 *       500:
 *         description: Internal server error
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
 *                 data:
 *                   type: array
 *                   items: []
 */
    async getForecastbyIdController(req,res)
    {
        try {
            const { id } = req.body; 
            const data = await forecastRepo.getForecastByid(id)
            if (data.length === 0) {
                res.status(422).json({
                    status:false,
                    message:"No Project forecasts Found",
                    data:[],
                })
                return
            }
            else
            {  
                const forecastData=await forecastResponse.formattedFullResponse(data) 
                res.status(200).json({
                    status:true,
                    message:"Forecast",
                    data:forecastData,
                })
            }
        } catch (error) {
                res.status(500).json(
                {
                    status:false,
                    message:"Internal Server Error",
                    data:[],
                })
        }
    }

/**
 * Delete Project Forecast by ID
 * 
 * @swagger
 * /admin/deleteforecast:
 *   post:
 *     summary: Delete a project forecast by its ID
 *     tags: [Forecast]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the project forecast to retrieve
 *                 example: "6746b68444117998965847ff"
 *     responses:
 *       200:
 *         description: Forecast deleted successfully
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
 *                   example: "Forecast deleted successfully"
 *       404:
 *         description: Forecast not found for the provided ID
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
 *                   example: "Forecast not found"
 *       500:
 *         description: Internal server error
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
 *                 data:
 *                   type: array
 *                   items: []
 */


    async deleteForecastController(req,res)
    {
        const { id } = req.body;
        try {
          const deletedForecast = await forecastRepo.deleteForecast(id);
      
          if (!deletedForecast) {
            return res.status(404).json({
              status: false,
              message: "Forecast not found"
            });
          }
          return res.status(200).json({
            status: true,
            message: "Forecast deleted successfully"
          });
          
        } catch (error) {
          return res.status(500).json({
            status: false,
            message: "Internal Server Error"
          });
        }
    }
/**
 * Update an existing project forecast by ID
 * 
 * @swagger
 * /admin/updateforecast:
 *   post:
 *     summary: Update an existing project forecast
 *     tags: [Forecast]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "App Dev"
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Description of the project"
 *               clientName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "TechCorp"
 *               billing:
 *                 type: string
 *                 example: "Monthly"
 *               manager:
 *                 type: string
 *                 example: "6746a63bf79ea71d30770de9"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               expectedStartdate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               expectedEnddate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               revenue:
 *                 type: string
 *                 example: "100000"
 *               stage:
 *                 type: string
 *                 example: "Prospecting"
 *               resource:
 *                 type: string
 *                 example: "5"
 *               projectManager:
 *                 type: string
 *                 example: "6746a63bf79ea71d30770de9"
 *               productManager:
 *                 type: string
 *                 example: "6746a63bf79ea71d30770de9"
 *               techLead:
 *                 type: string
 *                 example: "6746a63bf79ea71d30770de9"
 *               accountManager:
 *                 type: string
 *                 example: "6746a63bf79ea71d30770de9"
 *               estimatedCompletion:
 *                 type: string
 *                 example: "2024-10-31"
 *               team:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     team_member:
 *                       type: string
 *                       example: "6746a63bf79ea71d30770de9"
 *                     forecast_hours:
 *                       type: number
 *                       example: 40
 *     responses:
 *       200:
 *         description: Forecast updated successfully
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
 *                   example: "Updated Forecast"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6746e9bbaf88b6fea9ada851"
 *                     name:
 *                       type: string
 *                       example: "App Dev"
 *                     category:
 *                       type: string
 *                       example: "App Development"
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
 *                   example: 
 *                     - "Name must contain letters and cannot be only numbers"
 *                     - "Client Name must contain letters and cannot be only numbers"
 *       404:
 *         description: Forecast not found for the provided ID
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
 *                   example: "Forecast not found"
 *       500:
 *         description: Internal server error
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
    async updateForecast(req,res)
    {
        const {id}=req.body
        try
        {
     
            const validationResult=await forecastRequest.validateForecastForUpdate(req.body)
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message)
            } 
           const forecastData=await ForecastController.formattedForecast(req.body)

            const newForecast=await forecastRepo.updateForecast(forecastData,id)
            if(newForecast)
            {
                const  data=await forecastResponse.formattedResponse(newForecast)
                res.status(200).json(
                    {
                        status:true,
                        message:"Updated Forecast",
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
    }   