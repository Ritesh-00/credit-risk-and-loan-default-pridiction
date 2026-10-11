import { validationResult } from 'express-validator';
import { ApiError } from '../utils/apiError.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(ApiError.badRequest('Validation failed for one or more fields', formattedErrors, ERROR_CODES.VALIDATION_ERROR));
  }
  next();
};
