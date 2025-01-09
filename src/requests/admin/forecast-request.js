import Joi from "joi";
class CreateForecastRequest {

   /**
     *Validate the users input for creating a new project forecast.
     * @param {Object} forecastInput - The request object.
     * @return {Object} - An object containing state and message whether the input is valid or not.
     */

     static forecastValidation = Joi.object({
      opportunity_name: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.empty": "Opportunity Name is required",
        "any.required": "Opportunity Name is required",
        "string.min": "Opportunity Name must be between 3 and 30 characters",
        "string.max": "Opportunity Name must be between 3 and 30 characters",
        "string.pattern.base": "Opportunity Name can only contain alphanumeric characters and spaces",
      }),
      opportunity_description: Joi.string().required().min(3).max(50).regex(/^(?!\d+$)[a-zA-Z0-9\s@!#\$%\^\&*\)\(+=._-]+$/).messages({
        "string.empty": "Opportunity Description is required",
        "any.required": "Opportunity Description is required",
        "string.min": "Opportunity Description must be between 3 and 50 characters",
        "string.max": "Opportunity Description must be between 3 and 50 characters",
        "string.pattern.base": "Opportunity Description can only contain alphanumeric characters and spaces",
      }),
      client_name: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.empty": "Client Name is required",
        "any.required": "Client Name is required",
        "string.min": "Client Name must be between 3 and 30 characters",
        "string.max": "Client Name must be between 3 and 30 characters",
        "string.pattern.base": "Client Name can only contain alphanumeric characters and spaces",
      }),
      billing_model: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.empty": "Billing Model cannot be empty",
        "string.min": "Billing Model must be between 3 and 30 characters",
        "string.max": "Billing Model must be between 3 and 30 characters",
        "string.pattern.base": "Billing Model can only contain alphanumeric characters and spaces",
      }),
      opportunity_manager: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.empty": "Opportunity Manager is required",
        "any.required": "Opportunity Manager is required",
        "string.min": "Opportunity Manager must be between 3 and 30 characters",
        "string.max": "Opportunity Manager must be between 3 and 30 characters",
        "string.pattern.base": "Opportunity Manager can only contain alphanumeric characters and spaces",
      }),
      opportunity_start_date: Joi.date().required().messages({
        "date.base": "Opportunity Start Date must be a valid date",
        "any.required": "Opportunity Start Date is required",
      }),
      opportunity_stage: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.empty": "Opportunity Stage is required",
        "any.required": "Opportunity Stage is required",
        "string.min": "Opportunity Stage must be between 3 and 30 characters",
        "string.max": "Opportunity Stage must be between 3 and 30 characters",
        "string.pattern.base": "Opportunity Stage can only contain alphanumeric characters and spaces",
      }),
      status: Joi.string().optional().allow("").min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Status must be a string",
        "string.min": "Status must be between 3 and 30 characters",
        "string.max": "Status must be between 3 and 30 characters",
        "string.pattern.base": "Status can only contain alphanumeric characters and spaces",
      }),
      opportunity_close_date: Joi.date().optional().allow(null),
      expected_project_start_date: Joi.date().optional().allow(null),
      expected_project_end_date: Joi.date().optional().allow(null),
      estimated_revenue: Joi.string().optional().allow("").min(3).max(30).regex(/^[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Estimated Revenue must be a string",
        "string.min": "Estimated Revenue must be between 3 and 30 characters",
        "string.max": "Estimated Revenue must be between 3 and 30 characters",
        "string.pattern.base": "Estimated Revenue can only contain alphanumeric characters and spaces",
      }),
      expected_resource_breakdown: Joi.string().optional().allow("").custom((value, helpers) => {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed)) {
            return helpers.error("any.invalid", { message: "Expected Resource Breakdown must be a number" });
          }
          return parsed;
        }).messages({
          "any.invalid": "Expected Resource Breakdown must be a number",
        }),
      project_manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Project Manager must be a valid ID",
      }),
      product_manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Product Manager must be a valid ID",
      }),
      tech_lead: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Tech Lead must be a valid ID",
      }),
      account_manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Account Manager must be a valid ID",
      }),
      estimated_project_completion: Joi.string().optional().allow("").min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Estimated Project Completion must be a string",
      }),
      team_forecast: Joi.array().items(
          Joi.object({
            team_member: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
              "string.base": "Team Member must be a valid ID",
              "any.required": "Team Member is required",
              "string.min": "Team Member must be between 3 and 30 characters",
              "string.max": "Team Member must be between 3 and 30 characters",
              "string.pattern.base": "Team Member can only contain alphanumeric characters and spaces",
            }),
            forecast_hours: Joi.number().required().messages({
              "number.base": "Forecast Hours must be a number",
              "any.required": "Forecast Hours are required",
            }),
          })
        ).optional().custom((value, helpers) => {
          const { expected_resource_breakdown } = helpers.state.ancestors[0];
          const resourceAsNumber = parseInt(expected_resource_breakdown, 10);
          if (!isNaN(resourceAsNumber) && value.length > resourceAsNumber) {
            return helpers.error("array.length", {
              message: `Team size must not exceed Expected Resource Breakdown (${resourceAsNumber})`,
            });
          }
          return value;
        }).messages({
          "array.length": "Team size must not exceed Expected Resource Breakdown",
        }),
    });

    static forecastUpdateValidation = Joi.object({
      id: Joi.string().required(),
      opportunity_name: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      opportunity_description: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      client_name: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      billing_model: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      opportunity_manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      opportunity_start_date: Joi.date().optional(),
      opportunity_stage: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      status: Joi.string().optional().allow("").min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      opportunity_close_date: Joi.date().optional().allow(null),
      expected_project_start_date: Joi.date().optional().allow(null),
      expected_project_end_date: Joi.date().optional().allow(null),
      estimated_revenue: Joi.string().optional().allow(""),
      expected_resource_breakdown: Joi.string()
        .optional()
        .allow("")
        .custom((value, helpers) => {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed)) {
            return helpers.error("any.invalid", { message: "Expected Resource Breakdown must be a number" });
          }
          return parsed;
        }),
      project_manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      product_manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      tech_lead: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      account_manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
      estimated_project_completion: Joi.string().optional().allow("").min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
        "string.base": "Estimated Project Completion must be a string",
      }),
      team_forecast: Joi.array()
        .items(
          Joi.object({
            team_member: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
            forecast_hours: Joi.number().optional(),
          })
        )
        .optional(),
    });
  
//function for validating new create request for project forecast
  async validateForecast(forecastInput) {
    const { error } = CreateForecastRequest.forecastValidation.validate(forecastInput, { abortEarly: false });

    if (error) {
      return {
        isValid: false,
        message: error.details.map((err) => err.message),
      };
    }
    return { isValid: true };
  }
//Function for validating update forecast request
  async validateForecastForUpdate(forecastInput) {
    const { error } = CreateForecastRequest.forecastUpdateValidation.validate(forecastInput, { abortEarly: false });
    if (error) {
      return {
        isValid: false,
        message: error.details.map((err) => err.message),
      };
    }
    return { isValid: true };
  }
}

export default CreateForecastRequest;
