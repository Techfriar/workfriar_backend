import Joi from 'joi';

class ManageTimesheetRequest {

    static manageTimesheetSchema = Joi.object({
        timesheetid: Joi.string().required(), 
        status: Joi.string().valid( 'accepted', 'rejected').required(), 
        userid: Joi.string().alphanum().required(),
        notes: Joi.string()
            .optional()
            .max(200)
            .allow("")
            .messages({
                'string.base': 'Notes must be a string',
                'string.max': 'Notes must be less than or equal to 200 characters',
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
