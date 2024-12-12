import Joi from "joi";
import SubscriptionRepository from "../../repositories/admin/subscription-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

class UpdateSubscriptionRequest {
  static subscriptionRepo = new SubscriptionRepository();

  // Define the validation schema
  static schema = Joi.object({
    subscription_name: Joi.string().optional().allow("").allow(null),
    provider: Joi.string().optional().allow("").allow(null),
    license_count: Joi.string().optional().allow("").allow(null),
    cost: Joi.string().optional().allow("").allow(null),
    billing_cycle: Joi.string().optional().allow("").allow(null),
    next_due_date: Joi.date().optional().allow("").allow(null),
    status: Joi.string().optional().allow("").allow(null),
  });

  constructor(req) {
    this.subscriptionId = req.params.id;
    this.data = req.body;
  }

  async validate() {
    // Ensure the subscription exists first
    const existingSubscription = await UpdateSubscriptionRequest.subscriptionRepo.getSubscriptionById(
      this.subscriptionId
    );

    // Validate only the fields that are present in the request
    const fieldsToValidate = {};
    Object.keys(this.data).forEach(key => {
      if (this.data[key] !== undefined) {
        fieldsToValidate[key] = this.data[key];
      }
    });

    // Perform validation only on the fields present in the request
    const { error, value } = UpdateSubscriptionRequest.schema.fork(
      Object.keys(fieldsToValidate), 
      (schema) => schema.required()
    ).validate(fieldsToValidate, {
      abortEarly: false,
      allowUnknown: true
    });

    // Handle validation errors
    if (error) {
      const validationErrors = {};
      error.details.forEach((err) => {
        validationErrors[err.context.key] = err.message;
      });

      throw new CustomValidationError(validationErrors);
    }

    // Remove any undefined values to prevent overwriting existing data
    const sanitizedData = Object.fromEntries(
      Object.entries(this.data).filter(([_, v]) => v !== undefined)
    );

    return sanitizedData;
  }
}

export default UpdateSubscriptionRequest;