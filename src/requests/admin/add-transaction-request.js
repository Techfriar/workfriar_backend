import Joi from "joi";
import mongoose from "mongoose";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import SubscriptionRepository from "../../repositories/admin/subscription-repository.js";

class AddTransactionRequest {
  static subscriptionRepo = new SubscriptionRepository();

  static schema = Joi.object({
    transaction_date: Joi.date().required().messages({
      "date.base": "Please enter a valid transaction date.",
      "any.required": "Please enter the transaction date.",
    }),
    subscription_name: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .required()
      .messages({
        "string.empty": "Please select a subscription.",
        "any.required": "Please select a subscription.",
        "any.invalid": "Invalid subscription selected.",
      }),
    description: Joi.string().optional().allow("").allow(null),
    transaction_currency: Joi.string().required().messages({
      "string.empty": "Please enter the transaction currency.",
      "any.required": "Please enter the transaction currency.",
    }),
    transaction_amount: Joi.string().required().messages({
      "string.empty": "Please enter the transaction amount.",
      "any.required": "Please enter the transaction amount.",
    }),
    payment_method: Joi.string()
      .valid(
        "Cash",
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
        "Paypal",
        "Other"
      )
      .required()
      .messages({
        "any.only": "Invalid payment method selected.",
        "any.required": "Please select a payment method.",
      }),
    card_provider: Joi.string().when("payment_method", {
      is: Joi.string().valid("Credit Card", "Debit Card"),
      then: Joi.string().required().messages({
        "string.empty": "Please enter the card provider.",
        "any.required": "Please enter the card provider.",
      }),
      otherwise: Joi.string().optional().allow("").allow(null),
    }),
    card_holder_name: Joi.string().when("payment_method", {
      is: Joi.string().valid("Credit Card", "Debit Card"),
      then: Joi.string().required().messages({
        "string.empty": "Please enter the card holder name.",
        "any.required": "Please enter the card holder name.",
      }),
      otherwise: Joi.string().optional().allow("").allow(null),
    }),
    last_four_digits: Joi.string().when("payment_method", {
      is: Joi.string().valid("Credit Card", "Debit Card"),
      then: Joi.string()
        .length(4)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          "string.length": "Card number must be exactly 4 digits.",
          "string.pattern.base": "Card number must contain only digits.",
          "any.required": "Please enter the last four digits of the card.",
        }),
      otherwise: Joi.string().optional().allow("").allow(null),
    }),
  });

  constructor(req) {
    this.data = {
      transaction_date: req.body.transaction_date,
      subscription_name: req.body.subscription_name,
      description: req.body.description,
      transaction_currency: req.body.transaction_currency,
      transaction_amount: req.body.transaction_amount,
      payment_method: req.body.payment_method,
      card_provider: req.body.card_provider,
      card_holder_name: req.body.card_holder_name,
      last_four_digits: req.body.last_four_digits,
    };
  }

  async validate() {
    const { error, value } = AddTransactionRequest.schema.validate(this.data, {
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

    if (value.subscription_name) {
      const subscription = await AddTransactionRequest.subscriptionRepo.getSubscriptionById(
        value.subscription_name
      );

      if (!subscription) {
        validationErrors.push({
          field: "subscription_name",
          message: "Selected subscription does not exist.",
        });
      }
    }

    if (validationErrors.length > 0) {
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default AddTransactionRequest;
