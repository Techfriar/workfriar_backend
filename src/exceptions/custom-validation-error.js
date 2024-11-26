/**
 * CustomValidationError class extends the built-in Error class
 */
export class CustomValidationError extends Error {
    constructor(errors) {
      super(errors);
      this.errors = errors;
    }
  }

