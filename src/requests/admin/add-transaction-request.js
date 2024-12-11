import Joi from "joi";
import mongoose from "mongoose";
import TransactionRepository from "../../repositories/admin/transaction-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

class AddTransactionRequest {
    static transactionRepo = new TransactionRepository();

    static schema = Joi.object({
        transaction_date: Joi.date().required().messages({
            "date.base": "Please enter a valid transaction date.",
            "any.required": "Please enter the transaction date.",
        }),
        subscription_id: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        }).required().messages({
            "string.empty": "Please select the subscription.",
            "any.required": "Please select the subscription.",
            "any.invalid": "Please provide a valid subscription ID.",
        }),
        description: Joi.string().optional().allow("").allow(null),
        amount: Joi.string().required().messages({
            "string.empty": "Please enter the transaction amount.",
            "any.required": "Please enter the transaction amount.",
        }),
        payment_method: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        }).required().messages({
            "string.empty": "Please enter the payment method.",
            "any.required": "Please enter the payment method.",
            "any.invalid": "Please provide a valid payment method ID.",
        }),
        card_provider: Joi.string().optional().allow("").allow(null),
        card_holder_name: Joi.string().optional().allow("").allow(null),
        last_four_digits: Joi.string()
            .optional()
            .allow("").allow(null)
            .pattern(/^\d{4}$/)
            .messages({
                "string.pattern.base": "Last four digits must be exactly 4 digits.",
            }),
        card_expiry: Joi.string()
            .optional()
            .allow("").allow(null)
            .pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
            .messages({
                "string.pattern.base": "Card expiry must be in MM/YY format.",
            }),
        license_count: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        }).required().messages({
            "string.empty": "Please enter the license count.",
            "any.required": "Please enter the license count.",
            "any.invalid": "Please provide a valid license count ID.",
        }),
        next_due_date: Joi.string().custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        }).optional().allow("").allow(null).messages({
            "any.invalid": "Please provide a valid next due date ID.",
        }),
    });

    constructor(req) {
        this.data = {
            transaction_date: req.body.transaction_date,
            subscription_id: req.body.subscription_id,
            description: req.body.description,
            amount: req.body.amount,
            payment_method: req.body.payment_method,
            card_provider: req.body.card_provider,
            card_holder_name: req.body.card_holder_name,
            last_four_digits: req.body.last_four_digits,
            card_expiry: req.body.card_expiry,
            license_count: req.body.license_count,
            next_due_date: req.body.next_due_date,
        };
    }

    async validate() {
        // Validate using Joi
        const { error, value } = AddTransactionRequest.schema.validate(this.data, {
            abortEarly: false,
        });

        // Collect validation errors
        const validationErrors = {};
        if (error) {
            error.details.forEach((err) => {
                validationErrors[err.context.key] = err.message;
            });
        }

        // Check if subscription_id exists
        if (value.subscription_id) {
            try {
                const subscriptionExists = await AddTransactionRequest.transactionRepo.checkSubscriptionExists(
                    value.subscription_id
                );
                
                if (!subscriptionExists) {
                    validationErrors["subscription_id"] = "The selected subscription does not exist.";
                }
            } catch (error) {
                validationErrors["subscription_id"] = "Error validating subscription.";
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