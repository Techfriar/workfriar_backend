import Joi from "joi";
import HolidayRepository from "../../repositories/admin/holiday-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

class AddHolidayRequest {
  static holidayRepo = new HolidayRepository();

  static schema = Joi.object({
    holiday_name: Joi.string().required().messages({
      "string.empty": "Please enter the holiday name.",
      "any.required": "Please enter the holiday name.",
    }),
    holiday_type: Joi.string()
      .valid(
        "National Holiday",
        "Public Holiday",
        "Restricted Holiday",
        "Office Shutdown"
      )
      .required()
      .messages({
        "any.only": "Invalid holiday type. Please select a valid type.",
        "any.required": "Please select the holiday type.",
      }),
    start_date: Joi.date().required().messages({
      "date.base": "Please enter a valid start date.",
      "any.required": "Please enter the start date.",
    }),
    end_date: Joi.date().required().min(Joi.ref("start_date")).messages({
      "date.base": "Please enter a valid end date.",
      "date.min": "End date must be on or after start date.",
      "any.required": "Please enter the end date.",
    }),
    location: Joi.string().valid("India", "Dubai").required().messages({
      "any.only": "Invalid location. Please select a valid location.",
      "any.required": "Please select the location.",
    }),
  });

  constructor(req) {
    this.data = {
      holiday_name: req.body.holiday_name,
      holiday_type: req.body.holiday_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      location: req.body.location,
    };
  }

  async validate() {
    // Perform schema validation
    const { error, value } = AddHolidayRequest.schema.validate(this.data, {
      abortEarly: false,
    });

    // Check if holiday exists with the same name and date(s)
    const checkHolidayExists =
      await AddHolidayRequest.holidayRepo.checkHolidayExists(
        this.data.holiday_name,
        this.data.start_date,
        this.data.end_date,
        this.data.location
      );

    if (error || checkHolidayExists) {
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

      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default AddHolidayRequest;
