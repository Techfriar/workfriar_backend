/**
 * CustomValidationError class extends the built-in Error class
 */
export class CustomValidationError extends Error {
    constructor(errors) {
      super(errors);
      this.errors = errors;
    }
  }


// in request
//throw new CustomValidationError(validationErrors);

//in controller
// catch (error) {
//   if (error instanceof CustomValidationError) {
//       res.status(422).json({
//         status: false,
//         message: '',
//         errors: error.errors,
//       });
//     } else {
//       return res.status(500).json({
//           status: false,
//           message: 'Failed to update admin.',
//           errors: error.message || error,
//       });
//   }
// }