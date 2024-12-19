import Joi from "joi";
import HolidayRepository from "../../repositories/admin/holiday-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

class UpdateHolidayRequest {
  static holidayRepo = new HolidayRepository();

  static schema = Joi.object({
    holiday_name: Joi.string().required().messages({
      "string.empty": "Please enter the holiday name.",
      "any.required": "Please enter the holiday name.",
    }),
    holiday_type: Joi.string().required().messages({
      "string.empty": "Please enter the holiday type.",
      "any.required": "Please enter the holiday type.",
    }),
    start_date: Joi.date().required().messages({
      "date.base": "Please enter a valid date.",
      "any.required": "Please enter the holiday start date.",
    }),
    end_date: Joi.date().required().min(Joi.ref("start_date")).messages({
      "date.base": "Please enter a valid date.",
      "date.min": "End date must be on or after start date.",
      "any.required": "Please enter the holiday end date.",
    }),
    location: Joi.string().required().messages({
      "string.empty": "Please enter the location.",
      "any.required": "Please enter the location.",
    }),
    holidayId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid holiday ID format.",
        "any.required": "Holiday ID is required.",
      }),
  });

  constructor(req) {
    this.data = {
      holiday_name: req.body.holiday_name,
      holiday_type: req.body.holiday_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      location: req.body.location,
      holidayId: req.params.id,
    };
  }

  async validate() {
    // Perform schema validation
    const { error, value } = UpdateHolidayRequest.schema.validate(this.data, {
      abortEarly: false,
    });

    // Check if holiday exists with same name and date(s), excluding current holiday
    const checkHolidayExists =
      await UpdateHolidayRequest.holidayRepo.checkHolidayExists(
        this.data.holiday_name,
        this.data.start_date,
        this.data.end_date,
        this.data.location,
        this.data.holidayId
      );

    // Check if holiday with given ID exists
    const holidayExists = await UpdateHolidayRequest.holidayRepo.getHolidayById(
      this.data.holidayId
    );

    // Collect validation errors
    const validationErrors = [];

    if (error) {
      validationErrors.push(
        ...error.details.map((err) => ({
          field: err.context.key,
          message: err.message,
        }))
      );
    }

    if (checkHolidayExists) {
      validationErrors.push({
        field: "holiday_name",
        message: "Holiday with this name and date already exists.",
      });
    }

    if (!holidayExists) {
      validationErrors.push({
        field: "holiday",
        message: "Holiday not found.",
      });
    }

    // If there are any validation errors, throw a custom error
    if (validationErrors.length > 0) {
      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default UpdateHolidayRequest;
