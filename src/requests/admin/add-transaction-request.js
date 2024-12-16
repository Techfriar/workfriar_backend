import Joi from "joi";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import TransactionRepository from "../../repositories/admin/transaction-repository.js";
import mongoose from "mongoose";

class AddTransactionRequest {
  static transactionRepo = new TransactionRepository();

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
    transaction_currency: Joi.string().required().default("USD").messages({
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
    card_expiry: Joi.string().when("payment_method", {
      is: Joi.string().valid("Credit Card", "Debit Card"),
      then: Joi.string()
        .pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
        .required()
        .messages({
          "string.pattern.base": "Card expiry must be in MM/YY format.",
          "any.required": "Please enter the card expiry date.",
        }),
      otherwise: Joi.string().optional().allow("").allow(null),
    }),
    license_count: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .required()
      .messages({
        "string.empty": "Please enter the license count.",
        "any.required": "Please enter the license count.",
        "any.invalid": "Invalid license count selected.",
      }),
    next_due_date: Joi.date().optional().allow("").allow(null),
    receipts: Joi.array()
      .items(Joi.string())
      .optional()
      .allow(null)
      .default([])
      .messages({
        "array.base": "Receipts must be an array.",
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
      card_expiry: req.body.card_expiry,
      license_count: req.body.license_count,
      next_due_date: req.body.next_due_date,
      receipts: Array.isArray(req.body.receipts)
      ? req.body.receipts
      : req.body.receipts
      ? [req.body.receipts]
      : [],
    };
  }

  async validate() {
    const { error, value } = AddTransactionRequest.schema.validate(this.data, {
      abortEarly: false,
    });

    const validationErrors = {};
    if (error) {
      error.details.forEach((err) => {
        validationErrors[err.context.key] = err.message;
      });
    }

    // Validate subscription exists
    if (value.subscription_name) {
      const subscriptionExists =
        await AddTransactionRequest.transactionRepo.checkSubscriptionExists(
          value.subscription_name
        );
      if (!subscriptionExists) {
        validationErrors["subscription_name"] =
          "Selected subscription does not exist.";
      }
    }

    // If there are any errors, throw CustomValidationError
    if (Object.keys(validationErrors).length > 0) {
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default AddTransactionRequest;
