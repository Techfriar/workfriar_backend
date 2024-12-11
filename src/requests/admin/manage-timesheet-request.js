import Joi from 'joi';

class ManageTimesheetRequest {

    static manageTimesheetSchema = Joi.object({
        timesheetd: Joi.string().required(), 
        status: Joi.string().valid( 'approved', 'rejected').required(), 
        userid: Joi.string().alphanum().required(),
        note: Joi.string()
            .min(10)
            .max(100)
            .required()
            .required()
            .messages({
                'string.base': 'Notes must be a string',
                'string.empty': 'Notes cannot be empty',
                'string.min': 'Notes must be at least 10 characters long',
                'string.max': 'Notes must be less than or equal to 200 characters',
                'any.required': 'Notes is required'
            }),
    });
  


    async validateData(data) {
        const { error } = ManageTimesheetRequest.manageTimesheetSchema.validate(data);
        if (error) {
            return { isValid: false, message: error.details.map(err => err.message) };
        }
        else
        {
            return { isValid: true, message: "No errors" };
        }
        }
}

export default ManageTimesheetRequest;
