import Joi from "joi";
class CreateForecastRequest {

   /**
     *Validate the users input for creating a new project forecast.
     * @param {Object} forecastInput - The request object.
     * @return {Object} - An object containing state and message whether the input is valid or not.
     */

  static forecastValidation = Joi.object({
    name: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.empty": "Name is required",
      "any.required": "Name is required",
      "string.min": "Name must be between 3 and 30 characters",
      "string.max": "Name must be between 3 and 30 characters",
      "string.pattern.base": "Name can only contain alphanumeric characters and spaces",
    }),
    description: Joi.string().required().min(3).max(50).regex(/^(?!\d+$)[a-zA-Z0-9\s@!#\$%\^\&*\)\(+=._-]+$/
).messages({
      "string.empty": "Description is required",
      "any.required": "Description is required",
      "string.min": "Description must be between 3 and 30 characters",
      "string.max": "Description must be between 3 and 30 characters",
      "string.pattern.base": "Description can only contain alphanumeric characters and spaces",
    }),
    clientName: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.empty": "Client Name is required",
      "any.required": "Client Name is required",
      "string.min": "Client Name must be between 3 and 30 characters",
      "string.max": "Client Name must be between 3 and 30 characters",
      "string.pattern.base": "Client Name can only contain alphanumeric characters and spaces",
    }),
    billing: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.empty": "Billing cannot be empty.",
      "string.min": "Billing must be between 3 and 30 characters",
      "string.max": "Billing must be between 3 and 30 characters",
      "string.pattern.base": "Billing can only contain alphanumeric characters and spaces",
    }),
    manager: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.empty": "Opportunity Manager is required",
      "any.required": "Opportunity Manager is required",
      "string.min": "Opportunity Manager must be between 3 and 30 characters",
      "string.max": "Opportunity Manager must be between 3 and 30 characters",
      "string.pattern.base": "Opportunity Manager can only contain alphanumeric characters and spaces",
    }),
    startDate: Joi.date().required().messages({
      "date.base": "Opportunity Start Date must be a valid date",
      "any.required": "Opportunity Start Date is required",
    }),
    stage: Joi.string().required().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.empty": "Opportunity Stage is required",
      "any.required": "Opportunity Stage is required",
      "string.min": "Opportunity Stage must be between 3 and 30 characters",
      "string.max": "Opportunity Stage must be between 3 and 30 characters",
      "string.pattern.base": "Opportunity Stage can only contain alphanumeric characters and spaces",
    }),
    status: Joi.string().optional().allow("").min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.base": "Revenue must be a string",
      "string.min": "Status must be between 3 and 30 characters",
      "string.max": "Status must be between 3 and 30 characters",
      "string.pattern.base": "Status can only contain alphanumeric characters and spaces",
    }),
    endDate: Joi.date().optional().allow(null),
    expectedStartdate: Joi.date().optional().allow(null),
    expectedEnddate: Joi.date().optional().allow(null),
    revenue: Joi.string().optional().allow("").min(3).max(30).regex(/^[a-zA-Z0-9\s]+$/
).messages({
      "string.base": "Revenue must be a string",
      "string.min": "Revenue must be between 3 and 30 characters",
      "string.max": "Revenue must be between 3 and 30 characters",
      "string.pattern.base": "Revenue can only contain alphanumeric characters and spaces",
    }),
    resource: Joi.string()
      .optional()
      .allow("")
      .custom((value, helpers) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
          return helpers.error("any.invalid", { message: "Expected Resource Breakdown must be a number" });
        }
        return parsed;
      })
      .messages({
        "any.invalid": "Expected Resource Breakdown must be a number",
      }),
    projectManager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.base": "Project Manager must be a valid ID",
    }),
    productManager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.base": "Product Manager must be a valid ID",
    }),
    techLead: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.base": "Tech Lead must be a valid ID",
    }),
    accountManager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.base": "Account Manager must be a valid ID",
    }),
    estimatedCompletion: Joi.string().optional().allow("").min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/).messages({
      "string.base": "Estimated Project Completion must be a string",
    }),
    team: Joi.array()
      .items(
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
      )
      .optional()
      .custom((value, helpers) => {
        const { resource } = helpers.state.ancestors[0];
        const resourceAsNumber = parseInt(resource, 10);
        if (!isNaN(resourceAsNumber) && value.length > resourceAsNumber) {
          return helpers.error("array.length", {
            message: `Team size must not exceed Expected Resource Breakdown (${resourceAsNumber})`,
          });
        }
        return value;
      })
      .messages({
        "array.length": "Team size must not exceed Expected Resource Breakdown",
      }),
  });

  static forecastUpdateValidation = Joi.object({
    id:Joi.string().required(),
    name: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    description: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    clientName: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    billing: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    manager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    startDate: Joi.date().optional(),
    stage: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    status: Joi.string().optional().allow("").min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    endDate: Joi.date().optional().allow(null),
    expectedStartdate: Joi.date().optional().allow(null),
    expectedEnddate: Joi.date().optional().allow(null),
    revenue: Joi.string().optional().allow(""),
    resource: Joi.string()
      .optional()
      .allow("")
      .custom((value, helpers) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
          return helpers.error("any.invalid", { message: "Expected Resource Breakdown must be a number" });
        }
        return parsed;
      }),
    projectManager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    productManager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    techLead: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    accountManager: Joi.string().optional().min(3).max(30).regex(/^(?!\d+$)[a-zA-Z0-9\s]+$/),
    estimatedCompletion: Joi.string().optional().allow("").min(3).max(30),
    team: Joi.array()
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
