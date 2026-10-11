import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export class ApiError extends Error {
  constructor(
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message = 'Internal Server Error',
    errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = null, errorCode = ERROR_CODES.VALIDATION_ERROR) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errorCode, details);
  }

  static unauthorized(message = 'Unauthorized access', errorCode = ERROR_CODES.UNAUTHORIZED) {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, errorCode);
  }

  static forbidden(message = 'Forbidden access', errorCode = ERROR_CODES.FORBIDDEN) {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = ERROR_CODES.NOT_FOUND) {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, errorCode);
  }

  static conflict(message = 'Resource already exists', errorCode = ERROR_CODES.CONFLICT) {
    return new ApiError(HTTP_STATUS.CONFLICT, message, errorCode);
  }

  static databaseError(message = 'Database operation failed', details = null) {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, ERROR_CODES.DATABASE_ERROR, details);
  }

  static mlServiceUnavailable(message = 'ML prediction service unavailable', details = null) {
    return new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, message, ERROR_CODES.ML_SERVICE_UNAVAILABLE, details);
  }
}
