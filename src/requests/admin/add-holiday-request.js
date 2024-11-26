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
    holiday_type: Joi.string().valid("National Holiday", "Public Holiday", "Restricted Holiday", "Office Shutdown").required(),
    start_date: Joi.date().required().messages({
      "date.base": "Please enter a valid start date.",
      "any.required": "Please enter the start date.",
    }),
    end_date: Joi.date()
      .required()
      .greater(Joi.ref("start_date"))
      .messages({
        "date.base": "Please enter a valid end date.",
        "date.greater": "End date must be after start date.",
        "any.required": "Please enter the end date.",
      }),
    location: Joi.string().valid("India", "Dubai").required(),
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
    const { error, value } = AddHolidayRequest.schema.validate(this.data, {
      abortEarly: false,
    });

    // Check if holiday exists with same name and date(s)
    const checkHolidayExists = await AddHolidayRequest.holidayRepo.checkHolidayExists(
        this.data.holiday_name,
        this.data.start_date,
        this.data.end_date,
        this.data.location
      );

    if (error || checkHolidayExists) {
      const validationErrors = {};
      error
        ? error.details.forEach((err) => {
            validationErrors[err.context.key] = err.message;
          })
        : [];

      if (checkHolidayExists) {
        validationErrors["holiday_name"] =
          "Holiday with this name and date already exists.";
      }

      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}

export default AddHolidayRequest;
