import Joi from "joi";
import ProjectRepository from "../../repositories/admin/project-repository.js";
import UserRepository from "../../repositories/admin/user-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
class AddProjectRequest {
  static projectRepo = new ProjectRepository();
  static userRepo = new UserRepository();

  static schema = Joi.object({
    clientName: Joi.string().required().messages({
      "string.empty": "Please enter the client name.",
      "any.required": "Please enter the client name.",
    }),
    projectName: Joi.string().required().messages({
      "string.empty": "Please enter the project name.",
      "any.required": "Please enter the project name.",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Please enter the project description.",
      "any.required": "Please enter the project description.",
    }),
    plannedStartDate: Joi.required().messages({
      "date.base": "Please enter a valid planned start date.",
      "any.required": "Please enter the planned start date.",
    }),
    plannedEndDate: Joi.optional().allow("").allow(null),
    actualStartDate: Joi.date().optional().allow("").allow(null),
    actualEndDate: Joi.date().optional().allow("").allow(null),
    // projectLead: Joi.string()
    //   .regex(/^[0-9a-fA-F]{24}$/)
    //   .required()
    //   .messages({
    //     "string.empty": "Please specify the project lead.",
    //     "any.required": "Please specify the project lead.",
    //   }),
    billingModel: Joi.string().optional().allow("").allow(null),
    projectLogo: Joi.object().optional().allow("").allow(null),
    openForTimeEntry: Joi.string().valid("opened", "closed").required(),
    status: Joi.string()
      .valid("Not Started", "In Progress", "Completed", "On Hold", "Cancelled")
      .required(),
  });

  constructor(req) {
    const file = req.files["projectLogo"] ? req.files["projectLogo"][0] : null;

    this.data = {
      clientName: req.body.clientName,
      projectName: req.body.projectName,
      description: req.body.description,
      plannedStartDate: req.body.plannedStartDate,
      plannedEndDate: req.body.plannedEndDate,
      actualStartDate: req.body.actualStartDate,
      actualEndDate: req.body.actualEndDate,
    //   projectLead: req.body.projectLead,
      billingModel: req.body.billingModel,
      projectLogo: file,
      openForTimeEntry: req.body.openForTimeEntry,
      status: req.body.status,
    };
  }

  async validate() {
    const { error, value } = AddProjectRequest.schema.validate(this.data, {
      abortEarly: false,
    });

    // Check if project exists
    const checkProjectExists =
      await AddProjectRequest.projectRepo.checkProjectExists(
        this.data.projectName,
        this.data.clientName
      );

    // Check if project lead exists
    // const checkProjectLead = await AddProjectRequest.userRepo.getUserById(
    //   this.data.projectLead
    // );

    if (error || checkProjectExists) {
      const validationErrors = {};
      error
        ? error.details.forEach((err) => {
            validationErrors[err.context.key] = err.message;
          })
        : [];

      if (checkProjectExists) {
        validationErrors["projectName"] =
          "Project with this name already exists for the client.";
      }

      

      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default AddProjectRequest;
