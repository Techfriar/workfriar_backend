import Joi from "joi";
import mongoose from "mongoose";
import SubscriptionRepository from "../../repositories/admin/subscription-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import Project from "../../models/projects.js";

class AddSubscriptionRequest {
  static subscriptionRepo = new SubscriptionRepository();

  static schema = Joi.object({
    subscription_name: Joi.string().required().messages({
      "string.empty": "Please enter the subscription name.",
      "any.required": "Please enter the subscription name.",
    }),
    provider: Joi.string().required().messages({
      "string.empty": "Please enter the provider.",
      "any.required": "Please enter the provider.",
    }),
    license_count: Joi.string().required().messages({
      "string.empty": "Please enter the license count.",
      "any.required": "Please enter the license count.",
    }),
    cost: Joi.string().required().messages({
      "string.empty": "Please enter the cost.",
      "any.required": "Please enter the cost.",
    }),
    billing_cycle: Joi.string()
      .valid(
        "Monthly",
        "Quarterly",
        "Annually",
        "Pay As You Go",
        "One Time Payment"
      )
      .required()
      .messages({
        "any.only": "Invalid billing cycle selected.",
        "any.required": "Please select a billing cycle.",
      }),
    currency: Joi.string().required().messages({
      "string.empty": "Please enter the currency.",
      "any.required": "Please enter the currency.",
    }),
    payment_method: Joi.string().required().messages({
      "string.empty": "Please enter the payment method.",
      "any.required": "Please enter the payment method.",
    }),
    status: Joi.string().valid("Active", "Pending", "Expired").required().messages({
      "any.only": "Invalid status selected.",
      "any.required": "Please select a subscription status.",
    }),
    description: Joi.string().optional().allow("").allow(null),
    next_due_date: Joi.date().optional().allow("").allow(null),
    type: Joi.string().valid("Common", "Project Specific").required().messages({
      "any.only": "Type must be either 'Common' or 'Project Specific'.",
      "any.required": "Please select the subscription type.",
    }),
    project_name: Joi.alternatives().conditional("type", {
      is: "Project Specific",
      then: Joi.string()
        .custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        })
        .required()
        .messages({
          "any.required":
            "Project name is required for Project Specific subscriptions.",
          "any.invalid": "Invalid project selected.",
        }),
      otherwise: Joi.string().allow(null, ""),
    }),
  });

  constructor(req) {
    this.data = {
      subscription_name: req.body.subscription_name,
      provider: req.body.provider,
      license_count: req.body.license_count,
      cost: req.body.cost,
      billing_cycle: req.body.billing_cycle,
      currency: req.body.currency,
      payment_method: req.body.payment_method,
      status: req.body.status,
      description: req.body.description,
      next_due_date: req.body.next_due_date,
      type: req.body.type,
      project_name:
        req.body.type === "Project Specific" ? req.body.project_name : null,
    };
  }

  async validate() {
    const { error, value } = AddSubscriptionRequest.schema.validate(this.data, {
      abortEarly: false,
    });

    const validationErrors = [];

    if (error) {
      validationErrors.push(
        ...error.details.map((err) => ({
          field: err.context.key,
          message: err.message,
        }))
      );
    }

    if (value.type === "Project Specific" && value.project_name) {
      const project = await Project.findById(value.project_name);
      if (!project) {
        validationErrors.push({
          field: "project_name",
          message: "Selected project does not exist.",
        });
      }
    }

    if (value.subscription_name) {
      const existingSubscription =
        await AddSubscriptionRequest.subscriptionRepo.checkSubscriptionExists(
          value.subscription_name
        );
      if (existingSubscription) {
        validationErrors.push({
          field: "subscription_name",
          message: "A subscription with this name already exists.",
        });
      }
    }

    if (validationErrors.length > 0) {
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default AddSubscriptionRequest;
