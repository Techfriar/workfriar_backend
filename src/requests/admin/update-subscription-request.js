import Joi from "joi";
import SubscriptionRepository from "../../repositories/admin/subscription-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

class UpdateSubscriptionRequest {
  static subscriptionRepo = new SubscriptionRepository();

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
    const existingSubscription = await UpdateSubscriptionRequest.subscriptionRepo.getSubscriptionById(
      this.subscriptionId
    );

    if (!existingSubscription) {
      throw new CustomValidationError([
        { field: "subscriptionId", message: "Subscription not found." },
      ]);
    }

    const fieldsToValidate = {};
    Object.keys(this.data).forEach((key) => {
      if (this.data[key] !== undefined) {
        fieldsToValidate[key] = this.data[key];
      }
    });

    const { error, value } = UpdateSubscriptionRequest.schema.fork(
      Object.keys(fieldsToValidate),
      (schema) => schema.required()
    ).validate(fieldsToValidate, { abortEarly: false });

    const validationErrors = [];

    if (error) {
      validationErrors.push(
        ...error.details.map((err) => ({
          field: err.context.key,
          message: err.message,
        }))
      );
    }

    if (validationErrors.length > 0) {
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default UpdateSubscriptionRequest;
