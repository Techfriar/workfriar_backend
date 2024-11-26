import Joi from "joi";
import ForecastRepository from "../../repositories/admin/forecast-repository.js";

const forecastRepo = new ForecastRepository();

class CreateForecastRequest {
  static forecastValidation = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required",
      "any.required": "Name is required",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description is required",
      "any.required": "Description is required",
    }),
    clientName: Joi.string().required().messages({
      "string.empty": "Client Name is required",
      "any.required": "Client Name is required",
    }),
    billing: Joi.string().optional().messages({
      "string.empty": "Billing cannot be empty.",
    }),
    manager: Joi.string().required().messages({
      "string.empty": "Opportunity Manager is required",
      "any.required": "Opportunity Manager is required",
    }),
    startDate: Joi.date().required().messages({
      "date.base": "Opportunity Start Date must be a valid date",
      "any.required": "Opportunity Start Date is required",
    }),
    stage: Joi.string().required().messages({
      "string.empty": "Opportunity Stage is required",
      "any.required": "Opportunity Stage is required",
    }),
    endDate: Joi.date().optional().allow(null),
    expectedStartdate: Joi.date().optional().allow(null),
    expectedEnddate: Joi.date().optional().allow(null),
    revenue: Joi.string().optional().allow("").messages({
      "string.base": "Revenue must be a string",
    }),
    resource: Joi.string()
      .optional()
      .allow("")
      .custom((value, helpers) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
          return helpers.error("any.invalid", { message: "Expected Resource Breakdown must be a number" });
        }
        return parsed; // Return the parsed number.
      })
      .messages({
        "any.invalid": "Expected Resource Breakdown must be a number",
      }),
    projectManager: Joi.string().optional().allow("").messages({
      "string.base": "Project Manager must be a valid ID",
    }),
    productManager: Joi.string().optional().allow("").messages({
      "string.base": "Product Manager must be a valid ID",
    }),
    techLead: Joi.string().optional().allow("").messages({
      "string.base": "Tech Lead must be a valid ID",
    }),
    accountManager: Joi.string().optional().allow("").messages({
      "string.base": "Account Manager must be a valid ID",
    }),
    estimatedCompletion: Joi.string().optional().allow("").messages({
      "string.base": "Estimated Project Completion must be a string",
    }),
    team: Joi.array()
      .items(
        Joi.object({
          team_member: Joi.string().required().messages({
            "string.base": "Team Member must be a valid ID",
            "any.required": "Team Member is required",
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
}

export default CreateForecastRequest;
